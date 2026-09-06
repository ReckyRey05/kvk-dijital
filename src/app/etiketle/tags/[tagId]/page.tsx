"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  Printer,
  Download,
  ExternalLink,
  Edit3,
  Clock,
  MapPin,
  Package,
  CheckCircle2,
  Trash2,
  Save,
  Check,
  History,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  EtiketleTag,
  EtiketleTagHistory,
  ETIKETLE_CATEGORIES,
  ETIKETLE_UNITS,
} from "@/types/etiketle";
import { generateQrDataUrl } from "@/lib/etiketle/etiketleQr";

function TagDetailContent({ tagId }: { tagId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoPrint = searchParams.get("print") === "true";

  const [user, setUser] = useState<any>(null);
  const [tag, setTag] = useState<EtiketleTag | null>(null);
  const [history, setHistory] = useState<EtiketleTagHistory[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Ekipman");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("Adet");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">("active");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://kvkdijitalcozumler.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/etiketle/auth");
      } else {
        setUser(currentUser);
        await loadTag(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router, tagId]);

  const loadTag = async (currentUser: any) => {
    try {
      setLoading(true);
      setError("");
      const token = await currentUser.getIdToken();

      let currentTag: EtiketleTag | null = null;
      let currentHist: EtiketleTagHistory[] = [];

      try {
        const res = await fetch(`/api/etiketle/tags/${tagId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          currentTag = data.tag;
          currentHist = data.history || [];
        }
      } catch (apiErr) {
        console.warn("Server API notice:", apiErr);
      }

      // Fallback: Client Firestore
      if (!currentTag) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { doc, getDoc, collection, query, where, getDocs } = await import("firebase/firestore");
          const snap = await getDoc(doc(db, "etiketle_tags", tagId));
          if (snap.exists()) {
            currentTag = { id: snap.id, ...(snap.data() as any) };
            const hSnap = await getDocs(query(collection(db, "etiketle_history"), where("tagId", "==", tagId)));
            hSnap.forEach((d) => currentHist.push(d.data() as EtiketleTagHistory));
          }
        } catch (dbErr) {
          console.warn("Client Firestore notice:", dbErr);
        }
      }

      if (!currentTag) {
        throw new Error("Etiket bulunamadı veya yetkiniz yok.");
      }

      setTag(currentTag);
      setHistory(currentHist.sort((a, b) => b.timestamp - a.timestamp));

      setName(currentTag.name);
      setCategory(currentTag.category || "Ekipman");
      setQuantity(String(currentTag.quantity));
      setUnit(currentTag.unit || "Adet");
      setLocation(currentTag.location || "");
      setDescription(currentTag.description || "");
      setStatus(currentTag.status || "active");

      // Generate QR
      const scanUrl = `${siteUrl}/e/${currentTag.code}`;
      try {
        const dataUrl = await generateQrDataUrl(scanUrl);
        setQrDataUrl(dataUrl);
      } catch {
        setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(scanUrl)}`);
      }

      if (shouldAutoPrint) {
        setTimeout(() => window.print(), 600);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Etiket yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !tag) return;
    setSaving(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const updates = {
        name: name.trim(),
        category,
        quantity: Number(quantity) || 0,
        unit,
        location: location.trim(),
        description: description.trim(),
        status,
      };

      const res = await fetch(`/api/etiketle/tags/${tagId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Güncelleme başarısız oldu.");
      }

      const data = await res.json();
      setTag(data.tag);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      // Reload tag & history
      await loadTag(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Etiket güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      const token = await user.getIdToken();
      await fetch(`/api/etiketle/tags/${tagId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/etiketle/dashboard");
    } catch (err) {
      console.error(err);
      setError("Silme işlemi sırasında hata oluştu.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-white p-6 space-y-4">
        <h2 className="text-xl font-bold">Etiket Bulunamadı</h2>
        <Link
          href="/etiketle/dashboard"
          className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold"
        >
          Panele Dön
        </Link>
      </div>
    );
  }

  const publicUrl = `${siteUrl}/e/${tag.code}`;

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-amber-500 selection:text-black font-sans antialiased pb-24">
      {/* Top Header */}
      <header className="border-b border-white/10 px-6 py-4 bg-[#07090E]/90 backdrop-blur-md sticky top-0 z-30 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/etiketle/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panele Dön</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Etiketi Yazdır</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
              title="Etiketi Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8 print:p-0">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs print:hidden">
            {error}
          </div>
        )}

        {/* Printable Label View */}
        <div className="hidden print:block p-8 bg-white text-black max-w-sm mx-auto border-2 border-black rounded-2xl text-center space-y-4">
          <div className="border-b-2 border-black pb-2">
            <span className="text-[11px] font-mono uppercase font-black tracking-widest block">ETİKETLE</span>
            <h2 className="text-xl font-black">{tag.name}</h2>
          </div>

          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt={tag.name} className="w-44 h-44 mx-auto" />
          )}

          <div className="space-y-1 text-sm font-bold border-t-2 border-black pt-2">
            <div className="flex justify-between">
              <span>Miktar:</span>
              <span className="font-black">{tag.quantity} {tag.unit}</span>
            </div>
            <div className="flex justify-between">
              <span>Konum:</span>
              <span className="font-black">{tag.location}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-600 pt-1">
              etiketle.app/e/{tag.code}
            </div>
          </div>
        </div>

        {/* Dashboard Detailed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
          {/* Left Column: QR Code & Physical Label Preview */}
          <div className="space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E121A] border border-white/10 text-center space-y-5 shadow-2xl">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                Fiziksel QR Etiketi
              </span>

              <div className="p-5 rounded-2xl bg-white inline-block shadow-2xl">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt={tag.name} className="w-44 h-44 mx-auto" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                    QR Hazırlanıyor...
                  </div>
                )}
                <div className="pt-2 text-center">
                  <span className="text-black font-black text-xs block truncate max-w-[176px]">{tag.name}</span>
                  <span className="text-slate-600 font-bold text-[10px] block">
                    {tag.quantity} {tag.unit} • {tag.location}
                  </span>
                  <span className="text-slate-400 font-mono text-[9px] block mt-0.5">
                    /e/{tag.code}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={qrDataUrl}
                  download={`etiket-${tag.code}.png`}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>QR İndir</span>
                </a>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır</span>
                </button>
              </div>

              <div className="pt-2 border-t border-white/10">
                <Link
                  href={publicUrl}
                  target="_blank"
                  className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1.5 font-semibold"
                >
                  <span>Telefon Taramasını Önizle</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Note box */}
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 leading-relaxed space-y-1">
              <strong className="text-white block font-bold">QR Kodunuz Statiktir:</strong>
              <p className="text-[11px] text-slate-300">
                Adet veya konumu değiştirdiğinizde QR kodu yeniden basmanıza gerek kalmaz. Telefonla okutulduğunda her zaman güncel bilgi açılır.
              </p>
            </div>
          </div>

          {/* Right Column: Edit Details Form & Audit History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Edit Form Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E121A] border border-white/10 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Etiket Bilgilerini Düzenle</h2>
                  <p className="text-xs text-slate-400">
                    Stok azaldığında veya kutunun yeri değiştiğinde buradan güncelleyin.
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : status === "inactive"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                  }`}
                >
                  {status === "active" ? "Aktif" : status === "inactive" ? "Pasif" : "Arşiv"}
                </span>
              </div>

              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Değişiklikler başarıyla kaydedildi ve tarihçeye işlendi!</span>
                </div>
              )}

              <form onSubmit={handleUpdateTag} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Etiket Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#07090E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {ETIKETLE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Konum / Raf *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Miktar / Adet *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Birim
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#07090E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      {ETIKETLE_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Durum
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[#07090E] border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                      <option value="archived">Arşiv</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Değişiklikleri Kaydet</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Audit History Card (Basit Tarihçe) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0E121A] border border-white/10 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <History className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Değişiklik Tarihçesi</h3>
              </div>

              {history.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">Henüz bir güncelleme kaydı yok.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-semibold text-white">{item.changeSummary}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(item.timestamp).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0E121A] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Bu Etiketi Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-white">"{tag.name}"</strong> etiketi kalıcı olarak silinecektir. QR kod okutulduğunda artık bilgi görüntülenemez.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Sil</span>
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

export default function EtiketleTagDetailPage({
  params,
}: {
  params: Promise<{ tagId: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <TagDetailContent tagId={resolvedParams.tagId} />
    </Suspense>
  );
}
