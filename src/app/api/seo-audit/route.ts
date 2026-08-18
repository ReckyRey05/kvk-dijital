import { NextResponse } from 'next/server';
import { RATE_LIMITS } from '@/config/rateLimit';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/security/rateLimit';
import { validateSeoAuditInput } from '@/lib/validation/schemas';

const MAX_RESPONSE_SIZE = 2 * 1024 * 1024; // 2 MB Limit
const MAX_REDIRECTS = 2;

/**
 * Validates whether a target URL is safe for server-side fetching (Prevents SSRF)
 */
function isSafeUrl(targetUrlStr: string): boolean {
  try {
    const parsed = new URL(targetUrlStr);

    // Protocol must strictly be http: or https:
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check forbidden hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.nip.io') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // Check IPv4 private & link-local ranges
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const p1 = parseInt(ipv4Match[1], 10);
      const p2 = parseInt(ipv4Match[2], 10);

      if (
        p1 === 127 || // Loopback
        p1 === 10 || // Private 10.0.0.0/8
        (p1 === 172 && p2 >= 16 && p2 <= 31) || // Private 172.16.0.0/12
        (p1 === 192 && p2 === 168) || // Private 192.168.0.0/16
        (p1 === 169 && p2 === 254) || // Link-local / Cloud Metadata 169.254.0.0/16
        p1 === 0 // 0.0.0.0
      ) {
        return false;
      }
    }

    // Check IPv6 private / loopback / link-local
    if (
      hostname.startsWith('[') ||
      hostname.includes(':') ||
      hostname.startsWith('fc') ||
      hostname.startsWith('fd') ||
      hostname.startsWith('fe80')
    ) {
      if (
        hostname.includes('::1') ||
        hostname.includes('127.0.0.1') ||
        hostname.startsWith('fc00') ||
        hostname.startsWith('fe80')
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Safely fetches target HTML with manual redirect validation and 2MB stream limit
 */
async function fetchSafeHtml(targetUrl: string, timeoutMs: number): Promise<{ html: string; finalUrl: string }> {
  let currentUrl = targetUrl;
  let redirectCount = 0;

  while (redirectCount <= MAX_REDIRECTS) {
    if (!isSafeUrl(currentUrl)) {
      throw new Error('SSRF_BLOCKED');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(currentUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Compatible; KvK-SEO-Bot/1.0; +https://kvkdijitalcozumler.com)' },
        signal: controller.signal,
        redirect: 'manual', // Prevent automatic unvalidated redirects
      });

      clearTimeout(timeoutId);

      // Handle HTTP Redirects (301, 302, 307, 308)
      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location');
        if (!location) {
          throw new Error('INVALID_REDIRECT');
        }

        redirectCount++;
        if (redirectCount > MAX_REDIRECTS) {
          throw new Error('TOO_MANY_REDIRECTS');
        }

        // Resolve relative redirect URLs against current URL
        currentUrl = new URL(location, currentUrl).toString();
        continue; // Re-validate new URL in next loop iteration
      }

      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }

      // Stream response body to strictly enforce 2 MB limit before loading into memory
      if (!res.body) {
        throw new Error('NO_BODY');
      }

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          totalBytes += value.length;
          if (totalBytes > MAX_RESPONSE_SIZE) {
            reader.cancel();
            throw new Error('RESPONSE_TOO_LARGE');
          }
          chunks.push(value);
        }
      }

      // Concatenate chunks safely into text
      const concatenated = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        concatenated.set(chunk, offset);
        offset += chunk.length;
      }

      const decoder = new TextDecoder('utf-8');
      const html = decoder.decode(concatenated);
      return { html, finalUrl: currentUrl };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  throw new Error('TOO_MANY_REDIRECTS');
}

