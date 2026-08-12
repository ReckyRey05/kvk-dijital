import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Konu belirtilmedi.' }, { status: 400 });
    }

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
