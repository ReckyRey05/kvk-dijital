"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  FolderTree,
  Plus,
  Edit2,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subCategoriesStr, setSubCategoriesStr] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreateModal() {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setSubCategoriesStr("");
    setIsActive(true);
    setSortOrder(categories.length + 1);
    setModalOpen(true);
  }

  function openEditModal(cat: any) {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSubCategoriesStr((cat.subCategories || []).join(", "));
    setIsActive(cat.isActive);
    setSortOrder(cat.sortOrder || 1);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const subs = subCategoriesStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: any = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        subCategories: subs,
        isActive,
        sortOrder: Number(sortOrder),
      };

      if (editingCategory) {
        payload.id = editingCategory.id;
      }

      const res = await fetch("/api/teklifim-gelsin/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        loadCategories();
      } else {
        const err = await res.json();
        alert(err.error || "Kaydetme basarisiz.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderTree size={24} className="text-primary" />
            Kategori & Taksonomi Yönetimi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            B2B pazar yeri ana kategorilerini, alt kategorilerini ve sıralamasını düzenleyin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            <Plus size={14} />
            Yeni Kategori
          </button>
          <button
            onClick={loadCategories}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Sıra</th>
                <th className="px-4 py-3">Kategori Adı</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Alt Kategoriler</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">Düzenle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Kategoriler getiriliyor..." : "Kategori bulunamadı."}
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{c.sortOrder || 1}</td>
                    <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{c.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {(c.subCategories || []).map((sub: string, i: number) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle size={12} />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <XCircle size={12} />
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-white text-sm">
              {editingCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Oluştur"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ornek: gida-ve-icecek"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Alt Kategoriler (Virgülle ayırın)
                </label>
                <textarea
                  rows={3}
                  value={subCategoriesStr}
                  onChange={(e) => setSubCategoriesStr(e.target.value)}
                  placeholder="Bakliyat, Yağ, Süt Ürünleri..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-slate-300 font-medium mb-1">Sıralama Sırası</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="pt-5 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-primary"
                  />
                  <label htmlFor="isActiveCheck" className="text-slate-300 select-none">
                    Aktif Kategori
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
