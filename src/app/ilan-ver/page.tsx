"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import ItemSepetiInput from "@/components/itemsepeti/ui/ItemSepetiInput";
import {
  ItemSepetiProductType,
  ItemSepetiDeliveryMethod,
  ItemSepetiGame,
  ItemSepetiCategory,
} from "@/types/marketplace";
import { PRODUCT_TYPE_DELIVERY_MATRIX } from "@/lib/itemsepeti/catalogUtils";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateListingPage() {
  const router = useRouter();

  // State
  const [games, setGames] = useState<ItemSepetiGame[]>([]);
  const [categories, setCategories] = useState<ItemSepetiCategory[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedProductType, setSelectedProductType] = useState<ItemSepetiProductType>("ITEM");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedServerId, setSelectedServerId] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [deliveryMethod, setDeliveryMethod] = useState<ItemSepetiDeliveryMethod>("MANUAL_ITEM");
  const [deliverySlaHours, setDeliverySlaHours] = useState("1");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load games on mount
  useEffect(() => {
    fetch("/api/itemsepeti/games")
      .then((res) => res.json())
      .then((data) => {
        if (data.games) {
          setGames(data.games);
          if (data.games.length > 0) setSelectedGameId(data.games[0].id);
        }
      })
      .catch(() => {});
  }, []);

  // Load categories when game changes
  useEffect(() => {
    if (!selectedGameId) return;
    fetch(`/api/itemsepeti/games?gameId=${selectedGameId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setSelectedCategoryId(data.categories[0].id);
            setSelectedProductType(data.categories[0].productType);
            setDeliveryMethod(data.categories[0].defaultDeliveryMethod);
          }
        }
      })
      .catch(() => {});
  }, [selectedGameId]);

  const selectedGame = games.find((g) => g.id === selectedGameId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Delivery options for selected product type
  const allowedDeliveryMethods = PRODUCT_TYPE_DELIVERY_MATRIX[selectedProductType] || ["MANUAL_ITEM"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        sellerId: "seller_demo_user", // Will be replaced by Firebase Auth UID in prod
        gameId: selectedGameId,
        categoryId: selectedCategoryId,
        serverId: selectedServerId || undefined,
        productType: selectedProductType,
        title,
        description,
        unitPrice: Number(unitPrice),
        stockQuantity: Number(stockQuantity),
        deliveryMethod,
        deliverySlaHours: Number(deliverySlaHours),
      };

      const res = await fetch("/api/itemsepeti/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "İlan oluşturulamadı.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/kategori/${selectedGame?.slug || "cs2"}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex items-center gap-2">
            <Link
              href="/itemsepeti"
              className="inline-flex items-center gap-1 text-xs text-[#9498A6] hover:text-inherit transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Geri Dön</span>
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-inherit">Yeni İlan Oluştur</h1>
            <p className="text-xs sm:text-sm text-[#9498A6]">
              Oyun içi eşya, yang, kod veya hesabınızı İtemSepeti güvencesiyle listeleyin.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-[10px] bg-[#F87171]/10 border border-[#F87171]/25 text-[#F87171] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-[10px] bg-[#34D399]/10 border border-[#34D399]/25 text-[#34D399] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>İlanınız başarıyla yayınlandı! Yönlendiriliyorsunuz...</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-[16px] border space-y-6 bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] shadow-xs"
          >
            {/* 1. OYUN SEÇİMİ */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-inherit">1. Oyun</label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full h-11 px-3 rounded-[8px] text-sm bg-black/20 border border-[#282C3A] text-inherit focus:ring-2 focus:ring-[#E8A33D] focus:outline-none"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#1B1E27]">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. KATEGORİ SEÇİMİ */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-inherit">2. Kategori</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  const cat = categories.find((c) => c.id === e.target.value);
                  if (cat) {
                    setSelectedProductType(cat.productType);
                    setDeliveryMethod(cat.defaultDeliveryMethod);
                  }
                }}
                className="w-full h-11 px-3 rounded-[8px] text-sm bg-black/20 border border-[#282C3A] text-inherit focus:ring-2 focus:ring-[#E8A33D] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1B1E27]">
                    {c.name} ({c.productType})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. SUNUCU SEÇİMİ (ŞARTA BAĞLI) */}
            {selectedGame?.servers && selectedGame.servers.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-inherit">
                  3. Sunucu (Server) <span className="text-[#E8A33D]">*</span>
                </label>
                <select
                  value={selectedServerId}
                  onChange={(e) => setSelectedServerId(e.target.value)}
                  required
                  className="w-full h-11 px-3 rounded-[8px] text-sm bg-black/20 border border-[#282C3A] text-inherit focus:ring-2 focus:ring-[#E8A33D] focus:outline-none"
                >
                  <option value="" className="bg-[#1B1E27]">Sunucu Seçiniz</option>
                  {selectedGame.servers.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1B1E27]">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 4. İLAN BİLGİLERİ */}
            <div className="space-y-4 pt-2 border-t border-white/5">
              <ItemSepetiInput
                label="İlan Başlığı"
                placeholder="Örn: AK-47 | Asiimov (Field-Tested) 0.18 Float"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={5}
                maxLength={120}
                hint="En az 5, en fazla 120 karakter."
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-inherit">Açıklama</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="İlanınızın teslimat koşulları, ürün özellikleri ve detaylarını açıklayın..."
                  required
                  minLength={10}
                  maxLength={3000}
                  className="w-full p-3 rounded-[8px] text-sm bg-black/20 border border-[#282C3A] text-inherit placeholder:text-[#9498A6] focus:ring-2 focus:ring-[#E8A33D] focus:outline-none"
                />
              </div>
            </div>

            {/* 5. FİYAT, STOK VE TESLİMAT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <ItemSepetiInput
                label="Birim Fiyat (TL)"
                type="number"
                placeholder="100"
                min={selectedCategory?.minPrice || 1}
                max={selectedCategory?.maxPrice || 500000}
                step="any"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
                hint={selectedCategory ? `Min: ${selectedCategory.minPrice} TL, Max: ${selectedCategory.maxPrice} TL` : undefined}
              />

              <ItemSepetiInput
                label="Stok Miktarı"
                type="number"
                min="1"
                step="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-inherit">Teslimat Yöntemi</label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-[8px] text-sm bg-black/20 border border-[#282C3A] text-inherit focus:ring-2 focus:ring-[#E8A33D] focus:outline-none"
                >
                  {allowedDeliveryMethods.map((m) => (
                    <option key={m} value={m} className="bg-[#1B1E27]">
                      {m === "AUTOMATIC_CODE"
                        ? "Anında Otomatik Kod Açıklama"
                        : m === "CURRENCY_TRADE"
                        ? "Oyun İçi Ticaret / Transfer"
                        : "Manuel Teslimat"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold tracking-wide text-inherit">Teslimat Süresi (SLA)</label>
                <select
                  value={deliverySlaHours}
                  onChange={(e) => setDeliverySlaHours(e.target.value)}
                  className="w-full h-11 px-3 rounded-[8px] text-sm bg-black/20 border border-[#282C3A] text-inherit focus:ring-2 focus:ring-[#E8A33D] focus:outline-none"
                >
                  <option value="1" className="bg-[#1B1E27]">1 Saat İçinde</option>
                  <option value="2" className="bg-[#1B1E27]">2 Saat İçinde</option>
                  <option value="6" className="bg-[#1B1E27]">6 Saat İçinde</option>
                  <option value="24" className="bg-[#1B1E27]">24 Saat İçinde</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <ItemSepetiButton variant="primary" size="lg" type="submit" isLoading={loading}>
                İlanı Yayınla
              </ItemSepetiButton>
            </div>
          </form>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