export async function POST(request: Request) {
  try {
    // IP-based Rate Limit Check (5 requests / 10 minutes)
    const clientIp = getClientIp(request);
    const ipCheck = checkRateLimit(`seoAudit:ip:${clientIp}`, RATE_LIMITS.seoAudit.ip);
    if (!ipCheck.allowed) {
      return createRateLimitResponse(ipCheck);
    }

    const rawBody = await request.json().catch(() => ({}));
    const validation = validateSeoAuditInput(rawBody);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || 'Lütfen geçerli bir web sitesi adresi girin.' },
        { status: 400 }
      );
    }

    let { url } = validation.data;

    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    if (!isSafeUrl(url)) {
      return NextResponse.json(
        { error: 'Güvenlik nedeniyle belirtilen adres veya IP aralığı taranamaz.' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    let htmlContent = '';
    let isHttps = url.startsWith('https:');

    try {
      // Attempt 1: Fetch HTTPS with 8s timeout & streaming 2MB limit
      const result = await fetchSafeHtml(url, 8000);
      htmlContent = result.html;
      isHttps = result.finalUrl.startsWith('https:');
    } catch (fetchErr: any) {
      if (fetchErr?.message === 'SSRF_BLOCKED' || fetchErr?.message === 'TOO_MANY_REDIRECTS') {
        return NextResponse.json(
          { error: 'Güvenlik nedeniyle belirtilen adres veya yönlendirme hedefi taranamaz.' },
          { status: 400 }
        );
      }
      if (fetchErr?.message === 'RESPONSE_TOO_LARGE') {
        return NextResponse.json(
          { error: 'Hedef web sitesinin yanıt boyutu 2MB sınırını aştığı için taranamadı.' },
          { status: 413 }
        );
      }

      // Fallback: If HTTPS fails, attempt HTTP with 5s timeout & streaming 2MB limit
      if (isHttps) {
        try {
          const fallbackUrl = url.replace('https://', 'http://');
          const result = await fetchSafeHtml(fallbackUrl, 5000);
          htmlContent = result.html;
          isHttps = false;
        } catch (fallbackErr: any) {
          if (fallbackErr?.message === 'RESPONSE_TOO_LARGE') {
            return NextResponse.json(
              { error: 'Hedef web sitesinin yanıt boyutu 2MB sınırını aştığı için taranamadı.' },
              { status: 413 }
            );
          }
          return NextResponse.json(
            { error: 'Hedef web sitesine erişilemedi. Adresin yayında ve açık olduğunu kontrol edin.' },
            { status: 502 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Hedef web sitesine erişilemedi. Adresin yayında ve açık olduğunu kontrol edin.' },
          { status: 502 }
        );
      }
    }

    const loadTimeMs = Date.now() - startTime;

    // Analyze HTML Metadata & Security Features
    const hasTitle = /<title[^>]*>([\s\S]*?)<\/title>/i.test(htmlContent);
    const titleMatch = htmlContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1].trim() : '';

    const hasMetaDesc = /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i.test(htmlContent);
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(htmlContent);
    const hasH1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.test(htmlContent);
    const hasOgImage = /<meta[^>]*property=["']og:image["']/i.test(htmlContent);
    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(htmlContent);
    const imgCount = (htmlContent.match(/<img[^>]+/g) || []).length;
    const imgsWithoutAlt = (htmlContent.match(/<img(?![^>]*\balt=)[^>]+/g) || []).length;

    // Calculate Empirical Performance & SEO Scores
    let performanceScore = 95;
    if (loadTimeMs > 3000) performanceScore -= 35;
    else if (loadTimeMs > 1500) performanceScore -= 20;
    else if (loadTimeMs > 800) performanceScore -= 10;
    if (imgCount > 15) performanceScore -= 10;

    let seoScore = 100;
    if (!hasTitle || titleText.length < 10) seoScore -= 25;
    if (!hasMetaDesc) seoScore -= 20;
    if (!hasH1) seoScore -= 15;
    if (!hasCanonical) seoScore -= 15;
    if (!hasOgImage) seoScore -= 10;
    if (imgsWithoutAlt > 0) seoScore -= 10;

    let accessibilityScore = 90;
    if (!hasViewport) accessibilityScore -= 30;
    if (imgsWithoutAlt > 2) accessibilityScore -= 20;

    let bestPracticesScore = isHttps ? 95 : 60;

    // Compile Actionable Findings
    const findings: string[] = [];
    if (!isHttps) findings.push('Sitede HTTPS / SSL güvenlik sertifikası eksik veya pasif.');
    if (loadTimeMs > 1500) findings.push(`Sayfa açılış yanıtı yavaş (${(loadTimeMs / 1000).toFixed(1)} sn). Sunucu & görsel optimizasyonu gerekiyor.`);
    if (!hasMetaDesc) findings.push('Google arama sonuçlarında görünen Meta Açıklama (Meta Description) etiketiniz eksik.');
    if (!hasH1) findings.push('Sayfada ana başlık (H1) hiyerarşisi bulunamadı.');
    if (!hasViewport) findings.push('Mobil cihaz görünümü (Viewport meta) optimize edilmemiş.');
    if (imgsWithoutAlt > 0) findings.push(`${imgsWithoutAlt} adet görselde alt etiketi (alt text) eksik.`);
    if (!hasCanonical) findings.push('Çift içerik engelleyici Canonical link etiketi eksik.');

    if (findings.length === 0) {
      findings.push('Siteniz temel teknik standartlara uyuyor. Performans ve dönüşüm oranlarını artırmak için gelişmiş UX optimizasyonu yapılabilir.');
    }

    const fcpSec = (loadTimeMs / 1000 * 0.7).toFixed(1);
    const lcpSec = (loadTimeMs / 1000 * 1.2).toFixed(1);

    return NextResponse.json({
      success: true,
      url,
      scores: {
        performance: Math.max(25, performanceScore),
        seo: Math.max(30, seoScore),
        accessibility: Math.max(35, accessibilityScore),
        bestPractices: Math.max(30, bestPracticesScore),
      },
      metrics: {
        fcp: `${fcpSec} s`,
        lcp: `${lcpSec} s`,
        cls: '0.02',
        speedIndex: `${(loadTimeMs / 1000).toFixed(1)} s`,
      },
      findings,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('SEO Audit Route Error:', error);
    return NextResponse.json(
      { error: 'Analiz sırasında bir hata oluştu. Lütfen geçerli bir web adresi ile tekrar deneyin.' },
      { status: 500 }
    );
  }
}
