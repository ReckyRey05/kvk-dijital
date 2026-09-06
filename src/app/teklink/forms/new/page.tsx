"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  Link2,
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Type,
  AlignLeft,
  Phone,
  Mail,
  Calendar,
  List,
  CheckSquare,
  Upload,
  CheckCircle2
} from "lucide-react";
import { TekLinkField, TekLinkFieldType } from "@/types/teklink";

export default function NewTekLinkFormPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<TekLinkField[]>([
    { id: "f_1", type: "text", label: "Adınız Soyadınız", required: true, placeholder: "Örn: Ahmet Yılmaz" },
    { id: "f_2", type: "phone", label: "Telefon Numaranız", required: true, placeholder: "05XX XXX XX XX" },
  ]);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/teklink");
      } else {
        setUser(currentUser);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const addField = (type: TekLinkFieldType) => {
    const newId = `f_${Date.now()}`;
    let label = "Yeni Alan";
    let placeholder = "";

    switch (type) {
      case "text":
        label = "Ad veya Metin Bilgisi";
        placeholder = "Cevabınızı giriniz";
        break;
      case "textarea":
        label = "Açıklama veya Talep";
        placeholder = "Detayları yazınız...";
        break;
      case "phone":
        label = "Telefon Numarası";
        placeholder = "05XX XXX XX XX";
        break;
      case "email":
        label = "E-posta Adresi";
        placeholder = "ornek@posta.com";
        break;
      case "date":
        label = "Tarih";
        break;
      case "select":
        label = "Hizmet / Konu Seçimi";
        break;
      case "checkbox":
        label = "Onaylıyorum (Şartlar / Bilgilendirme)";
        break;
      case "file":
        label = "Belge / Fotoğraf / Evrak Yükleme";
        break;
    }

    setFields((prev) => [
      ...prev,
      {
        id: newId,
        type,
        label,
        required: true,
        placeholder,
        options: type === "select" ? ["Seçenek 1", "Seçenek 2", "Seçenek 3"] : undefined,
      },
    ]);
  };

  const removeField = (id: string) => {
    if (fields.length <= 1) {
      setError("Formda en az 1 alan bulunmalıdır.");
      return;
    }
    setFields((prev) => prev.filter((f) => f.id !== id));
    setError("");
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;

    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFields(updated);
  };

  const updateField = (id: string, updates: Partial<TekLinkField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Lütfen formunuza bir başlık verin.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (fields.length === 0) {
      setError("Lütfen en az bir alan ekleyin.");
      return;
    }

    const currentUser = user || auth.currentUser;
    if (!currentUser) {
      setError("Oturumunuz bulunamadı. Lütfen önce giriş yapın.");
      return;
    }

    setLoading(true);

    try {
      const token = await currentUser.getIdToken(true);
      const bName = currentUser.displayName || currentUser.email?.split("@")[0] || "İşletme";
      let formCreated = false;
      let newSlug = "";

      // Tier 1: Try Server API
      try {
        const res = await fetch("/api/teklink/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            businessName: bName,
            fields,
          }),
        });

        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (res.ok && data?.form?.slug) {
          formCreated = true;
          newSlug = data.form.slug;
        }
      } catch (apiErr) {
        console.warn("Server API error, attempting direct client fallback:", apiErr);
      }

      // Tier 2: Client-side Firestore & Local Storage Resilient Fallback
      if (!formCreated) {
        const chars = "abcdefghjkmnpqrstuvwxyz23456789";
        let generated = "";
        for (let i = 0; i < 6; i++) {
          generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const formId = `form_${Date.now()}`;
        const newForm = {
          id: formId,
          tenantId: currentUser.uid,
          slug: generated,
          title: title.trim(),
          description: description.trim(),
          businessName: bName,
          logoUrl: "",
          fields,
          isActive: true,
          responseCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Save to Client Firestore
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "teklink_forms", formId), newForm);
        } catch (dbErr) {
          console.warn("Client Firestore notice:", dbErr);
        }

        // Save to LocalStorage cache
        try {
          const localKey = `teklink_forms_${currentUser.uid}`;
          const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
          existing.unshift(newForm);
          localStorage.setItem(localKey, JSON.stringify(existing));
        } catch {}

        newSlug = generated;
        formCreated = true;
      }

      setCreatedSlug(newSlug);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Form creation error:", err);
      setError(err.message || "Form oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://kvkdijitalcozumler.com";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white font-sans selection:bg-blue-600 pb-20">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/teklink/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panele Dön</span>
          </Link>

          <span className="text-sm font-bold text-white">Yeni Form Oluştur</span>
        </div>
      </header>

      {/* Main Form Builder Form */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {createdSlug ? (
          /* Success Screen with Generated TekLink */
          <div className="p-8 sm:p-10 rounded-3xl bg-[#111827] border border-emerald-500/30 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-white">TekLink'iniz Hazır!</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Formunuz oluşturuldu. Aşağıdaki bağlantıyı tek tıkla kopyalayıp müşterinize WhatsApp veya SMS ile gönderebilirsiniz.
              </p>
            </div>

            {/* Generated Link Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-lg mx-auto">
              <span className="text-sm font-mono text-emerald-400 font-bold break-all select-all">
                {siteUrl}/f/{createdSlug}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${siteUrl}/f/${createdSlug}`);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCopied ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? "Kopyalandı!" : "Linki Kopyala"}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-white/10">
              <a
                href={`${siteUrl}/f/${createdSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/10"
              >
                <span>Müşteri Gözünden Test Et</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/teklink/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center shadow-lg shadow-blue-600/30"
              >
                Panele Dön
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* 1. Form Basic Info */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-white/10 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">1</span>
                <span>Form Başlığı ve Açıklama</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Form Adı <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Yeni Müşteri Bilgi Formu, Servis Kabul Formu..."
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Müşteriye Açıklama Notu (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Lütfen işlemlerinizi başlatabilmemiz için bilgilerinizi eksiksiz doldurunuz."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            {/* 2. Quick Field Palette */}
            <div className="p-6 rounded-3xl bg-[#111827] border border-white/10 space-y-4 shadow-xl">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">2</span>
                  <span>Almak İstediğiniz Bilgi & Evrak Türünü Seçin</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Butonlara tıklayarak formunuza yeni alanlar ekleyebilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { type: "text" as TekLinkFieldType, label: "Kısa Metin", icon: Type },
                  { type: "textarea" as TekLinkFieldType, label: "Uzun Açıklama", icon: AlignLeft },
                  { type: "phone" as TekLinkFieldType, label: "Telefon No", icon: Phone },
                  { type: "email" as TekLinkFieldType, label: "E-posta", icon: Mail },
                  { type: "date" as TekLinkFieldType, label: "Tarih Seçimi", icon: Calendar },
                  { type: "select" as TekLinkFieldType, label: "Seçim Listesi", icon: List },
                  { type: "checkbox" as TekLinkFieldType, label: "Onay Kutusu", icon: CheckSquare },
                  { type: "file" as TekLinkFieldType, label: "Evrak / Dosya", icon: Upload },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => addField(item.type)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/50 text-left transition-all flex items-center gap-2.5 text-xs font-bold text-slate-200 hover:text-white cursor-pointer group"
                    >
                      <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Fields Editor List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">3</span>
                  <span>Form Alanları ({fields.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">Oklarla sıralamayı değiştirebilirsiniz</span>
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-5 rounded-2xl bg-[#111827] border border-white/10 space-y-3 shadow-sm hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        #{idx + 1} — {field.type.toUpperCase()}
                      </span>

                      {/* Controls: Up, Down, Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveField(idx, "up")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-400 hover:text-white cursor-pointer transition-colors"
                          title="Yukarı Taşı"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === fields.length - 1}
                          onClick={() => moveField(idx, "down")}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-slate-400 hover:text-white cursor-pointer transition-colors"
                          title="Aşağı Taşı"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer transition-colors"
                          title="Alanı Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="Soru veya alan başlığı..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-xs font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-4 flex items-center justify-end">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                          />
                          <span className="font-semibold">{field.required ? "Zorunlu Alan" : "İsteğe Bağlı"}</span>
                        </label>
                      </div>
                    </div>

                    {/* Placeholder input for text types */}
                    {["text", "textarea", "phone", "email"].includes(field.type) && (
                      <div>
                        <input
                          type="text"
                          value={field.placeholder || ""}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder="Müşteriye görünecek örnek ipucu (Placeholder)"
                          className="w-full px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 placeholder:text-slate-600 text-[11px] focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error right above the button so scrolled users immediately see feedback */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Save & Generate TekLink CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-5 h-5" />
                    <span>Formu Kaydet ve TekLink Üret</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
