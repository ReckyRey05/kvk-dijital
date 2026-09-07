"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Settings,
  Flag,
  Save,
  RefreshCw,
  Sliders,
  Shield,
  CreditCard,
  Bell,
  Check,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any | null>(null);
  const [flags, setFlags] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      const [settingsRes, flagsRes] = await Promise.all([
        fetch("/api/teklifim-gelsin/admin/settings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/teklifim-gelsin/admin/feature-flags", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (settingsRes.ok) {
        const json = await settingsRes.json();
        setSettings(json.settings);
      }
      if (flagsRes.ok) {
        const json = await flagsRes.json();
        setFlags(json.flags || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleToggleFlag(key: string, currentVal: boolean) {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/feature-flags", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key,
          enabled: !currentVal,
        }),
      });

      if (res.ok) {
        setFlags((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            enabled: !currentVal,
          },
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Ayarlar kaydedilemedi.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-sm">
        Platform ayarları ve özellik bayrakları yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings size={24} className="text-primary" />
            Platform Ayarları & Feature Flags
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pazaryeri komisyon oranları, güvenlik kısıtları ve canlı modül anahtarları.
          </p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          Yenile
        </button>
      </div>

      {/* FEATURE FLAGS SECTION */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Flag size={18} className="text-primary" />
          <h2 className="text-base font-semibold text-white">Canlı Özellik Bayrakları (Feature Flags)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {Object.entries(flags).map(([key, flag]: [string, any]) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-white text-xs">{flag.name || key}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{flag.description}</div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">{key}</div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleFlag(key, flag.enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  flag.enabled ? "bg-primary" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    flag.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PLATFORM SETTINGS FORM */}
      {settings && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marketplace Settings */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sliders size={18} className="text-primary" />
                <h3 className="text-sm font-semibold text-white">Pazaryeri & Ticaret Kuralları</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Varsayılan Komisyon Oranı (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.marketplace?.defaultCommissionRate || 0}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketplace: {
                          ...settings.marketplace,
                          defaultCommissionRate: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Minimum Talep Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    value={settings.marketplace?.minRequestDurationDays || 1}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketplace: {
                          ...settings.marketplace,
                          minRequestDurationDays: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Maksimum Pazarlık Revizyonu
                  </label>
                  <input
                    type="number"
                    value={settings.marketplace?.maxNegotiationRevisions || 5}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        marketplace: {
                          ...settings.marketplace,
                          maxNegotiationRevisions: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Security & Rate Limiting */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Shield size={18} className="text-primary" />
                <h3 className="text-sm font-semibold text-white">Güvenlik & İstek Sınırları</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Dakika Başına API Limiti
                  </label>
                  <input
                    type="number"
                    value={settings.security?.rateLimitPerMin || 60}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          rateLimitPerMin: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Maksimum Yükleme Boyutu (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.security?.maxUploadSizeMb || 10}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          maxUploadSizeMb: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notification Channels */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Bell size={18} className="text-primary" />
                <h3 className="text-sm font-semibold text-white">Bildirim Kanalları</h3>
              </div>
              <div className="space-y-3 text-xs">
                {["emailEnabled", "smsEnabled", "whatsappEnabled", "pushEnabled"].map((chan) => (
                  <div key={chan} className="flex items-center justify-between">
                    <span className="text-slate-300 uppercase tracking-wider text-[11px] font-semibold">
                      {chan.replace("Enabled", "")}
                    </span>
                    <input
                      type="checkbox"
                      checked={!!settings.notifications?.[chan]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [chan]: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-800 bg-slate-950 text-primary w-4 h-4"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Mode */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <CreditCard size={18} className="text-primary" />
                <h3 className="text-sm font-semibold text-white">Ödeme Ağ Geçidi</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Sandbox / Test Modu</span>
                  <input
                    type="checkbox"
                    checked={!!settings.payments?.sandboxMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: {
                          ...settings.payments,
                          sandboxMode: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-800 bg-slate-950 text-primary w-4 h-4"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Aktif Sağlayıcı</label>
                  <input
                    type="text"
                    value={settings.payments?.activeProvider || "iyzico"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payments: {
                          ...settings.payments,
                          activeProvider: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <Check size={14} />
                Ayarlar başarıyla kaydedildi!
              </span>
            )}
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-xs shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
            >
              <Save size={15} />
              <span>{savingSettings ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
