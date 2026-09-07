"use client";

import React, { useState } from "react";
import {
  X,
  UserPlus,
  Mail,
  Shield,
  Copy,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { TeklifimOrgRole } from "@/types/teklifimGelsin";

interface InviteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteTeamModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteTeamModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeklifimOrgRole>("buyer");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/teklifim-gelsin/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Davet olusturulamadi.");
      }

      setInviteUrl(data.inviteUrl);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Davet islemi basarisiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetForm = () => {
    setEmail("");
    setRole("buyer");
    setInviteUrl(null);
    setCopied(false);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ekip Arkadasi Davet Et
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guvenli baglanti ile sirket hesabina yetkilendirme
              </p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {inviteUrl ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Davet Baglantisi Olusturuldu
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Baglanti 7 gun boyunca gecerlidir. Ekip arkadasiniza iletebilirsiniz.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-mono w-full focus:outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Kopyalandi" : "Kopyala"}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                Kapat
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  E-Posta Adresi *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="calisan@sirketiniz.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Atanacak Gorev & Rol *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as TeklifimOrgRole)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="buyer">Buyer (Satin Alma Sorumlusu - Talep & Liste Olusturur)</option>
                  <option value="approver">Approver (Onay Yetkilisi - Talepleri & Alimlari Onaylar)</option>
                  <option value="admin">Admin (Yonetici - Ekip, Talep ve Rapor Yonetimi)</option>
                  <option value="viewer">Viewer (Gozlemci - Sadece Goruntuleme)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                <span>
                  Davet edilen kisiye tahmin edilemez, kriptografik bir baglanti olusturulacaktir.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Vazgec
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
                >
                  {loading ? "Olusturuluyor..." : "Davet Linki Uret"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
