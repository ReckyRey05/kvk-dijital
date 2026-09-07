"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Package,
  DollarSign,
  AlertCircle,
  Layers,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  Tag,
} from "lucide-react";
import {
  TEKLIFIM_CATEGORIES,
  TEKLIFIM_UNITS,
  SUBCATEGORY_MAPPING,
  TeklifimProduct,
  TeklifimStockStatus,
  TeklifimPriceVisibility,
  TeklifimProductStatus,
} from "@/types/teklifimGelsin";

interface ProductFormModalProps {
  initialData?: TeklifimProduct | null;
  onClose: () => void;
  onSubmit: (productData: Partial<TeklifimProduct>) => Promise<void>;
  submitting?: boolean;
}

export default function ProductFormModal({
  initialData,
  onClose,
  onSubmit,
  submitting = false,
}: ProductFormModalProps) {
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title || initialData?.name || "");
  const [category, setCategory] = useState<string>(initialData?.category || TEKLIFIM_CATEGORIES[0] || "Ambalaj & Paketleme");
  const [subCategory, setSubCategory] = useState<string>(initialData?.subCategory || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [unit, setUnit] = useState<string>(initialData?.unit || "Adet");
  const [minimumOrder, setMinimumOrder] = useState<number>(initialData?.minimumOrder || 1);
  const [price, setPrice] = useState<string>(
    initialData?.price !== undefined
      ? String(initialData.price)
      : initialData?.estimatedPrice !== undefined
      ? String(initialData.estimatedPrice)
      : ""
  );
  const [currency, setCurrency] = useState<string>(initialData?.currency || "TRY");
  const [priceVisibility, setPriceVisibility] = useState<TeklifimPriceVisibility>(
    initialData?.priceVisibility || "public"
  );
  const [stockStatus, setStockStatus] = useState<TeklifimStockStatus>(
    initialData?.stockStatus || "in_stock"
  );
  const [trackStock, setTrackStock] = useState<boolean>(
    initialData?.trackStock ?? (initialData?.stockQuantity !== undefined)
  );
  const [stockQuantity, setStockQuantity] = useState<string>(
    initialData?.stockQuantity !== undefined ? String(initialData.stockQuantity) : ""
  );
  const [leadTimeDays, setLeadTimeDays] = useState<string>(
    initialData?.leadTimeDays !== undefined ? String(initialData.leadTimeDays) : ""
  );
  const [deliveryRegions, setDeliveryRegions] = useState<string>(
    initialData?.deliveryRegions ? initialData.deliveryRegions.join(", ") : "Tüm Türkiye"
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [status, setStatus] = useState<TeklifimProductStatus>(
    initialData?.status || "published"
  );
  const [error, setError] = useState("");

  // Update subcategories when category changes
  const availableSubcategories = SUBCATEGORY_MAPPING[category] || [];

  useEffect(() => {
    if (availableSubcategories.length > 0 && !availableSubcategories.includes(subCategory)) {
      setSubCategory(availableSubcategories[0]);
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Ürün adı zorunludur.");
      return;
    }
    if (!category.trim()) {
      setError("Kategori zorunludur.");
      return;
    }
    setError("");

    const parsedPrice = price.trim() !== "" ? parseFloat(price) : undefined;
    if (parsedPrice !== undefined && (isNaN(parsedPrice) || parsedPrice < 0)) {
      setError("Geçerli bir fiyat girin (negatif olamaz).");
      return;
    }

    const parsedStockQty = stockQuantity.trim() !== "" ? parseInt(stockQuantity, 10) : undefined;
    if (trackStock && parsedStockQty !== undefined && (isNaN(parsedStockQty) || parsedStockQty < 0)) {
      setError("Geçerli bir stok adedi girin.");
      return;
    }

    const parsedLeadDays = leadTimeDays.trim() !== "" ? parseInt(leadTimeDays, 10) : undefined;

    const regionsList = deliveryRegions
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    try {
      await onSubmit({
        title: title.trim(),
        name: title.trim(),
        category,
        subCategory: subCategory.trim() || undefined,
        sku: sku.trim() || undefined,
        unit,
        minimumOrder: minimumOrder > 0 ? minimumOrder : 1,
        minOrder: `${minimumOrder > 0 ? minimumOrder : 1} ${unit}`,
        price: parsedPrice,
        estimatedPrice: parsedPrice,
        currency,
        priceVisibility,
        stockStatus,
        trackStock,
        stockQuantity: trackStock ? parsedStockQty : undefined,
        leadTimeDays: parsedLeadDays,
        deliveryRegions: regionsList.length > 0 ? regionsList : ["Tüm Türkiye"],
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        status,
        isActive: status === "published",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Ürün kaydedilemedi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 sticky top-0 bg-white dark:bg-[#0E131F] z-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Katalog Yönetimi
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isEdit ? "Ürünü Düzenle" : "Yeni Toptan Ürün Ekle"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* SECTION 1: BASIC INFO */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              1. Temel Ürün Bilgileri
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Ürün / Hizmet Başlığı *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: 8 oz Çift Duvar Kraft Karton Bardak"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Ana Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  {TEKLIFIM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Alt Kategori
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="">Seçiniz (Opsiyonel)</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Stok Kodu (SKU)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Örn: KB-8OZ-KRAFT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Yayın Durumu
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TeklifimProductStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                >
                  <option value="published">Yayında (Aktif)</option>
                  <option value="draft">Taslak (Gizli)</option>
                  <option value="passive">Pasif</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & ORDER LIMITS */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              2. Fiyatlandırma & Asgari Sipariş (MOQ)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Birim Fiyat
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Para Birimi
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                >
                  <option value="TRY">TRY (TL)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Fiyat Görünürlüğü
                </label>
                <select
                  value={priceVisibility}
                  onChange={(e) => setPriceVisibility(e.target.value as TeklifimPriceVisibility)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="public">Herkese Açık Fiyat</option>
                  <option value="hidden">Giriş Yapana Açık</option>
                  <option value="request_quote">Fiyat Teklifi İsteyiniz</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Minimum Sipariş Adedi (MOQ)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minimumOrder}
                  onChange={(e) => setMinimumOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Sipariş Birimi
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  {TEKLIFIM_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: INVENTORY & STOCK */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              3. Stok & Tedarik Yönetimi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Stok Durumu
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as TeklifimStockStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                >
                  <option value="in_stock">Stokta Mevcut</option>
                  <option value="low_stock">Kritik Stok</option>
                  <option value="out_of_stock">Tükendi</option>
                  <option value="made_to_order">Siparişe Göre Üretim</option>
                  <option value="unspecified">Belirtilmedi (Sorunuz)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                  Hazırlık / Termin Süresi (İş Günü)
                </label>
                <input
                  type="number"
                  min="0"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  placeholder="Örn: 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trackStock}
                  onChange={(e) => setTrackStock(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  Sayısal Stok Takibi Yap (Adet Bazlı)
                </span>
              </label>

              {trackStock && (
                <div className="pt-2">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Güncel Stok Adedi
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="Örn: 5000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Sipariş tamamlandığında stok adedi otomatik düşer; 0 olduğunda durum "Tükendi"ye geçer.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: DETAILS, LOGISTICS & MEDIA */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              4. Lojistik & Ürün Detayı
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Teslimat Bölgeleri (Virgülle ayırın)
              </label>
              <input
                type="text"
                value={deliveryRegions}
                onChange={(e) => setDeliveryRegions(e.target.value)}
                placeholder="Tüm Türkiye, İstanbul, Marmara Bölgesi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Ürün Görsel URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Açıklama / Teknik Özellikler
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ürün materyali, koli içi adet, teknik sertifikalar vb."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-md flex items-center gap-2"
            >
              {submitting ? (
                <span>Kaydediliyor...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEdit ? "Değişiklikleri Kaydet" : "Ürünü Yayınla"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
