"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Headset,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // Thread detail & reply
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  async function loadTickets() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/teklifim-gelsin/admin/support?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setTickets(json.tickets || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setSubmittingReply(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(`/api/teklifim-gelsin/admin/support/${selectedTicket.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          newStatus: newStatus || undefined,
          internalNote: internalNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setReplyMessage("");
        setInternalNote("");
        setNewStatus("");
        // Reload list and selected ticket
        await loadTickets();
        // Update local ticket messages
        const updatedTicket = {
          ...selectedTicket,
          messages: [
            ...selectedTicket.messages,
            {
              id: `msg_${Date.now()}`,
              senderName: "Destek Ekibi",
              senderRole: "support",
              message: replyMessage.trim(),
              timestamp: Date.now(),
            },
          ],
          status: newStatus || selectedTicket.status,
        };
        setSelectedTicket(updatedTicket);
      } else {
        const err = await res.json();
        alert(err.error || "Yanıt gönderilemedi.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReply(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Headset size={24} className="text-primary" />
            Destek Masası (Support Desk)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kullanıcı ve toptancı yardım taleplerini yanıtlayın, durumlarını yönetin.
          </p>
        </div>
        <button
          onClick={loadTickets}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-3 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            <span className="text-xs text-slate-400">Durum:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none flex-1"
            >
              <option value="all">Tüm Talepler</option>
              <option value="open">Açık</option>
              <option value="in_progress">İşleniyor</option>
              <option value="waiting">Beklemede</option>
              <option value="resolved">Çözüldü</option>
              <option value="closed">Kapalı</option>
            </select>
          </div>

          <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 divide-y divide-slate-800/80 overflow-hidden shadow-xl max-h-[600px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {loading ? "Talepler getiriliyor..." : "Destek talebi bulunamadı."}
              </div>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTicket(t);
                      setNewStatus(t.status);
                    }}
                    className={`w-full text-left p-4 transition-colors ${
                      isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-primary font-semibold">
                        {t.ticketNumber || t.id}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                          t.priority === "urgent"
                            ? "bg-red-500/10 text-red-400"
                            : t.priority === "high"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <div className="font-medium text-white text-xs truncate">{t.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {t.userName || t.userEmail}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                      <span>{t.category}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Ticket Thread & Reply */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6 flex flex-col h-[650px]">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-primary font-bold">
                      {selectedTicket.ticketNumber || selectedTicket.id}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedTicket.status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedTicket.userEmail} ({selectedTicket.userRole})
                  </p>
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {(selectedTicket.messages || []).map((m: any, i: number) => {
                  const isStaff = m.senderRole === "support" || m.senderRole === "admin";
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-xl text-xs max-w-lg ${
                        isStaff
                          ? "ml-auto bg-primary/20 border border-primary/30 text-slate-100"
                          : "mr-auto bg-slate-950/70 border border-slate-800 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold">{m.senderName}</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString("tr-TR")}</span>
                      </div>
                      <div className="whitespace-pre-wrap">{m.message}</div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReply} className="border-t border-slate-800 pt-4 space-y-3 text-xs">
                <textarea
                  rows={3}
                  required
                  placeholder="Kullanıcıya yanıt yazın..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Yeni Durum:</span>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                    >
                      <option value="">Değiştirme</option>
                      <option value="in_progress">İşleniyor</option>
                      <option value="waiting">Kullanıcı Yanıtı Bekliyor</option>
                      <option value="resolved">Çözüldü</option>
                      <option value="closed">Kapat</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{submittingReply ? "Gönderiliyor..." : "Yanıtı Gönder"}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs h-[600px] flex items-center justify-center">
              İncelemek ve yanıtlamak için soldaki listeden bir destek talebi seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
