import { NextResponse } from 'next/server';
import { verifyAdminServerRequest } from '@/lib/auth/serverAuth';
import { RATE_LIMITS } from '@/config/rateLimit';
import { getClientIp, checkRateLimit, createRateLimitResponse } from '@/lib/security/rateLimit';
import { validateAiGenerateInput } from '@/lib/validation/schemas';

export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Yetkisiz işlem. Yapay zeka içerik üretimi yalnızca yetkili yöneticiler içindir.' },
        { status: 401 }
      );
    }

    // 1. IP-based Rate Limit Check (10 requests / 1 hour)
    const clientIp = getClientIp(req);
    const ipCheck = checkRateLimit(`aiGenerate:ip:${clientIp}`, RATE_LIMITS.aiGenerate.ip);
    if (!ipCheck.allowed) {
      return createRateLimitResponse(ipCheck);
    }

    // 2. Admin Account-based Rate Limit Check (10 requests / 1 hour)
    const adminEmail = (adminUser.email || adminUser.uid).toLowerCase();
    const accountCheck = checkRateLimit(`aiGenerate:account:${adminEmail}`, RATE_LIMITS.aiGenerate.account);
    if (!accountCheck.allowed) {
      return createRateLimitResponse(accountCheck);
    }

    const rawBody = await req.json().catch(() => ({}));
    const validation = validateAiGenerateInput(rawBody);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || 'Makale konusu 3 ile 1000 karakter arasında olmalıdır.' },
        { status: 400 }
      );
    }

    const { topic } = validation.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API anahtarı bulunamadı.' }, { status: 500 });
    }

    // Google Gemini API çağrısı
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Sen profesyonel bir SEO içerik yazarı ve dijital pazarlama uzmanısın. KvK Dijital Çözümler (bir web tasarım ve yazılım ajansı) için "${topic}" konusunda son derece akıcı, profesyonel ve bilgilendirici bir blog makalesi yazacaksın.

KURALLAR:
1. Makale kesinlikle HTML formatında olmalıdır. React-Quill editörüne doğrudan yüklenecek şekilde H2, H3, P, UL, LI, STRONG etiketlerini kullan. Makalenin başına H1 ekleme.
2. Anlatım dili kurumsal ama sıkıcı olmayan, anlaşılır ve akıcı olmalıdır (Biz/Siz dili).
3. Makale SEO uyumlu olmalı, anahtar kelimeleri doğal bir şekilde metin içine yaymalısın.
4. Çıktı sadece HTML kodu olmalıdır, başına veya sonuna markdown (\`\`\`html) ekleme, SADECE saf HTML kodunu ver.
5. Makale uzunluğu ortalama 400-600 kelime olsun.`
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json({ error: `API Hatası: ${errorData?.error?.message || 'Yapay zeka yanıt veremedi.'}` }, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Markdown formatı kalıntısı varsa temizle
    const cleanHtml = generatedText.replace(/^```html\n?|```$/g, '').trim();

    return NextResponse.json({ content: cleanHtml });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: 'Bir hata oluştu.' }, { status: 500 });
  }
}
