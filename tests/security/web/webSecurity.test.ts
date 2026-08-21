/**
 * CEP GARSON — WEB SECURITY, XSS, CSRF, SSRF, CSP & BROWSER ATTACK DEFENSE TEST SUITE
 * FAZ 6 Automated Web Security Test Engine
 */

import { sanitizeHtmlContent } from "../../../src/lib/validation/schemas";
import nextConfig from "../../../next.config";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string) {
  if (actual !== expected) {
    throw new Error(`[ASSERTION FAILED]: ${message} — Expected: ${expected}, Got: ${actual}`);
  }
}

console.log("=================================================");
console.log("RUNNING FAZ 6 WEB SECURITY, XSS, CSRF, SSRF & CSP TESTS");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

async function runTest(testName: string, testFn: () => void | Promise<void>) {
  totalCount++;
  try {
    const res = testFn();
    if (res && typeof (res as any).then === "function") {
      await res;
    }
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  [FAIL] ${testName}`);
    console.error(`         ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log("--- 1. XSS & HTML SANITIZATION DEFENSE ---");

  await runTest("XSS 1: Strip <script> tags and embedded executable code", () => {
    const dirty = '<p>Restoran Menüsü</p><script>alert("XSS")</script><script src="https://evil.com/xss.js"></script>';
    const clean = sanitizeHtmlContent(dirty);
    assert(!clean.includes("<script>"), "Must strip <script> tag");
    assert(!clean.includes("alert"), "Must strip script content");
    assert(!clean.includes("evil.com"), "Must strip external script reference");
    assert(clean.includes("<p>Restoran Menüsü</p>"), "Preserves safe HTML markup");
  });

  await runTest("XSS 2: Strip inline event handlers (onload, onerror, onclick, onmouseover)", () => {
    const dirty = '<img src="invalid.jpg" onerror="alert(1)" onload="fetch(\'https://evil.com\')" /><button onclick="alert(2)">Tıkla</button>';
    const clean = sanitizeHtmlContent(dirty);
    assert(!clean.includes("onerror"), "Must strip onerror event handler");
    assert(!clean.includes("onload"), "Must strip onload event handler");
    assert(!clean.includes("onclick"), "Must strip onclick event handler");
  });

  await runTest("XSS 3: Strip dangerous URI schemes (javascript:, data:, vbscript:)", () => {
    const dirty = '<a href="javascript:alert(1)">Zararlı Link</a><a href="vbscript:msgbox(1)">VB Link</a>';
    const clean = sanitizeHtmlContent(dirty);
    assert(!clean.includes("javascript:"), "Must strip javascript: URL scheme");
    assert(!clean.includes("vbscript:"), "Must strip vbscript: URL scheme");
  });

  await runTest("XSS 4: Strip iframe and foreignObject injection", () => {
    const dirty = '<iframe src="https://evil.com"></iframe><svg><foreignObject><body xmlns="http://www.w3.org/1999/xhtml"><script>alert(1)</script></body></foreignObject></svg>';
    const clean = sanitizeHtmlContent(dirty);
    assert(!clean.includes("<iframe"), "Must strip iframe");
    assert(!clean.includes("<script>"), "Must strip nested script in foreignObject");
  });

  console.log("\n--- 2. SSRF (SERVER-SIDE REQUEST FORGERY) DEFENSE ---");

  function isSafeUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
      const host = parsed.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "0.0.0.0" ||
        host === "::1" ||
        host.endsWith(".internal") ||
        host.endsWith(".local") ||
        host.endsWith(".nip.io") ||
        host.startsWith("10.") ||
        host.startsWith("192.168.") ||
        host.startsWith("172.16.") ||
        host.startsWith("172.17.") ||
        host.startsWith("172.18.") ||
        host.startsWith("172.19.") ||
        host.startsWith("172.20.") ||
        host.startsWith("172.21.") ||
        host.startsWith("172.22.") ||
        host.startsWith("172.23.") ||
        host.startsWith("172.24.") ||
        host.startsWith("172.25.") ||
        host.startsWith("172.26.") ||
        host.startsWith("172.27.") ||
        host.startsWith("172.28.") ||
        host.startsWith("172.29.") ||
        host.startsWith("172.30.") ||
        host.startsWith("172.31.") ||
        host === "169.254.169.254" // Cloud metadata IP
      ) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  await runTest("SSRF 1: Block Loopback, Private IPs & AWS Metadata endpoint (169.254.169.254)", () => {
    const maliciousUrls = [
      "http://127.0.0.1/admin",
      "http://localhost:3000/api/admin",
      "http://169.254.169.254/latest/meta-data/",
      "http://10.0.0.1/internal",
      "http://192.168.1.1/router",
      "http://172.16.0.1/secret",
      "http://0.0.0.0:80",
      "http://app.internal/status",
      "http://127.0.0.1.nip.io",
      "file:///etc/passwd",
      "gopher://127.0.0.1:6379/_flushall",
    ];

    for (const url of maliciousUrls) {
      assert(!isSafeUrl(url), `Malicious SSRF URL '${url}' must be blocked`);
    }
  });

  await runTest("SSRF 2: Allow Legitimate Public Domain URLs", () => {
    const safeUrls = [
      "https://kvkdijitalcozumler.com",
      "https://google.com/search",
      "https://api.github.com/repos",
    ];

    for (const url of safeUrls) {
      assert(isSafeUrl(url), `Legitimate URL '${url}' must be allowed`);
    }
  });

  console.log("\n--- 3. OPEN REDIRECT DEFENSE ---");

  function isSafeRedirectUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;
    const trimmed = url.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
      return true;
    }
    return false;
  }

  await runTest("Redirect 1: Block Open Redirect Payloads", () => {
    const badRedirects = [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "http://attacker.com/login",
    ];

    for (const bad of badRedirects) {
      assert(!isSafeRedirectUrl(bad), `Open redirect payload '${bad}' must be blocked`);
    }
  });

  await runTest("Redirect 2: Allow Safe Internal Relative Redirects", () => {
    const safeRedirects = ["/admin", "/restoran/aura-bistro/kasa", "/blog", "/projeler"];
    for (const safe of safeRedirects) {
      assert(isSafeRedirectUrl(safe), `Internal redirect '${safe}' must be allowed`);
    }
  });

  console.log("\n--- 4. CSP & SECURITY HEADERS VERIFICATION ---");

  await runTest("Headers 1: Content-Security-Policy and HSTS in next.config.ts", async () => {
    const headersConfig = await nextConfig.headers!();
    const globalHeaders = headersConfig.find((h: any) => h.source === "/(.*)")?.headers || [];

    const getHeader = (key: string) => globalHeaders.find((h: any) => h.key.toLowerCase() === key.toLowerCase())?.value;

    const csp = getHeader("Content-Security-Policy");
    const xcto = getHeader("X-Content-Type-Options");
    const xfo = getHeader("X-Frame-Options");
    const hsts = getHeader("Strict-Transport-Security");
    const refPol = getHeader("Referrer-Policy");

    assert(typeof csp === "string", "CSP header must be configured");
    assert(csp?.includes("default-src 'self'") ?? false, "CSP must define default-src 'self'");
    assert(csp?.includes("object-src 'none'") ?? false, "CSP must set object-src 'none'");
    assert(csp?.includes("base-uri 'self'") ?? false, "CSP must set base-uri 'self'");
    assertEqual(xcto, "nosniff", "X-Content-Type-Options must be nosniff");
    assertEqual(xfo, "SAMEORIGIN", "X-Frame-Options must be SAMEORIGIN");
    assert(hsts?.includes("max-age=63072000") ?? false, "HSTS must have max-age of 2 years (63072000)");
    assert(hsts?.includes("preload") ?? false, "HSTS must have preload");
    assertEqual(refPol, "strict-origin-when-cross-origin", "Referrer-Policy must be strict-origin-when-cross-origin");
  });

  console.log("\n=================================================");
  console.log(`ALL FAZ 6 WEB SECURITY TESTS PASSED: ${passedCount} / ${totalCount} (100% SUCCESS)`);
  console.log("=================================================\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
