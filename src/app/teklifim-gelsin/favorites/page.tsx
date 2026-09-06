"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Building2,
  Search,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Send,
  Trash2,
  ExternalLink,
} from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import SupplierCard from "@/components/teklifimGelsin/SupplierCard";
import DirectRequestModal from "@/components/teklifimGelsin/DirectRequestModal";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimProfile, TeklifimFavorite, TeklifimRequest } from "@/types/teklifimGelsin";

export default function FavoritesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<TeklifimFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Direct request quote modal state
  const [modalSupplier, setModalSupplier] = useState<TeklifimProfile | null>(null);
  const [openRequests, setOpenRequests] = useState<TeklifimRequest[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/teklifim-gelsin/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setFavorites(data.favorites || []);
          }
        } catch (err) {
          console.error("Favorites load error:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleToggleFavorite = async (supplier: TeklifimProfile) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplier }),
      });
      if (res.ok) {
        // Remove from local list
        setFavorites((prev) => prev.filter((f) => f.supplierId !== supplier.uid));
      }
    } catch (err) {
      console.error("Remove favorite failed:", err);
    }
  };

  const handleRequestQuote = async (supplier: TeklifimProfile) => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const rRes = await fetch("/api/teklifim-gelsin/requests?role=business", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        const activeList = (rData.requests || []).filter(
          (r: TeklifimRequest) =>
            r.status !== "supplier_selected" &&
            r.status !== "completed" &&
            r.status !== "cancelled" &&
            r.status !== "expired"
        );
        setOpenRequests(activeList);
        setModalSupplier(supplier);
      }
    } catch (err) {
      console.error("Failed to load requests for modal:", err);
    }
  };

  const handleSendDirectInvitation = async (requestId: string) => {
    if (!modalSupplier || !currentUser) return;
    setSendingInvite(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/requests/${requestId}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplierId: modalSupplier.uid }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Davet iletilemedi.");
      }
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <TeklifimHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* TITLE */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Kayıtlı Tedarikçilerim</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Favori Toptancılar ve Üreticiler
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Sık çalıştığınız veya gelecekteki siparişleriniz için kaydettiğiniz güvenilir tedarikçilerin listesi.
          </p>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Favorileriniz yükleniyor...</p>
          </div>
        ) : !currentUser ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Favori Tedarikçilerinizi Görmek İçin Giriş Yapın
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Kayıtlı firmaları saklamak ve hızlıca teklif istemek için işletme hesabınızla giriş yapmalısınız.
              </p>
            </div>
            <Link
              href="/teklifim-gelsin/auth?role=business"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <span>Giriş Yap / Kayıt Ol</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : favorites.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Henüz Favori Tedarikçiniz Yok
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tedarikçi keşif dizinini inceleyerek beğendiğiniz firmaları kalp ikonuna tıklayıp listenize ekleyebilirsiniz.
              </p>
            </div>
            <Link
              href="/teklifim-gelsin/suppliers"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>Tedarikçileri Keşfet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map((fav) => {
              const adaptedSupplier: TeklifimProfile = {
                uid: fav.supplierId,
                role: "supplier",
                companyName: fav.supplierName,
                contactName: "Yetkili",
                city: fav.supplierCity,
                categories: fav.supplierCategories,
                minOrder: fav.supplierMinOrder,
                responseRate: fav.supplierResponseRate,
                isVerified: true,
                createdAt: fav.createdAt,
                updatedAt: fav.createdAt,
              };

              return (
                <SupplierCard
                  key={fav.id || fav.supplierId}
                  supplier={adaptedSupplier}
                  isFavorited={true}
                  onToggleFavorite={handleToggleFavorite}
                  onRequestQuote={handleRequestQuote}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* DIRECT REQUEST MODAL */}
      {modalSupplier && (
        <DirectRequestModal
          supplier={modalSupplier}
          openRequests={openRequests}
          onClose={() => setModalSupplier(null)}
          onSend={handleSendDirectInvitation}
          sending={sendingInvite}
        />
      )}
    </div>
  );
}
