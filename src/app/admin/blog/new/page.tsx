"use client";

import { useState, useRef, useCallback } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Layout, Type, Image as ImageIcon, Sparkles } from "lucide-react";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Yükleme sırasında (SSR) Quill'in hata vermesini önlemek için dinamik import yapıyoruz.
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false, 
  loading: () => <div className="h-64 flex items-center justify-center text-foreground/50 border border-white/10 rounded-xl">Editör Yükleniyor...</div> 
});

// HTML taglerini temizleyen yardımcı fonksiyon
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Türkçe karakter dönüşüm + slug üretme
function generateSlug(title: string): string {
  return title
    .replace(/Ğ/g, 'g').replace(/Ü/g, 'u').replace(/Ş/g, 's')
    .replace(/I/g, 'i').replace(/İ/g, 'i').replace(/Ö/g, 'o').replace(/Ç/g, 'c')
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    isPublished: true,
  });

  const [generatingAI, setGeneratingAI] = useState(false);
  const [generatingExcerpt, setGeneratingExcerpt] = useState(false);
  const excerptDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    setFormData(prev => ({ ...prev, title, slug }));
  };

  // İçerik değiştiğinde debounce ile özet üret (sadece excerpt boşsa)
  const handleContentChange = useCallback((content: string) => {
    setFormData(prev => ({ ...prev, content }));

    // Önceki zamanlayıcıyı iptal et
    if (excerptDebounceRef.current) clearTimeout(excerptDebounceRef.current);

    // 2 saniye sonra özet üret (excerpt hâlâ boşsa)
    excerptDebounceRef.current = setTimeout(async () => {
      setFormData(prev => {
        // Kullanıcı daha önce bir şey yazmışsa dokunma
        if (prev.excerpt.trim()) return prev;
        return prev; // state update aşağıda
      });

      const plainText = stripHtml(content).trim();
      if (!plainText || plainText.length < 20) return;

      // Excerpt hâlâ boş mu kontrol et
      setFormData(prev => {
        if (prev.excerpt.trim()) return prev; // kullanıcı doldurmuş, dokunma

        // Önce Gemini dene, yoksa fallback
        (async () => {
          setGeneratingExcerpt(true);
          try {
            const response = await fetch('/api/ai/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                topic: `Aşağıdaki makale metninden SEO uyumlu, bilgilendirici ve dikkat çekici bir kısa özet yaz. Maksimum 155 karakter olsun. Sadece özet metnini döndür, başka bir şey yazma:\n\n${plainText.slice(0, 1500)}`
              })
            });

            if (response.ok) {
              const data = await response.json();
              // API makale içeriği döndürüyor, sadece ilk paragraph'ı al
              const aiExcerpt = stripHtml(data.content || '').slice(0, 160).trim();
              if (aiExcerpt) {
                setFormData(p => p.excerpt.trim() ? p : { ...p, excerpt: aiExcerpt });
                return;
              }
            }
          } catch {
            // AI başarısız → fallback
          } finally {
            setGeneratingExcerpt(false);
          }

          // Fallback: İlk 155 karakter
          const fallback = plainText.slice(0, 155).trim();
          setFormData(p => p.excerpt.trim() ? p : { ...p, excerpt: fallback });
        })();

        return prev; // state'i şimdilik aynı bırak, async günceller
      });
    }, 2000);
  }, []);

  const handleGenerateAI = async () => {
    const topic = window.prompt("Yapay zekanın makale yazması için bir konu veya taslak başlık girin:\n(Örn: 2026 E-ticaret trendleri ve dönüşüm oranları)");
    if (!topic) return;

    setGeneratingAI(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Yapay zeka yanıt vermedi.');
      }

      setFormData(prev => ({
        ...prev,
        content: prev.content ? prev.content + '<br><br>' + data.content : data.content
      }));
      
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isPublished: boolean) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      alert("Lütfen zorunlu alanları (Başlık, URL, İçerik) doldurun.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "blog_posts"), {
        ...formData,
        isPublished,
        createdAt: serverTimestamp(),
      });
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <Link 
        href="/admin/blog"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Blog Yönetimine Dön
      </Link>

      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Yeni Makale</h1>
          <p className="text-gray-400">Yeni bir blog yazısı oluşturun ve yayınlayın.</p>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-accent" />
              Temel Bilgiler
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Makale Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="Örn: 2026 E-Ticaret Trendleri"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  URL (Slug) *
                </label>
                <div className="flex items-center bg-[#050505] border border-white/10 rounded-xl focus-within:border-accent/50 transition-colors overflow-hidden">
                  <span className="px-4 py-3 text-gray-500 text-sm border-r border-white/10 bg-white/5 select-none">
                    /blog/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="flex-1 bg-transparent px-4 py-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  Kısa Özet (SEO Description)
                  {generatingExcerpt && (
                    <span className="flex items-center gap-1 text-xs text-purple-400 animate-pulse">
                      <Sparkles className="w-3 h-3" />
                      AI ile özet oluşturuluyor...
                    </span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  placeholder="İçerik girildikten sonra otomatik oluşturulacak... veya kendiniz yazabilirsiniz."
                />
                <p className="text-xs text-gray-600 mt-1">
                  İçerik kutusuna metin girildiğinde bu alan otomatik dolar. Elle yazarsanız üzerine yazılmaz.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Layout className="w-5 h-5 text-accent" />
                Makale İçeriği *
              </h2>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={generatingAI}
                className="flex items-center gap-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-500/20 transition-colors disabled:opacity-50"
              >
                <span className="text-lg">✨</span>
                {generatingAI ? "Yazılıyor..." : "Yapay Zeka İle Yazdır"}
              </button>
            </div>
            
            <div className="text-black quill-wrapper">
              <p className="text-xs text-gray-500 mb-4">
                Not: İçerik girildikten 2 saniye sonra SEO özeti otomatik oluşturulur. Zengin metin editörü SEO uyumlu HTML formatına çevirir.
              </p>
              <ReactQuill 
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                className="bg-white rounded-xl overflow-hidden min-h-[300px]"
                modules={{
                  toolbar: [
                    [{ 'header': [2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link', 'image', 'video'],
                    ['clean']
                  ]
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-accent" />
              Medya
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Kapak Görseli URL
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors text-sm"
                placeholder="https://..."
              />
              {formData.coverImage && (
                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 aspect-video">
                  <img src={formData.coverImage} alt="Kapak önizleme" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-6">Yayınla</h2>
            
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white/5 text-gray-300 border border-white/10 px-6 py-4 rounded-xl font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Taslak Olarak Kaydet
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-accent text-black px-6 py-4 rounded-xl font-bold hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {loading ? "Kaydediliyor..." : "Yayına Al"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
