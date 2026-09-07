"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  ArrowLeft,
  Settings,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import TeamManagementTable from "@/components/teklifimGelsin/TeamManagementTable";
import AuditLogViewer from "@/components/teklifimGelsin/AuditLogViewer";
import {
  TeklifimTeamMember,
  TeklifimOrgRole,
  TeklifimProcurementPolicy,
  TeklifimAuditLog,
} from "@/types/teklifimGelsin";

function TeamManagementContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<TeklifimTeamMember[]>([]);
  const [userRole, setUserRole] = useState<TeklifimOrgRole>("owner");
  const [policy, setPolicy] = useState<TeklifimProcurementPolicy | null>(null);
  const [auditLogs, setAuditLogs] = useState<TeklifimAuditLog[]>([]);

  // Policy Form State
  const [thresholdInput, setThresholdInput] = useState<number>(35000);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policySuccess, setPolicySuccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        await loadAllTeamData(currUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const loadAllTeamData = async (currUser: any) => {
    setLoading(true);
    try {
      const token = await currUser.getIdToken();

      // 1. Members
      const teamRes = await fetch("/api/teklifim-gelsin/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setMembers(teamData.members || []);
        setUserRole(teamData.userRole || "owner");
      }

      // 2. Policy
      const polRes = await fetch("/api/teklifim-gelsin/procurement/policy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (polRes.ok) {
        const polData = await polRes.json();
        if (polData.policy) {
          setPolicy(polData.policy);
          setThresholdInput(polData.policy.approvalThreshold || 35000);
        }
      }

      // 3. Audit Logs
      const audRes = await fetch("/api/teklifim-gelsin/procurement/audit?limit=25", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (audRes.ok) {
        const audData = await audRes.json();
        setAuditLogs(audData.logs || []);
      }
    } catch (err) {
      console.error("Failed to load team data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPolicy(true);
    setPolicySuccess(false);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/procurement/policy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approvalThreshold: Number(thresholdInput) || 35000,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPolicy(data.policy);
        setPolicySuccess(true);
        setTimeout(() => setPolicySuccess(false), 3000);
      }
    } catch (err) {
      console.error("Policy update error:", err);
    } finally {
      setSavingPolicy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Ekip bilgileri yukleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
        <Users className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Ekip Yonetimi Icin Giris Yapin
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Sirket ekibinizi ve satin alma onay limitlerini yapilandirmak icin giris yapiniz.
        </p>
        <Link
          href="/teklifim-gelsin/login"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Giris Yap
        </Link>
      </div>
    );
  }

  const canManage = userRole === "owner" || userRole === "admin";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <Link
          href="/teklifim-gelsin/procurement"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Satin Alma Merkezine Don</span>
        </Link>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Ekip & Satin Alma Politikalari
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sirket ici roller, onay esikleri ve denetim izi kayitlari
        </p>
      </div>

      {/* TEAM MEMBERS TABLE */}
      <TeamManagementTable
        members={members}
        currentUserRole={userRole}
        currentUserId={user.uid}
        onRefresh={() => loadAllTeamData(user)}
      />

      {/* PROCUREMENT POLICY CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Satin Alma & Onay Politikasi
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Bu tutarin uzerindeki satin alma talepleri otomatik olarak Approver veya Admin onayina duser.
        </p>

        {policySuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Onay limiti basariyla guncellendi.</span>
          </div>
        )}

        <form onSubmit={handleUpdatePolicy} className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Onay Esigi (TL)
            </label>
            <input
              type="number"
              min={1000}
              step={1000}
              disabled={!canManage}
              value={thresholdInput}
              onChange={(e) => setThresholdInput(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {canManage && (
            <button
              type="submit"
              disabled={savingPolicy}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {savingPolicy ? "Kaydediliyor..." : "Limiti Guncelle"}
            </button>
          )}
        </form>

        {!canManage && (
          <p className="text-[11px] text-slate-400 mt-2">
            Onay limitini yalnizca Sirket Sahibi (Owner) veya Yonetici (Admin) guncelleyebilir.
          </p>
        )}
      </div>

      {/* AUDIT LOG VIEWER */}
      <AuditLogViewer logs={auditLogs} />
    </div>
  );
}

export default function TeamManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <TeamManagementContent />
    </Suspense>
  );
}
