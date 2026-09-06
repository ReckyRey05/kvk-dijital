"use client";

import React, { useState } from "react";
import { X, Building2, Save, AlertCircle } from "lucide-react";
import {
  TeklifimProfile,
  TEKLIFIM_CATEGORIES,
  TURKEY_CITIES,
} from "@/types/teklifimGelsin";

interface EditProfileModalProps {
  profile: TeklifimProfile;
  onClose: () => void;
  onSuccess: (updated: TeklifimProfile) => void;
}

export default function EditProfileModal({
  profile,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const [companyName, setCompanyName] = useState(profile.companyName || "");
  const [contactName, setContactName] = useState(profile.contactName || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [city, setCity] = useState(profile.city || "İstanbul");
  const [district, setDistrict] = useState(profile.district || "");
  const [category, setCategory] = useState((profile.categories || [])[0] || "Ambalaj & Paketleme");
  const [description, setDescription] = useState(profile.description || "");
  const [deliveryRegionsStr, setDeliveryRegionsStr] = useState(
    (profile.deliveryRegions || ["Tüm Türkiye"]).join(", ")
  );
  const [minOrder, setMinOrder] = useState(profile.minOrder || "");
  const [website, setWebsite] = useState(profile.website || "");
  const [yearFounded, setYearFounded] = useState(profile.yearFounded ? String(profile.yearFounded) : "");
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Firma adı zorunludur.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const { auth } = await import("@/lib/firebase/auth");
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Lütfen giriş yapın.");

      const token = await currentUser.getIdToken();
      const regions = deliveryRegionsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Partial<TeklifimProfile> = {
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        city,
        district: district.trim(),
        categories: [category],
        description: description.trim(),
        deliveryRegions: regions.length > 0 ? regions : ["Tüm Türkiye"],
        minOrder: minOrder.trim(),
        website: website.trim(),
        logoUrl: logoUrl.trim(),
        yearFounded: yearFounded ? Number(yearFounded) : undefined,
      };

      const res = await fetch("/api/teklifim-gelsin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Profil güncellenemedi.");
      }

      const data = await res.json();
      onSuccess(data.profile);
      onClose();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans animate-fade-in-up">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Firma Ayarları
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Firma Profilini Düzenle
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Firma Adı *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Yetkili Adı Soyadı</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Telefon</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Şehir</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                {TURKEY_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">İlçe / Sanayi Bölgesi</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Örn: İkitelli OSB"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Ana Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              >
                {TEKLIFIM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Kuruluş Yılı</label>
              <input
                type="number"
                value={yearFounded}
                onChange={(e) => setYearFounded(e.target.value)}
                placeholder="Örn: 2012"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-900 dark:text-white">Firma Tanıtımı / Açıklama</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Üretim kapasiteniz, ürün çeşitleriniz ve toptan sevkiyat yetkinlikleriniz..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Min. Sipariş Şartı</label>
              <input
                type="text"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="Örn: 100 Adet / 1 Koli"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 dark:text-white">Web Sitesi (Opsiyonel)</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://firmaniz.com.tr"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-900 dark:text-white">
              Teslimat Bölgeleri (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={deliveryRegionsStr}
              onChange={(e) => setDeliveryRegionsStr(e.target.value)}
              placeholder="Örn: Tüm Türkiye, Marmara Bölgesi, İstanbul İçi"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? "Kaydediliyor..." : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Değişiklikleri Kaydet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
