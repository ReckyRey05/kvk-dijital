"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Layout, Type, Image as ImageIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Yükleme sırasında (SSR) Quill'in hata vermesini önlemek için dinamik import yapıyoruz.
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false, 
  loading: () => <div className="h-64 flex items-center justify-center text-foreground/50 border border-white/10 rounded-xl">Editör Yükleniyor...</div> 
});

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

  // Automatically generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
      
    setFormData({ ...formData, title, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      alert("Lütfen zorunlu alanları (Başlık, URL, İçerik) doldurun.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "blog_posts"), {
        ...formData,
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

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Kısa Özet (SEO Description)
                </label>
                <textarea
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  placeholder="Makalenin arama sonuçlarında görünecek kısa özeti..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-accent" />
              Makale İçeriği *
            </h2>
            
            <div className="text-black quill-wrapper">
              <p className="text-xs text-gray-500 mb-4">
                Not: Zengin metin editörü ile yazdığınız yazılar SEO uyumlu HTML formatına çevrilir.
              </p>
              <ReactQuill 
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
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
            
            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-5 h-5 rounded bg-[#050505] border-white/20 text-accent focus:ring-accent focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">
                Herkese Açık Olarak Yayınla
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-accent text-black px-6 py-4 rounded-xl font-bold hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? "Kaydediliyor..." : "Makaleyi Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
