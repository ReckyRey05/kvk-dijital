"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  QrCode,
  Layers,
  Sparkles,
  Send,
  Plus,
  Package,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { ETIKETLE_CATEGORIES, ETIKETLE_UNITS } from "@/types/etiketle";

export default function NewEtiketleTagPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mode: Single Tag vs Batch
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Single Tag Form
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Ekipman");
  const [quantity, setQuantity] = useState("12");
  const [unit, setUnit] = useState<string>("Adet");
  const [location, setLocation] = useState("Raf B-04");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Batch Form
  const [batchNames, setBatchNames] = useState("Kutu 1\nKutu 2\nKutu 3\nKutu 4\nKutu 5");
  const [batchCategory, setBatchCategory] = useState<string>("Kutu & Koli");
  const [batchLocation, setBatchLocation] = useState("Depo Raf A-01");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/etiketle/auth");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSubmitting(true);

    try {
      const token = await user.getIdToken();
      const storedBusinessName = localStorage.getItem(`etiketle_business_${user.uid}`) || "İşletme";

      if (mode === "single") {
        if (!name.trim()) throw new Error("Etiket adı zorunludur.");

        const payload = {
          name: name.trim(),
          category,
          quantity: Number(quantity) || 1,
          unit,
          location: location.trim() || "Belirtilmedi",
          description: description.trim(),
          imageUrl: imageUrl.trim(),
          businessName: storedBusinessName,
        };

        const res = await fetch("/api/etiketle/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Etiket oluşturulamadı.");
        }

        const data = await res.json();
        // Redirect directly to the tag detail with ready QR!
        router.push(`/etiketle/tags/${data.tag.id}`);
      } else {
        // Batch Mode
        const names = batchNames
          .split("\n")
          .map((n) => n.trim())
          .filter(Boolean);

        if (names.length === 0) throw new Error("En az 1 etiket adı girin.");

        const payload = {
          isBatch: true,
          names,
          category: batchCategory,
          location: batchLocation,
          businessName: storedBusinessName,
        };

        const res = await fetch("/api/etiketle/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Toplu etiket oluşturulamadı.");
        }

        router.push("/etiketle/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

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
      <header className="border-b border-white/10 px-6 py-4 bg-[#07090E]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/etiketle/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panele Dön</span>
          </Link>

          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Yeni QR Etiket
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-[#0E121A] rounded-3xl border border-white/10 p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === "single" ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" : "text-slate-400 hover:text-white"
              }`}
            >
              Tekil Etiket Oluştur
            </button>
            <button
              type="button"
              onClick={() => setMode("batch")}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === "batch" ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" : "text-slate-400 hover:text-white"
              }`}
            >
              Toplu Etiket Oluştur (Çoklu QR)
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">
              {mode === "single" ? "Yeni Etiket Bilgilerini Girin" : "Toplu Etiket Oluştur"}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === "single"
                ? "Nesnenin adını, adedini ve konumunu kaydedin; anında benzersiz QR kodunuz üretilsin."
                : "Aynı anda birden fazla kutu veya ekipman için tek seferde seri QR kod üretin."}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "single" ? (
              <>
                {/* Single Form Fields */}
                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Etiket / Nesne Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Kamera Tripodu, Matkap Seti, Kutu #42"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Kategori *
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
                      placeholder="Örn: Raf B-04, 2. Kat Arşiv, Masa 3"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      placeholder="12"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Birim *
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
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Açıklama & Notlar
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Örn: Siyah Manfrotto kafa tripod, çantası ile birlikte..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Fotoğraf URL (Opsiyonel)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (Örn: nesne fotoğraf bağlantısı)"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Batch Form Fields */}
                <div>
                  <label className="text-xs font-bold text-white block mb-1">
                    Oluşturulacak Etiket İsimleri (Her satıra bir adet) *
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={batchNames}
                    onChange={(e) => setBatchNames(e.target.value)}
                    placeholder="Kutu 1&#10;Kutu 2&#10;Kutu 3&#10;Kutu 4&#10;Kutu 5"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Girilen her satır için ayrı ve bağımsız bir QR kod oluşturulacaktır.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1">
                      Ortak Kategori *
                    </label>
                    <select
                      value={batchCategory}
                      onChange={(e) => setBatchCategory(e.target.value)}
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
                      Ortak Başlangıç Konumu *
                    </label>
                    <input
                      type="text"
                      required
                      value={batchLocation}
                      onChange={(e) => setBatchLocation(e.target.value)}
                      placeholder="Örn: Depo Raf A-01"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    <span>
                      {mode === "single" ? "Etiketi Oluştur ve QR Üret" : "Toplu QR Kodları Oluştur"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
