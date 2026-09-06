"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  Plus,
  Search,
  Filter,
  Package,
  MapPin,
  ExternalLink,
  Printer,
  Download,
  Trash2,
  Edit3,
  LogOut,
  ChevronRight,
  Clock,
  Layers,
  X,
  Check,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { EtiketleTag, ETIKETLE_CATEGORIES } from "@/types/etiketle";
import { generateQrDataUrl } from "@/lib/etiketle/etiketleQr";

export default function EtiketleDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [businessName, setBusinessName] = useState<string>("İşletmem");
  const [tags, setTags] = useState<EtiketleTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedStatus, setSelectedStatus] = useState("Tümü");

  // QR Modal
  const [previewTag, setPreviewTag] = useState<EtiketleTag | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Delete Modal
  const [tagToDelete, setTagToDelete] = useState<EtiketleTag | null>(null);
  const [deleting, setDeleting] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://kvkdijitalcozumler.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/etiketle/auth");
      } else {
        setUser(currentUser);
        const storedName = localStorage.getItem(`etiketle_business_${currentUser.uid}`);
        if (storedName) setBusinessName(storedName);
        await loadTags(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadTags = async (currentUser: any) => {
    try {
      setLoading(true);
      setError("");
      const token = await currentUser.getIdToken();

      // 1. Try Server API
      try {
        const res = await fetch("/api/etiketle/tags", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTags(data.tags || []);
          return;
        }
      } catch (apiErr) {
        console.warn("Server API notice:", apiErr);
      }

      // 2. Fallback: Client Firestore SDK
      try {
        const { db } = await import("@/lib/firebase/firestore");
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const q = query(collection(db, "etiketle_tags"), where("businessId", "==", currentUser.uid));
        const snap = await getDocs(q);
        const list: EtiketleTag[] = [];
        snap.forEach((d) => list.push(d.data() as EtiketleTag));
        setTags(list.sort((a, b) => b.updatedAt - a.updatedAt));
      } catch (dbErr) {
        console.warn("Client Firestore notice:", dbErr);
      }
    } catch (err: any) {
      console.error(err);
      setError("Etiketler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/etiketle");
  };

  // Open QR Preview modal
  const handleOpenQrModal = async (tag: EtiketleTag) => {
    setPreviewTag(tag);
    const publicScanUrl = `${siteUrl}/e/${tag.code}`;
    try {
      const url = await generateQrDataUrl(publicScanUrl);
      setQrDataUrl(url);
    } catch {
      // Fallback API QR
      setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicScanUrl)}`);
    }
  };

  // Delete Tag
  const confirmDeleteTag = async () => {
    if (!tagToDelete || !user) return;
    setDeleting(true);

    try {
      const token = await user.getIdToken();

      // 1. Try Server API
      try {
        await fetch(`/api/etiketle/tags/${tagToDelete.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}

      // 2. Client Firestore
      try {
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "etiketle_tags", tagToDelete.id));
      } catch {}

      setTags((prev) => prev.filter((t) => t.id !== tagToDelete.id));
      setTagToDelete(null);
    } catch (err) {
      console.error(err);
      setError("Etiket silinirken hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered tags
  const filteredTags = tags.filter((tag) => {
    if (selectedCategory !== "Tümü" && tag.category !== selectedCategory) return false;
    if (selectedStatus !== "Tümü" && tag.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = tag.name.toLowerCase().includes(q);
      const matchLocation = tag.location.toLowerCase().includes(q);
      const matchCode = tag.code.toLowerCase().includes(q);
      const matchDesc = (tag.description || "").toLowerCase().includes(q);
      if (!matchName && !matchLocation && !matchCode && !matchDesc) return false;
    }
    return true;
  });

  const totalTags = tags.length;
  const activeTags = tags.filter((t) => t.status === "active").length;
  const lastUpdatedTag = tags[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-amber-500 selection:text-black font-sans antialiased pb-20">
      {/* Top Header */}
      <header className="border-b border-white/10 sticky top-0 z-30 bg-[#07090E]/90 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white block leading-tight">
                Etiket<span className="text-amber-400">le</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{businessName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/etiketle/tags/new"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Etiket</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Greeting */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Merhaba 👋
          </h1>
          <p className="text-xs text-slate-400">
            Fiziksel kutularınızı, raflarınızı ve ekipmanlarınızı QR etiketlerle kolayca yönetin.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Toplam Etiket</span>
            <div className="text-3xl font-black text-white">{totalTags}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Aktif Etiket</span>
            <div className="text-3xl font-black text-amber-400">{activeTags}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400 font-medium">Son Güncellenen</span>
            <div className="text-sm font-bold text-slate-200 truncate mt-1">
              {lastUpdatedTag ? lastUpdatedTag.name : "—"}
            </div>
            <span className="text-[10px] text-slate-500 block">
              {lastUpdatedTag ? new Date(lastUpdatedTag.updatedAt).toLocaleDateString("tr-TR") : "Henüz etiket yok"}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Tags Section */}
        <div className="space-y-4">
          {/* Header & Search/Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Tüm Etiketler</h2>
              <p className="text-xs text-slate-400">
                Oluşturduğunuz tüm fiziksel varlık QR kodları ve mevcut konumları.
              </p>
            </div>

            {tags.length > 0 && (
              <Link
                href="/etiketle/tags/new"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <Plus className="w-4 h-4" />
                <span>Etiket Ekle</span>
              </Link>
            )}
          </div>

          {/* Search & Filters */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-[#0E121A] border border-white/10 text-xs">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Etiket adı, konum veya kod ara..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#07090E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Tümü">Tüm Kategoriler</option>
                  {ETIKETLE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#07090E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Tümü">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="archived">Arşiv</option>
                </select>
              </div>
            </div>
          )}

          {/* Tag List */}
          {tags.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">Henüz bir etiket oluşturmadın</h3>
                <p className="text-xs text-slate-400">
                  İlk etiketini oluştur ve QR kodunu hemen hazırla.
                </p>
              </div>
              <Link
                href="/etiketle/tags/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>İlk Etiketini Oluştur</span>
              </Link>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
              Arama kriterlerine uygun etiket bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0E121A] border border-white/10 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg select-all">
                        {tag.code}
                      </span>
                      <h3 className="text-base font-bold text-white">{tag.name}</h3>

                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                        {tag.category}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                          tag.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : tag.status === "inactive"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        }`}
                      >
                        {tag.status === "active" ? "Aktif" : tag.status === "inactive" ? "Pasif" : "Arşiv"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                      <span>
                        Miktar: <strong className="text-amber-400 font-bold">{tag.quantity} {tag.unit}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Konum: <strong className="text-white">{tag.location}</strong></span>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-500">
                        Son güncelleme: {new Date(tag.updatedAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    {tag.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{tag.description}</p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                    <button
                      type="button"
                      onClick={() => handleOpenQrModal(tag)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="QR Kodu Görüntüle ve Yazdır"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QR Kod</span>
                    </button>

                    <Link
                      href={`/etiketle/tags/${tag.id}`}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Etiketi Düzenle & Detay"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Düzenle</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setTagToDelete(tag)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer"
                      title="Etiketi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Quick Modal */}
      {previewTag && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-[#0E121A] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white/10 text-center">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 text-left">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">QR Kod Hazır</span>
                <h3 className="text-base font-bold text-white truncate max-w-[220px]">{previewTag.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTag(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Visual Canvas */}
            <div className="p-5 rounded-2xl bg-white inline-block shadow-xl mx-auto">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={previewTag.name}
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  QR Hazırlanıyor...
                </div>
              )}
              <div className="pt-2 text-center">
                <span className="text-black font-black text-xs block">{previewTag.name}</span>
                <span className="text-slate-600 font-bold text-[10px] block">
                  {previewTag.quantity} {previewTag.unit} • {previewTag.location}
                </span>
                <span className="text-slate-400 font-mono text-[9px] block mt-0.5">
                  /e/{previewTag.code}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <a
                href={qrDataUrl}
                download={`etiket-${previewTag.code}.png`}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>QR İndir</span>
              </a>

              <Link
                href={`/etiketle/tags/${previewTag.id}?print=true`}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Yazdır</span>
              </Link>
            </div>

            <div className="pt-1">
              <Link
                href={`/e/${previewTag.code}`}
                target="_blank"
                className="text-[11px] text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Taranınca Nasıl Görünür?</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tagToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0E121A] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Etiketi Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-white">"{tagToDelete.name}"</strong> etiketini ve geçmiş kayıtlarını silmek üzeresiniz. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTagToDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={confirmDeleteTag}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Etiketi Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
