"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  FileText,
  Building2,
  Layers,
  Sparkles,
  Send,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  TEKLIFIM_CATEGORIES,
  TEKLIFIM_UNITS,
  TURKEY_CITIES,
  TeklifimRequest,
  TeklifimProfile,
} from "@/types/teklifimGelsin";
import CategorySelector from "./CategorySelector";

interface ProgressiveRequestFormProps {
  profile: TeklifimProfile | null;
  initialPrompt?: string;
  onSubmit: (data: Partial<TeklifimRequest>) => Promise<void>;
  submitting: boolean;
}

export default function ProgressiveRequestForm({
  profile,
  initialPrompt = "",
  onSubmit,
  submitting,
}: ProgressiveRequestFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState("");

  // Step 1: What are you looking for?
  const [title, setTitle] = useState(initialPrompt || "");
  const [category, setCategory] = useState<string>("Ambalaj & Paketleme");

  // Step 2: Quantity & Where?
  const [quantity, setQuantity] = useState("500");
  const [unit, setUnit] = useState<string>("Adet");
  const [city, setCity] = useState(profile?.city || "İstanbul");
  const [district, setDistrict] = useState(profile?.district || "");
  const [deliveryDays, setDeliveryDays] = useState("7");

  // Step 3: Specific terms & notes
  const [description, setDescription] = useState("");
  const [sampleRequired, setSampleRequired] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Lütfen neye ihtiyacınız olduğunu belirtin.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || Number(quantity) <= 0) {
      setError("Lütfen geçerli bir miktar girin.");
      return;
    }
    setError("");
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await onSubmit({
        title: title.trim(),
        category,
        productName: title.trim(),
        quantity: Number(quantity) || 1,
        unit,
        deliveryDays: Number(deliveryDays) || 7,
        city,
        district: district.trim() || undefined,
        description: description.trim(),
        sampleRequired,
        deadline: deadline || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || "Talep oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto font-sans">
      {/* STEP PROGRESS BAR */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 text-xs font-bold">
          <div
            className={`flex items-center gap-2 ${
              step >= 1
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-600"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 1
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              1
            </span>
            <span>Ürün & Kategori</span>
          </div>

          <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2" />

          <div
            className={`flex items-center gap-2 ${
              step >= 2
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-600"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step >= 2
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              2
            </span>
            <span>Miktar & Teslimat</span>
          </div>

          <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2" />

          <div
            className={`flex items-center gap-2 ${
              step === 3
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-600"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step === 3
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500"
              }`}
            >
              3
            </span>
            <span>Şartlar & Onay</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM CONTAINER */}
      <div className="bg-white dark:bg-[#0E131F] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl transition-colors">
        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Adım 1 / 3
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Şu anda neye ihtiyacınız var?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Aradığınız ürün veya hizmeti net şekilde tanımlayın. İlgili toptancılara otomatik iletilecektir.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Ürün / Hizmet Başlığı <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 500 Adet Çift Duvarlı 8oz Kraft Karton Bardak"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm sm:text-base font-semibold focus:outline-none focus:border-emerald-600 transition-colors"
              />
              <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-slate-400">
                <span>Hızlı Örnekler:</span>
                {["Karton Bardak", "Oluklu Koli 40x30", "Z Katlama Havlu", "Toptan Kahve"].map(
                  (sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTitle(sample)}
                      className="underline hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {sample}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Hangi Kategoriye Giriyor? <span className="text-rose-500">*</span>
              </label>
              <CategorySelector
                selectedCategory={category}
                onSelectCategory={(cat) => setCategory(cat)}
                showDetails={false}
              />
            </div>

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Miktar & Teslimat Süresine Geç</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <form onSubmit={handleStep2Next} className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Adım 2 / 3
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Ne kadar ve nereye teslim edilecek?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Tedarikçilerin en doğru birim fiyatı ve nakliye süresini verebilmesi için bilgileri girin.
              </p>
            </div>

            {/* QUANTITY & UNIT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  İstenen Miktar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Birim
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:border-emerald-600"
                >
                  {TEKLIFIM_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CITY & DISTRICT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Teslimat Şehri <span className="text-rose-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:border-emerald-600"
                >
                  {TURKEY_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  İlçe / Bölge (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Örn: Kadıköy / İkitelli OSB"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* DELIVERY DAYS */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Hedeflenen Teslimat Süresi (Maksimum Gün)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {["3", "7", "14", "30"].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDeliveryDays(days)}
                    className={`py-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      deliveryDays === days
                        ? "bg-emerald-600 text-white border-emerald-600 shadow"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {days} Gün İçinde
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri Dön</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Detaylar & Özel Şartlar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Adım 3 / 3
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Özel şartlar ve son kontrol
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Varsa teknik şartname, numune isteği veya özel notlarınızı ekleyin.
              </p>
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Açıklama & Özel Şartlar
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Örn: Sıcak tutma kapasitesi yüksek olmalı, koli içi ambalajlı teslimat tercih sebebidir..."
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            {/* SAMPLE REQUIRED TOGGLE */}
            <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sampleRequired}
                onChange={(e) => setSampleRequired(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0 accent-emerald-600 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Toplu sipariş öncesinde fiziksel numune talep ediyorum
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Toptancılar numune gönderme imkânlarını tekliflerinde belirtirler.
                </span>
              </div>
            </label>

            {/* SUMMARY CARD */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Talep Özeti
              </span>
              <div className="flex flex-wrap items-baseline gap-2 text-sm text-slate-800 dark:text-slate-200">
                <strong className="font-black text-slate-900 dark:text-white">{title}</strong>
                <span>•</span>
                <span>{quantity} {unit}</span>
                <span>•</span>
                <span>{city}</span>
                <span>•</span>
                <span>{category}</span>
                <span>•</span>
                <span>{deliveryDays} gün hedef</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri Dön</span>
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Talebi Ağda Yayınla</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
