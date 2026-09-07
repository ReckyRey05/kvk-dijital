"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageCheck, AlertCircle, Repeat } from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimProfile, TeklifimRequest } from "@/types/teklifimGelsin";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import ProgressiveRequestForm from "@/components/teklifimGelsin/ProgressiveRequestForm";

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";
  const initialTitle = searchParams.get("title") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialCity = searchParams.get("city") || "";
  const cloneFromId = searchParams.get("cloneFrom");
  const productId = searchParams.get("productId");
  const supplierId = searchParams.get("supplierId");

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
  const [cloneData, setCloneData] = useState<Partial<TeklifimRequest> | null>(null);
  const [productPrefillName, setProductPrefillName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklifim-gelsin/auth");
      } else {
        setUser(currentUser);
        // Load profile
        const cached = localStorage.getItem(`teklifim_profile_${currentUser.uid}`);
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch {}
        }

        // Check if productId is requested (Direct Quote from Product Catalog)
        if (productId) {
          try {
            const pRes = await fetch(`/api/teklifim-gelsin/products/${productId}`);
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData.product) {
                const p = pData.product;
                setProductPrefillName(p.title || p.name);
                setCloneData({
                  title: `${p.title || p.name} Teklifi`,
                  category: p.category,
                  subCategory: p.subCategory,
                  productName: p.title || p.name,
                  unit: p.unit || "Adet",
                  quantity: p.minimumOrder || 1,
                  description: `Seçilen Katalog Ürünü: ${p.title || p.name} (SKU: ${p.sku || "-"} - Birim: ${p.unit || "Adet"})\n${p.description || ""}`,
                  selectedSupplierId: p.supplierId || supplierId,
                  invitedSupplierIds: p.supplierId ? [p.supplierId] : (supplierId ? [supplierId] : []),
                });
              }
            }
          } catch (e) {
            console.warn("Product prefill notice:", e);
          }
        }
        // Check if cloneFrom is requested
        else if (cloneFromId) {
          try {
            const token = await currentUser.getIdToken();
            const cloneRes = await fetch(`/api/teklifim-gelsin/requests/${cloneFromId}/clone`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (cloneRes.ok) {
              const cData = await cloneRes.json();
              if (cData.cloneData) {
                setCloneData(cData.cloneData);
              }
            }
          } catch (e) {
            console.warn("Clone request lookup notice:", e);
          }
        }
        // Check if prefilled from zero-result search
        else if (initialPrompt || initialTitle || initialCategory || initialCity) {
          setCloneData({
            title: initialTitle || (initialPrompt ? `${initialPrompt} Tedariği` : "Toptan Malzeme Tedariği"),
            category: initialCategory || "Ambalaj & Paketleme",
            productName: initialPrompt || undefined,
            city: initialCity || undefined,
            description: initialPrompt ? `Aranan ürün/hizmet: ${initialPrompt}. Toptan alım için teklif bekliyoruz.` : undefined,
          });
        }

        setLoading(false);
      }
    });
    return () => unsub();
  }, [router, cloneFromId, productId, supplierId, initialPrompt, initialTitle, initialCategory, initialCity]);

  const handleSubmit = async (requestData: Partial<TeklifimRequest>) => {
    if (!user) return;
    setSubmitting(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Talep oluşturulamadı.");
      }

      const data = await res.json();
      if (data.request?.id) {
        router.push(`/teklifim-gelsin/requests/${data.request.id}`);
      } else {
        router.push("/teklifim-gelsin/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Talep gönderilemedi.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/teklifim-gelsin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Panele Geri Dön</span>
        </Link>
      </div>

      {cloneData && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200 text-xs flex items-center gap-2.5">
          {productPrefillName ? (
            <>
              <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Katalogdan <strong>{productPrefillName}</strong> ürünü seçildi. İhtiyacınız olan adet ve detayları belirterek toptancıya teklif isteyebilirsiniz.
              </span>
            </>
          ) : (
            <>
              <Repeat className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Önceki talebiniz şablon olarak yüklendi. Bilgileri gözden geçirip dilediğiniz gibi güncelleyebilirsiniz.
              </span>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Form Yükleniyor...
          </p>
        </div>
      ) : (
        <ProgressiveRequestForm
          profile={profile}
          initialPrompt={initialPrompt}
          initialData={cloneData}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}

export default function NewTeklifimRequestPage() {
  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
        <TeklifimHeader />
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <NewRequestContent />
        </Suspense>
      </div>
    </TeklifimThemeProvider>
  );
}
