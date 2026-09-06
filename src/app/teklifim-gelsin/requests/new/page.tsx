"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageCheck, AlertCircle } from "lucide-react";
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

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
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
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

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
