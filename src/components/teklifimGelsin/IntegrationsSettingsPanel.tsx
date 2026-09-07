"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  Webhook,
  Bell,
  Calendar,
  ShieldCheck,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Send,
  AlertTriangle,
  ExternalLink,
  Lock,
  Download,
} from "lucide-react";
import {
  TeklifimApiKey,
  TeklifimWebhookEndpoint,
  TeklifimNotificationPreference,
  TeklifimConsentRecord,
  TeklifimIntegrationEventType,
} from "@/types/teklifimGelsin";

const ALL_SCOPES = [
  { id: "products:read", label: "Urunleri Goruntuleme (products:read)" },
  { id: "products:write", label: "Urun Ekleme ve Duzenleme (products:write)" },
  { id: "requests:read", label: "Talepleri Goruntuleme (requests:read)" },
  { id: "requests:write", label: "Talep Olusturma (requests:write)" },
  { id: "offers:read", label: "Teklifleri Goruntuleme (offers:read)" },
  { id: "offers:write", label: "Teklif Verme (offers:write)" },
  { id: "orders:read", label: "Siparisleri Goruntuleme (orders:read)" },
  { id: "suppliers:read", label: "Tedarikcileri Goruntuleme (suppliers:read)" },
];

const AVAILABLE_WEBHOOK_EVENTS: { id: TeklifimIntegrationEventType; label: string }[] = [
  { id: "request.created", label: "Yeni Talep Olusturuldu (request.created)" },
  { id: "offer.created", label: "Yeni Teklif Geldi (offer.created)" },
  { id: "offer.countered", label: "Karsi Teklif Verildi (offer.countered)" },
  { id: "offer.accepted", label: "Teklif Kabul Edildi (offer.accepted)" },
  { id: "order.created", label: "Siparis Olusturuldu (order.created)" },
  { id: "order.shipped", label: "Siparis Kargoya Verildi (order.shipped)" },
  { id: "order.delivered", label: "Siparis Teslim Edildi (order.delivered)" },
  { id: "payment.paid", label: "Odeme Tamamlandi (payment.paid)" },
  { id: "message.created", label: "Yeni Mesaj Geldi (message.created)" },
  { id: "stock.alert", label: "Stok Uyarisi (stock.alert)" },
];

