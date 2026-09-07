"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Bell,
  Plus,
  RefreshCw,
  Send,
  Users,
  Smartphone,
  CheckCircle,
} from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "business" | "supplier">("all");
  const [channel, setChannel] = useState<"in_app" | "push">("in_app");
  const [submitting, setSubmitting] = useState(false);

  async function loadAnnouncements() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setAnnouncements(json.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          targetRole,
          channel,
          status: "published",
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setTitle("");
        setContent("");
        loadAnnouncements();
      } else {
        const err = await res.json();
        alert(err.error || "Duyuru oluşturulamadı.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Bell size={24} className="text-rose-400" />
            Duyuru & Canlı Bildirim Masası
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Platform kullanıcılarına sistem duyuruları, bakım bildirimleri ve operasyonel iletiler gönderin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            <Plus size={14} />
            Yeni Duyuru Yayınla
          </button>
          <button
            onClick={loadAnnouncements}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Başlık & İçerik</th>
                <th className="px-4 py-3">Hedef Kitle</th>
                <th className="px-4 py-3">Kanal</th>
                <th className="px-4 py-3">Yayınlayan</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Duyurular getiriliyor..." : "Yayınlanmış duyuru bulunamadı."}
                  </td>
                </tr>
              ) : (
                announcements.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{a.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{a.content}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 capitalize">
                        {a.targetRole === "all" ? "Tüm Kullanıcılar" : a.targetRole === "supplier" ? "Tedarikçiler" : "İşletmeler"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        {a.channel === "push" ? <Smartphone size={12} /> : <Bell size={12} />}
                        {a.channel === "push" ? "Push Bildirim" : "Uygulama İçi"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{a.createdBy}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(a.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                        <CheckCircle size={12} />
                        Yayında
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-semibold text-white text-sm">Yeni Duyuru Yayınla</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Başlık *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Sistem Bakım Çalışması veya Yeni Özellik"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Duyuru Metni *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Duyuru detaylarını buraya girin..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hedef Kitle</label>
                  <select
                    value={targetRole}
                    onChange={(e: any) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none"
                  >
                    <option value="all">Tümü (Herkes)</option>
                    <option value="supplier">Sadece Tedarikçiler</option>
                    <option value="business">Sadece İşletmeler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kanal</label>
                  <select
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white focus:outline-none"
                  >
                    <option value="in_app">Uygulama İçi Bildirim</option>
                    <option value="push">Mobil Push Bildirimi</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{submitting ? "Yayınlanıyor..." : "Yayınla"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
