"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  ArrowRight,
  Clock,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!token) return;
    checkInvitation();
  }, [token]);

  const checkInvitation = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teklifim-gelsin/team/invite/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gecersiz davet linki.");
      } else {
        setInvitation(data);
      }
    } catch (err) {
      setErrorMsg("Davet bilgisi dogrulanamadi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      router.push(`/teklifim-gelsin/login?redirect=/teklifim-gelsin/team/invite/${token}`);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/team/invite/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Davet kabul edilemedi.");
      }

      setAccepted(true);
      setTimeout(() => {
        router.push("/teklifim-gelsin/procurement");
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || "Davet kabul edilemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <Users className="w-7 h-7" />
        </div>

        {loading ? (
          <div className="py-8 text-xs text-slate-400">
            Davet bilgisi dogrulaniyor...
          </div>
        ) : errorMsg ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <div>
                <strong className="block font-bold">Davet Gecersiz</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
            <Link
              href="/teklifim-gelsin"
              className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl"
            >
              Ana Sayfaya Don
            </Link>
          </div>
        ) : accepted ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ekibe Katildiniz!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Satin Alma Merkezine yonlendiriliyorsunuz...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Sirket Ekip Daveti
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {invitation?.businessName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sizi kurumsal satin alma ekibine <strong>{invitation?.role}</strong> rolu ile davet etti.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span>Davet Edilen:</span>
                <strong className="text-slate-800 dark:text-slate-200">{invitation?.email}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Atanacak Gorev:</span>
                <strong className="text-slate-800 dark:text-slate-200 uppercase">{invitation?.role}</strong>
              </div>
            </div>

            {!user && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                Daveti kabul etmek icin once platforma giris yapmaniz gerekmektedir.
              </p>
            )}

            <button
              onClick={handleAccept}
              disabled={submitting}
              className="w-full py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{user ? (submitting ? "Katilim Yapiliyor..." : "Daveti Kabul Et & Ekibe Katil") : "Giris Yap & Kabul Et"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