export default function IntegrationsSettingsPanel() {
  const [activeTab, setActiveTab] = useState<
    "api_keys" | "webhooks" | "notifications" | "consents" | "calendar"
  >("api_keys");

  // State
  const [apiKeys, setApiKeys] = useState<TeklifimApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<TeklifimWebhookEndpoint[]>([]);
  const [preferences, setPreferences] = useState<TeklifimNotificationPreference | null>(null);
  const [consents, setConsents] = useState<TeklifimConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // New API Key Modal
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "products:read",
    "requests:read",
    "offers:read",
  ]);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<{
    rawKey: string;
    apiKey: TeklifimApiKey;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // New Webhook Modal
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<TeklifimIntegrationEventType[]>([
    "request.created",
    "offer.created",
    "order.created",
  ]);
  const [pingingId, setPingingId] = useState<string | null>(null);

  // Notifications feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysRes, whRes, prefsRes] = await Promise.all([
        fetch("/api/teklifim-gelsin/integrations/api-keys"),
        fetch("/api/teklifim-gelsin/integrations/webhooks"),
        fetch("/api/teklifim-gelsin/integrations/preferences"),
      ]);

      if (keysRes.ok) {
        const d = await keysRes.json();
        setApiKeys(d.keys || []);
      }
      if (whRes.ok) {
        const d = await whRes.json();
        setWebhooks(d.endpoints || []);
      }
      if (prefsRes.ok) {
        const d = await prefsRes.json();
        setPreferences(d.preferences || null);
        setConsents(d.consents || []);
        if (d.preferences?.categories?.marketing) {
          setMarketingConsent(true);
        }
      }
    } catch (err) {
      console.error("Fetch integration data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      const res = await fetch("/api/teklifim-gelsin/integrations/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName, scopes: selectedScopes }),
      });

      const d = await res.json();
      if (res.ok && d.success) {
        setNewlyCreatedKey({ rawKey: d.rawKey, apiKey: d.apiKey });
        setApiKeys([d.apiKey, ...apiKeys]);
        setKeyName("");
      } else {
        setFeedback({ type: "error", message: d.error || "Anahtar olusturulamadi." });
      }
    } catch {
      setFeedback({ type: "error", message: "Baglanti hatasi." });
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm("Bu API anahtarini iptal etmek istediginizden emin misiniz? Bu islem geri alinamaz.")) {
      return;
    }

    try {
      const res = await fetch(`/api/teklifim-gelsin/integrations/api-keys/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setApiKeys(apiKeys.map(k => (k.id === id ? { ...k, status: "revoked" } : k)));
        setFeedback({ type: "success", message: "API anahtari iptal edildi." });
      }
    } catch {
      setFeedback({ type: "error", message: "Islem basarisiz oldu." });
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || selectedEvents.length === 0) return;

    try {
      const res = await fetch("/api/teklifim-gelsin/integrations/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, events: selectedEvents }),
      });

      const d = await res.json();
      if (res.ok && d.success) {
        setWebhooks([d.endpoint, ...webhooks]);
        setShowWebhookModal(false);
        setWebhookUrl("");
        setFeedback({ type: "success", message: "Webhook endpoint basariyla eklendi." });
      } else {
        setFeedback({ type: "error", message: d.error || "Webhook eklenemedi." });
      }
    } catch {
      setFeedback({ type: "error", message: "Baglanti hatasi." });
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Bu webhook endpointini silmek istediginizden emin misiniz?")) {
      return;
    }

    try {
      const res = await fetch(`/api/teklifim-gelsin/integrations/webhooks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWebhooks(webhooks.filter(w => w.id !== id));
        setFeedback({ type: "success", message: "Webhook silindi." });
      }
    } catch {
      setFeedback({ type: "error", message: "Webhook silinemedi." });
    }
  };

  const handlePingWebhook = async (id: string) => {
    setPingingId(id);
    try {
      const res = await fetch(`/api/teklifim-gelsin/integrations/webhooks/${id}/ping`, {
        method: "POST",
      });
      const d = await res.json();
      if (d.success) {
        setFeedback({ type: "success", message: "Test ping basariyla iletildi (HTTP 200)." });
      } else {
        setFeedback({
          type: "error",
          message: `Test ping basarisiz oldu. Durum kodu: ${d.delivery?.statusCode || "Bilinmiyor"}. Hata: ${d.delivery?.errorMessage || ""}`,
        });
      }
    } catch {
      setFeedback({ type: "error", message: "Ping gonderilemedi." });
    } finally {
      setPingingId(null);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setSavingPrefs(true);
    setFeedback(null);

    try {
      const updatedPrefs = {
        ...preferences,
        categories: {
          ...preferences.categories,
          marketing: marketingConsent,
        },
      };

      const res = await fetch("/api/teklifim-gelsin/integrations/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: updatedPrefs,
          marketingConsent,
        }),
      });

      if (res.ok) {
        setFeedback({ type: "success", message: "Bildirim tercihleri ve iletisim izinleri kaydedildi." });
      } else {
        setFeedback({ type: "error", message: "Kaydedilemedi." });
      }
    } catch {
      setFeedback({ type: "error", message: "Baglanti hatasi olustu." });
    } finally {
      setSavingPrefs(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              KvK Dijital Cozumler Entegrasyon Merkezi
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Entegrasyonlar, API ve Otomasyon
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Dis yazilimlar, ERP/CRM, bildirim kanallari ve webhook sistemleri ile guvenli baglanti kurun.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Yenile
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
              feedback.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs underline font-medium hover:opacity-80"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 mt-6 pt-4">
          <button
            onClick={() => setActiveTab("api_keys")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === "api_keys"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API Anahtarlari
          </button>

          <button
            onClick={() => setActiveTab("webhooks")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === "webhooks"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            Webhook Abonelikleri
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === "notifications"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Bildirim Kanallari & Tercihler
          </button>

          <button
            onClick={() => setActiveTab("consents")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === "consents"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Iletisim ve Riza Kayitlari
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
              activeTab === "calendar"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Takvim Senkronizasyonu (.ics)
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {/* TAB 1: API KEYS */}
        {activeTab === "api_keys" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Public API (v1) Anahtarlari
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ERP veya muhasebe sistemlerinizin Toptancim Cebimde ile haberlesmesi icin anahtar olusturun.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewlyCreatedKey(null);
                  setShowKeyModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni API Anahtari Olustur
              </button>
            </div>

            {/* Keys Table */}
            {apiKeys.length === 0 ? (
              <div className="text-center py-10">
                <Key className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Henuz aktif bir API anahtariniz bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Isim</th>
                      <th className="py-2.5 px-3">On Ek (Prefix)</th>
                      <th className="py-2.5 px-3">Yetkiler (Scopes)</th>
                      <th className="py-2.5 px-3">Durum</th>
                      <th className="py-2.5 px-3">Olusturuldu</th>
                      <th className="py-2.5 px-3">Son Kullanim</th>
                      <th className="py-2.5 px-3 text-right">Islem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {apiKeys.map(key => (
                      <tr key={key.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {key.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {key.keyPrefix}••••••••
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {key.scopes.map(s => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              key.status === "active"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {key.status === "active" ? "Aktif" : "Iptal Edildi"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(key.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {key.lastUsedAt
                            ? new Date(key.lastUsedAt).toLocaleDateString("tr-TR")
                            : "Kullanilmadi"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {key.status === "active" && (
                            <button
                              onClick={() => handleRevokeKey(key.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium text-xs inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Iptal Et
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WEBHOOKS */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Webhook Abonelikleri
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ticari olaylar gerceklestiginde sunucunuza HMAC-SHA256 imzali anlik HTTP POST bildirimleri alin.
                </p>
              </div>
              <button
                onClick={() => setShowWebhookModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Webhook Ekle
              </button>
            </div>

            {webhooks.length === 0 ? (
              <div className="text-center py-10">
                <Webhook className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Kayitli webhook aboneligi bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map(wh => (
                  <div
                    key={wh.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {wh.url}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            wh.status === "active"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                              : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {wh.status === "active" ? "Aktif" : "Hata Veriyor"}
                        </span>
                        {wh.failureCount > 0 && (
                          <span className="text-[10px] text-red-500">
                            ({wh.failureCount} hata)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Gizli Anahtar: {wh.secret}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {wh.events.map(ev => (
                          <span
                            key={ev}
                            className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[10px] text-blue-700 dark:text-blue-300"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePingWebhook(wh.id)}
                        disabled={pingingId === wh.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Send className={`w-3 h-3 ${pingingId === wh.id ? "animate-pulse" : ""}`} />
                        {pingingId === wh.id ? "Test Ediliyor..." : "Test Ping Gonder"}
                      </button>

                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTIFICATION CHANNELS & PREFERENCES */}
        {activeTab === "notifications" && preferences && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bildirim Kanallari ve Guvenlik Tercihleri
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hangi kanallardan ne tur bildirimler almak istediginizi yapilandirin.
              </p>
            </div>

            {/* Channels Grid */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Iletisim Kanallari
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "push", label: "Mobil & Web Push Bildirimleri", desc: "Anlik tarayici ve mobil bildirimler" },
                  { key: "email", label: "E-Posta Bildirimleri", desc: "Siparis ve teklif e-posta ozetleri" },
                  { key: "sms", label: "SMS Bildirimleri", desc: "Kritik durumlar icin kisa mesaj" },
                  { key: "whatsapp", label: "WhatsApp Mesajlari", desc: "Siparis ve kargo durumu guncellemeleri" },
                ].map(ch => (
                  <label
                    key={ch.key}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(preferences.channels as any)[ch.key] !== false}
                      onChange={e =>
                        setPreferences({
                          ...preferences,
                          channels: {
                            ...preferences.channels,
                            [ch.key]: e.target.checked,
                          },
                        })
                      }
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {ch.label}
                      </span>
                      <p className="text-[11px] text-slate-500">{ch.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
                Bildirim Kategorileri (Olay Turleri)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: "offers", label: "Teklifler ve Karsilikli Pazarlik", req: true },
                  { key: "messages", label: "Birebir Sohbet Mesajlari", req: false },
                  { key: "orders", label: "Siparis Durumu ve Onaylar", req: true },
                  { key: "payments", label: "Odeme ve Finans Islemleri", req: true },
                  { key: "delivery", label: "Kargo ve Teslimat Takibi", req: true },
                ].map(cat => (
                  <div
                    key={cat.key}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-900 dark:text-white">
                        {cat.label}
                      </span>
                      {cat.req && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded font-medium">
                          <Lock className="w-2.5 h-2.5" />
                          Zorunlu / Isletme Guvenligi
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      disabled={cat.req}
                      checked={(preferences.categories as any)[cat.key] !== false}
                      onChange={e =>
                        setPreferences({
                          ...preferences,
                          categories: {
                            ...preferences.categories,
                            [cat.key]: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Marketing Consent */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={e => setMarketingConsent(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Pazarlama, Kampanya ve Yeni Tedarikci Firsatlari Iletisimi (KVKK / ETK)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    KvK Dijital Cozumler tarafindan platformdaki toptan fiyat indirimleri, yeni urunler ve kategori firsatlari hakkinda SMS, E-Posta veya WhatsApp uzerinden ticari elektronik ileti almayi kabul ediyorum. Bu riza istediginiz zaman geri cekilebilir.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
              >
                {savingPrefs ? "Kaydediliyor..." : "Tercihleri Kaydet"}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: CONSENTS */}
        {activeTab === "consents" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Riza ve Iletisim Onay Gecmisi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                KVKK ve Ticari Elektronik Ileti (ETK) mevzuati geregi tutulan zaman damgali onay ve ret kayitlari.
              </p>
            </div>

            {consents.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                Kayitli riza gecmisi bulunmuyor.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Kanal</th>
                      <th className="py-2.5 px-3">Tur</th>
                      <th className="py-2.5 px-3">Durum</th>
                      <th className="py-2.5 px-3">Tarih</th>
                      <th className="py-2.5 px-3">Kaynak</th>
                      <th className="py-2.5 px-3">Versiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {consents.map(c => (
                      <tr key={c.id}>
                        <td className="py-3 px-3 font-semibold uppercase">{c.channel}</td>
                        <td className="py-3 px-3 capitalize">{c.type}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.granted
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                            }`}
                          >
                            {c.granted ? "Onaylandi" : "Geri Cekildi"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(c.granted ? c.grantedAt : c.revokedAt || 0).toLocaleString("tr-TR")}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{c.source}</td>
                        <td className="py-3 px-3 font-mono text-slate-500">{c.version}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CALENDAR SYNC */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ticari Takvim Senkronizasyonu (RFC 5545 iCalendar)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Yaklasan kargo teslimatlari, teklif gecerlilik suresi sonlari ve ticari randevulari Google Calendar, Outlook veya Apple Takvim&apos;e aktarin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 space-y-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Download className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Takvim Dosyasi (.ics) Indir
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Tek tikla tum guncel ticari teslimat ve teklif takviminizi standart .ics formatinda bilgisayariniza indirin.
                </p>
                <a
                  href="/api/teklifim-gelsin/calendar/export"
                  download="toptancim-takvim.ics"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Takvim Dosyasini Indir (.ics)
                </a>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 space-y-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <Calendar className="w-4 h-4" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Canli Takvim Aboneligi (Webcal)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Google Calendar veya Outlook Takviminize abone olarak anlik guncellemeleri otomatik alabilirsiniz:
                </p>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">
                  https://kvkdijital.com/api/teklifim-gelsin/calendar/export
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CREATE API KEY */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            {!newlyCreatedKey ? (
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Yeni API Anahtari Olustur
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Anahtari tanimlayan bir isim verin ve erisim izinlerini secin.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Anahtar Ismi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="orn. Muhasebe ERP Entegrasyonu"
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Erisim Yetkileri (Scopes)
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {ALL_SCOPES.map(sc => (
                      <label
                        key={sc.id}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(sc.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, sc.id]);
                            } else {
                              setSelectedScopes(selectedScopes.filter(s => s !== sc.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{sc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                  >
                    Vazgec
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                  >
                    Olustur
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Dikkat: Bu anahtar yalnizca bir kez gosterilir!</span>
                    <p className="mt-0.5">
                      Guvenliginiz geregi anahtarin acik halini sistemlerimizde saklamiyoruz. Lutfen anahtari guvenli bir yere kopyalayip kaydedin.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    API Anahtariniz
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={newlyCreatedKey.rawKey}
                      className="w-full px-3 py-2 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => copyToClipboard(newlyCreatedKey.rawKey)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1 shrink-0"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? "Kopyalandi" : "Kopyala"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setNewlyCreatedKey(null);
                      setShowKeyModal(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition"
                  >
                    Kaydettim, Pencereyi Kapat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE WEBHOOK */}
      {showWebhookModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Yeni Webhook Endpoint Ekle
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Olay bildirimlerinin gonderilecegi HTTPS URL adresini ve abone olunacak olaylari secin.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Webhook URL (HTTP / HTTPS)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.sirketiniz.com/webhooks/teklifim"
                  value={webhookUrl}
                  onChange={e => setWebhookUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Abone Olunacak Olaylar
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {AVAILABLE_WEBHOOK_EVENTS.map(ev => (
                    <label
                      key={ev.id}
                      className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(ev.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedEvents([...selectedEvents, ev.id]);
                          } else {
                            setSelectedEvents(selectedEvents.filter(x => x !== ev.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{ev.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Vazgec
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  Webhook Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
