"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { uploadFile } from "@/lib/firebase/storage-helpers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    demoUrl: "",
    githubUrl: "",
    features: "",
    isFeatured: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let coverImageUrl = "";
      if (coverFile) {
        coverImageUrl = await uploadFile(coverFile, "projects");
      }

      await addDoc(collection(db, "projects"), {
        ...formData,
        features: formData.features.split(",").map(f => f.trim()).filter(f => f),
        coverImage: coverImageUrl,
        createdAt: serverTimestamp()
      });

      router.push("/admin/projects");
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Proje eklenirken bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/projects" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold mb-2">Yeni Proje Ekle</h1>
          <p className="text-foreground/60">Portföyünüz için yeni bir proje oluşturun.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Proje Adı *</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Slug (URL için) *</label>
            <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Kategori *</label>
            <input required type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Kapak Fotoğrafı</label>
            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-accent outline-none text-sm" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-foreground/60">Açıklama</label>
          <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none resize-none" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-foreground/60">Özellikler (Virgülle ayırın)</label>
          <input type="text" placeholder="Örn: Responsive Design, SEO Optimizasyonu, CMS" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Demo URL</label>
            <input type="url" value={formData.demoUrl} onChange={e => setFormData({...formData, demoUrl: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">GitHub URL</label>
            <input type="url" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-5 h-5 accent-accent" />
          <label htmlFor="isFeatured" className="text-foreground/80 cursor-pointer">Ana Sayfada Öne Çıkar</label>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
          <button disabled={loading} className="bg-accent text-white px-8 py-3 rounded-xl font-medium hover:bg-accent/90 transition-colors disabled:opacity-70">
            {loading ? "Kaydediliyor..." : "Projeyi Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
