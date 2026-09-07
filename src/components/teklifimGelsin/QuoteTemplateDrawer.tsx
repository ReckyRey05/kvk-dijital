"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Send,
  Clock,
  Package,
} from "lucide-react";
import { TeklifimQuoteTemplate, TeklifimProduct } from "@/types/teklifimGelsin";
import { validateQuoteTemplatePricing } from "@/lib/teklifimGelsin/supplierCenterUtils";

interface QuoteTemplateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  templates: TeklifimQuoteTemplate[];
  catalogProducts?: TeklifimProduct[];
  onApplyTemplate?: (template: TeklifimQuoteTemplate) => void;
  onSaveNewTemplate?: (template: Partial<TeklifimQuoteTemplate>) => Promise<void>;
  onDeleteTemplate?: (templateId: string) => Promise<void>;
}

export default function QuoteTemplateDrawer({
  isOpen,
  onClose,
  templates,
  catalogProducts = [],
  onApplyTemplate,
  onSaveNewTemplate,
  onDeleteTemplate,
}: QuoteTemplateDrawerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Genel");
  const [newUnitPrice, setNewUnitPrice] = useState<number | "">("");
  const [newDeliveryDays, setNewDeliveryDays] = useState<number>(3);
  const [newMinOrderQty, setNewMinOrderQty] = useState<number>(1);
  const [newDescription, setNewDescription] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = catalogProducts.find((p) => p.id === productId);
    if (prod) {
      if (!newTitle) setNewTitle(prod.title || prod.name || "");
      if (prod.category) setNewCategory(prod.category);
      if (prod.leadTimeDays) setNewDeliveryDays(prod.leadTimeDays);
      if (prod.minimumOrder) setNewMinOrderQty(prod.minimumOrder);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg("Sablon basligi zorunludur.");
      return;
    }
    if (typeof newUnitPrice !== "number" || newUnitPrice <= 0) {
      setErrorMsg("Gecerli bir birim fiyat girilmelidir.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (onSaveNewTemplate) {
        const prod = catalogProducts.find((p) => p.id === selectedProductId);
        await onSaveNewTemplate({
          title: newTitle.trim(),
          category: newCategory.trim(),
          productId: selectedProductId || undefined,
          productName: prod?.title || prod?.name || undefined,
          unitPrice: newUnitPrice,
          deliveryDays: newDeliveryDays,
          minOrderQuantity: newMinOrderQty,
          description: newDescription.trim(),
        });
      }
      setShowCreateForm(false);
      setNewTitle("");
      setNewUnitPrice("");
      setNewDescription("");
      setSelectedProductId("");
    } catch (err: any) {
      setErrorMsg(err.message || "Sablon olusturulamadi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hizli Teklif Sablonlari
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sik kullandiginiz teklifleri tek tikla uygulayin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {!showCreateForm ? (
            <>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-2.5 px-4 border border-dashed border-blue-400 dark:border-blue-600 rounded-xl text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Teklif Sablonu Olustur
              </button>

              <div className="space-y-3">
                {templates.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    Kayitli teklif sablonunuz bulunmuyor.
                  </div>
                ) : (
                  templates.map((tpl) => {
                    const linkedProduct = catalogProducts.find((p) => p.id === tpl.productId);
                    const validation = validateQuoteTemplatePricing(tpl, linkedProduct);

                    return (
                      <div
                        key={tpl.id}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-slate-50/40 dark:bg-slate-850/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {tpl.category}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                              {tpl.title}
                            </h4>
                          </div>

                          {onDeleteTemplate && (
                            <button
                              onClick={() => onDeleteTemplate(tpl.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Sablonu Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {tpl.unitPrice.toLocaleString("tr-TR")} TL / birim
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {tpl.deliveryDays} gun
                          </span>
                          <span>·</span>
                          <span>Min: {tpl.minOrderQuantity}</span>
                        </div>

                        {/* Price mismatch alert */}
                        {validation.priceMismatch && (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>
                              Katalog fiyati degisti (Guncel:{" "}
                              <strong>{validation.currentCatalogPrice} TL</strong>)
                            </span>
                          </div>
                        )}

                        {onApplyTemplate && (
                          <button
                            onClick={() => onApplyTemplate(tpl)}
                            className="w-full mt-2 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Bu Sablonu Uygula
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white">
                  Yeni Sablon Detaylari
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Iptal
                </button>
              </div>

              {/* Link from catalog */}
              {catalogProducts.length > 0 && (
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Katalog Urunuyle Bagla (Opsiyonel)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="">Baglanti Yok (Manuel)</option>
                    {catalogProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title || p.name} ({p.price ? `${p.price} TL` : "Fiyatsiz"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sablon Basligi *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Orn: Standart A4 Kagit Teklifi"
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Birim Fiyat (TL) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newUnitPrice}
                    onChange={(e) =>
                      setNewUnitPrice(e.target.value ? Number(e.target.value) : "")
                    }
                    placeholder="0.00"
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Teslimat Suresi (Gun)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDeliveryDays}
                    onChange={(e) => setNewDeliveryDays(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Siparis Miktari
                </label>
                <input
                  type="number"
                  min="1"
                  value={newMinOrderQty}
                  onChange={(e) => setNewMinOrderQty(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Varsayilan Teklif Notu
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Kargo dahil, paletli gonderim vs."
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              {errorMsg && <p className="text-rose-600 text-xs">{errorMsg}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm transition-colors"
              >
                {isSubmitting ? "Kaydediliyor..." : "Sablonu Kaydet"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
