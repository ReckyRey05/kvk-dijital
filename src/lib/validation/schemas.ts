/**
 * Pure TypeScript shared validation module for server-side API request hardening.
 * Zero external npm dependencies.
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  subject?: string;
  message: string;
}

export function validateContactInput(raw: any): ValidationResult<ContactInput> {
  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Gönderilen istek verisi geçersiz.' };
  }

  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const email = typeof raw.email === 'string' ? raw.email.trim().toLowerCase() : '';
  const phone = typeof raw.phone === 'string' ? raw.phone.trim().slice(0, 30) : '';
  const service = typeof raw.service === 'string' ? raw.service.trim().slice(0, 100) : 'Web Tasarım';
  const subject = typeof raw.subject === 'string' ? raw.subject.trim().slice(0, 200) : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';

  if (!name || name.length < 2 || name.length > 100) {
    return { success: false, error: 'Lütfen geçerli bir isim girin (2-100 karakter).' };
  }

  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Lütfen geçerli bir e-posta adresi girin.' };
  }

  if (!message || message.length < 5 || message.length > 5000) {
    return { success: false, error: 'Mesaj metni 5 ile 5000 karakter arasında olmalıdır.' };
  }

  return {
    success: true,
    data: { name, email, phone, service, subject, message }
  };
}

export interface SeoAuditInput {
  url: string;
}

export function validateSeoAuditInput(raw: any): ValidationResult<SeoAuditInput> {
  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Gönderilen istek verisi geçersiz.' };
  }

  let url = typeof raw.url === 'string' ? raw.url.trim() : '';

  if (!url || url.length > 2048) {
    return { success: false, error: 'Lütfen geçerli bir web sitesi adresi girin (maks. 2048 karakter).' };
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    new URL(url);
  } catch {
    return { success: false, error: 'Girdiğiniz web adresi formatı geçersiz.' };
  }

  return {
    success: true,
    data: { url }
  };
}

export interface AiGenerateInput {
  topic: string;
}

export function validateAiGenerateInput(raw: any): ValidationResult<AiGenerateInput> {
  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Gönderilen istek verisi geçersiz.' };
  }

  const topic = typeof raw.topic === 'string' ? raw.topic.trim() : '';

  if (!topic || topic.length < 3 || topic.length > 1000) {
    return { success: false, error: 'Makale konusu 3 ile 1000 karakter arasında olmalıdır.' };
  }

  return {
    success: true,
    data: { topic }
  };
}

/**
 * Shared validator for media/image URLs (blog coverImage, project image, service imageUrl)
 */
export function validateMediaUrl(urlStr: string): ValidationResult<string> {
  if (!urlStr || typeof urlStr !== 'string') {
    return { success: true, data: '' }; // Optional URL field
  }

  const trimmed = urlStr.trim();
  if (!trimmed) {
    return { success: true, data: '' };
  }

  if (trimmed.length > 2048) {
    return { success: false, error: 'Görsel URL adresi 2048 karakterden uzun olamaz.' };
  }

  // Reject control characters and CRLF
  if (/[\x00-\x1F\x7F-\x9F\r\n]/.test(trimmed)) {
    return { success: false, error: 'Görsel URL adresi geçersiz karakterler içeriyor.' };
  }

  try {
    const parsed = new URL(trimmed);

    // Reject non-web protocols (javascript:, data:, file:, vbscript:, blob:, etc.)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { success: false, error: 'Görsel URL adresi yalnızca http:// veya https:// protokolünü içerebilir.' };
    }

    // Reject credentials (userinfo) in URL
    if (parsed.username || parsed.password) {
      return { success: false, error: 'Görsel URL adresi kullanıcı adı veya şifre içeremez.' };
    }

    return { success: true, data: parsed.toString() };
  } catch {
    return { success: false, error: 'Girdiğiniz görsel URL adresi biçimi geçersiz.' };
  }
}
