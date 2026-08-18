import sanitizeHtml from "sanitize-html";

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Sanitizes rich text HTML content for blog posts while preserving editor formatting.
 * Strips dangerous tags (<script>, <iframe>, <object>, <embed>, <svg>), event handlers (onerror, etc.), and unsafe URL schemes (javascript:, data:).
 */
export function sanitizeHtmlContent(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "span", "div",
      "strong", "b", "em", "i", "u", "s", "strike", "code", "pre",
      "blockquote", "ul", "ol", "li",
      "a", "img",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td"
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      "*": ["class"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
      img: ["http", "https"]
    },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard"
  });
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
 * Ensures a URL string is safe to render in href/src attributes.
 * Blocks dangerous schemes (javascript:, data:, vbscript:) and allows only http, https, mailto, or relative internal paths (/...).
 */
export function sanitizeSafeUrl(urlStr: string | null | undefined, fallbackUrl: string = "#"): string {
  if (!urlStr || typeof urlStr !== "string") return fallbackUrl;
  const trimmed = urlStr.trim();
  if (!trimmed) return fallbackUrl;

  // Allow relative internal routes (e.g. /projeler/demo)
  if (trimmed.startsWith("/")) return trimmed;

  // Allow mailto:
  if (trimmed.startsWith("mailto:")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return fallbackUrl;
  } catch {
    return fallbackUrl;
  }
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

export interface BlogPostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  isPublished: boolean;
}

export function validateBlogPostInput(raw: any): ValidationResult<BlogPostInput> {
  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Gönderilen istek verisi geçersiz.' };
  }

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const slug = typeof raw.slug === 'string' ? raw.slug.trim() : '';
  const excerpt = typeof raw.excerpt === 'string' ? raw.excerpt.trim() : '';
  const content = typeof raw.content === 'string' ? raw.content.trim() : '';
  const coverImageRaw = typeof raw.coverImage === 'string' ? raw.coverImage.trim() : '';
  const isPublished = Boolean(raw.isPublished);

  if (!title || title.length < 2 || title.length > 200) {
    return { success: false, error: 'Makale başlığı 2 ile 200 karakter arasında olmalıdır.' };
  }

  if (!slug || slug.length < 2 || slug.length > 200) {
    return { success: false, error: 'Makale slug adresi 2 ile 200 karakter arasında olmalıdır.' };
  }

  const sanitizedContent = sanitizeHtmlContent(content);

  if (!sanitizedContent || sanitizedContent.length < 5) {
    return { success: false, error: 'Makale içeriği geçersiz veya zararlı etiketler içeriyor.' };
  }

  if (coverImageRaw) {
    const imgValidation = validateMediaUrl(coverImageRaw);
    if (!imgValidation.success) {
      return { success: false, error: `Kapak Görseli: ${imgValidation.error}` };
    }
  }

  return {
    success: true,
    data: {
      title,
      slug,
      excerpt: excerpt.slice(0, 500),
      content: sanitizedContent,
      coverImage: coverImageRaw,
      isPublished
    }
  };
}

export interface ProjectInput {
  title: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl?: string;
  featured?: boolean;
}

export function validateProjectInput(raw: any): ValidationResult<ProjectInput> {
  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Gönderilen istek verisi geçersiz.' };
  }

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const category = typeof raw.category === 'string' ? raw.category.trim() : '';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  const imageRaw = typeof raw.image === 'string' ? raw.image.trim() : '';
  const demoUrlRaw = typeof raw.demoUrl === 'string' ? raw.demoUrl.trim() : '';
  const featured = Boolean(raw.featured);
  const technologies = Array.isArray(raw.technologies)
    ? raw.technologies.filter((t: any) => typeof t === 'string').map((t: string) => t.trim().slice(0, 50)).slice(0, 20)
    : [];

  if (!title || title.length < 2 || title.length > 150) {
    return { success: false, error: 'Proje başlığı 2 ile 150 karakter arasında olmalıdır.' };
  }

  if (!category || category.length < 2 || category.length > 100) {
    return { success: false, error: 'Proje kategorisi geçersiz.' };
  }

  if (!description || description.length < 5 || description.length > 5000) {
    return { success: false, error: 'Proje açıklaması 5 ile 5000 karakter arasında olmalıdır.' };
  }

  if (imageRaw) {
    const imgValidation = validateMediaUrl(imageRaw);
    if (!imgValidation.success) {
      return { success: false, error: `Proje Görseli: ${imgValidation.error}` };
    }
  }

  if (demoUrlRaw) {
    const demoValidation = validateMediaUrl(demoUrlRaw);
    if (!demoValidation.success) {
      return { success: false, error: `Demo URL: ${demoValidation.error}` };
    }
  }

  return {
    success: true,
    data: {
      title,
      category,
      description,
      image: imageRaw,
      technologies,
      demoUrl: demoUrlRaw,
      featured
    }
  };
}

export interface ServiceInput {
  title: string;
  description: string;
  icon: string;
  imageUrl: string;
  features: string[];
}

export function validateServiceInput(raw: any): ValidationResult<ServiceInput> {
  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Gönderilen istek verisi geçersiz.' };
  }

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';
  const icon = typeof raw.icon === 'string' ? raw.icon.trim().slice(0, 50) : '';
  const imageUrlRaw = typeof raw.imageUrl === 'string' ? raw.imageUrl.trim() : '';
  const features = Array.isArray(raw.features)
    ? raw.features.filter((f: any) => typeof f === 'string').map((f: string) => f.trim().slice(0, 200)).slice(0, 20)
    : [];

  if (!title || title.length < 2 || title.length > 150) {
    return { success: false, error: 'Hizmet başlığı 2 ile 150 karakter arasında olmalıdır.' };
  }

  if (!description || description.length < 5 || description.length > 2000) {
    return { success: false, error: 'Hizmet açıklaması 5 ile 2000 karakter arasında olmalıdır.' };
  }

  if (imageUrlRaw) {
    const imgValidation = validateMediaUrl(imageUrlRaw);
    if (!imgValidation.success) {
      return { success: false, error: `Hizmet Görseli: ${imgValidation.error}` };
    }
  }

  return {
    success: true,
    data: {
      title,
      description,
      icon,
      imageUrl: imageUrlRaw,
      features
    }
  };
}
