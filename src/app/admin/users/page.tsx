"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw,
  MessageSquare,
  FileText,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Suspend modal state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDays, setSuspendDays] = useState(30);
  const [suspendNotes, setSuspendNotes] = useState("");
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  // Notes modal state
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/teklifim-gelsin/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch (err) {
      console.error("Kullanicilar yuklenemedi:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  async function handleSuspendSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !suspendReason.trim()) return;
    setSubmittingSuspend(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(`/api/teklifim-gelsin/admin/users/${selectedUser.uid}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "suspend",
          reason: suspendReason.trim(),
          durationDays: suspendDays,
          notes: suspendNotes.trim(),
        }),
      });

      if (res.ok) {
        setSuspendModalOpen(false);
        setSuspendReason("");
        setSuspendNotes("");
        loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Islem basarisiz.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingSuspend(false);
    }
  }

  async function handleUnsuspend(targetUser: any) {
    if (!confirm(`${targetUser.companyName || targetUser.email} hesabini yeniden aktif etmek istiyor musunuz?`)) return;
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(`/api/teklifim-gelsin/admin/users/${targetUser.uid}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "unsuspend",
        }),
      });

      if (res.ok) {
        loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || "Islem basarisiz.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function openNotesModal(targetUser: any) {
    setSelectedUser(targetUser);
    setNotesModalOpen(true);
    setLoadingNotes(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch(
        `/api/teklifim-gelsin/admin/moderation-notes?targetType=user&targetId=${targetUser.uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const json = await res.json();
        setNotesList(json.notes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !newNote.trim()) return;
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/moderation-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: "user",
          targetId: selectedUser.uid,
          note: newNote.trim(),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setNotesList([json.note, ...notesList]);
        setNewNote("");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users size={24} className="text-primary" />
            Kullanıcı & Firma Yönetimi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            İşletme ve tedarikçi hesaplarını denetleyin, askıya alın veya durumlarını güncelleyin.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
          className="flex items-center gap-2 w-full md:w-96 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2"
        >
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Firma, e-posta, isim ara..."
            className="bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none flex-1"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter size={14} />
            <span>Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Tümü</option>
              <option value="business">İşletmeler</option>
              <option value="supplier">Tedarikçiler</option>
              <option value="admin">Yöneticiler</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Durum:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="suspended">Askıya Alınmış</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Firma / İsim</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Doğrulama</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Kayıt Tarihi</th>
                <th className="px-4 py-3 text-right">Eylemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Kullanıcılar getiriliyor..." : "Eşleşen kullanıcı bulunamadı."}
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSuspended = u.status === "suspended";
                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{u.companyName}</div>
                        <div className="text-[11px] text-slate-400">{u.contactName}</div>
                        {u.city && (
                          <div className="text-[10px] text-slate-500">
                            {u.city} {u.district ? `/${u.district}` : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-slate-400">{u.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            u.role === "supplier"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : u.role === "business"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {u.role === "supplier" ? "Tedarikçi" : u.role === "business" ? "İşletme" : u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                            <ShieldCheck size={13} />
                            Doğrulanmış
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Onaysız</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">
                            <Ban size={12} />
                            Askıda
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={12} />
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("tr-TR") : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openNotesModal(u)}
                            title="Moderasyon Notları"
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                          >
                            <MessageSquare size={14} />
                          </button>

                          {isSuspended ? (
                            <button
                              onClick={() => handleUnsuspend(u)}
                              className="px-2.5 py-1 rounded text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                            >
                              Aktif Et
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setSuspendModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors"
                            >
                              Askıya Al
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Modal */}
      {suspendModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Hesabı Askıya Al</h3>
                <p className="text-xs text-slate-400">{selectedUser.companyName || selectedUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleSuspendSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Gerekçe *</label>
                <input
                  type="text"
                  required
                  placeholder="Kural ihlali, sahte beyan, şüpheli işlem..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Süre (Gün)</label>
                <select
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  <option value={7}>7 Gün</option>
                  <option value={15}>15 Gün</option>
                  <option value={30}>30 Gün (1 Ay)</option>
                  <option value={90}>90 Gün (3 Ay)</option>
                  <option value={3650}>Süresiz (Kalıcı Kapatma)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Dahili Moderatör Notu</label>
                <textarea
                  rows={2}
                  placeholder="Yalnızca adminlerin görebileceği işlem detayı..."
                  value={suspendNotes}
                  onChange={(e) => setSuspendNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submittingSuspend}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium disabled:opacity-50"
                >
                  {submittingSuspend ? "İşleniyor..." : "Hesabı Askıya Al"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Notes Modal */}
      {notesModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                <h3 className="font-semibold text-white">Dahili Moderasyon Notları</h3>
              </div>
              <button
                onClick={() => setNotesModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Kapat
              </button>
            </div>
            <p className="text-xs text-slate-400">{selectedUser.companyName} ({selectedUser.email})</p>

            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                rows={2}
                required
                placeholder="Yeni moderatör notu ekleyin..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-primary hover:bg-primary/90 text-white text-xs font-medium"
                >
                  Notu Kaydet
                </button>
              </div>
            </form>

            <div className="border-t border-slate-800 pt-3 max-h-60 overflow-y-auto space-y-2 text-xs">
              {loadingNotes ? (
                <div className="text-center py-4 text-slate-500">Notlar getiriliyor...</div>
              ) : notesList.length === 0 ? (
                <div className="text-center py-4 text-slate-500">Kayıtlı not bulunmuyor.</div>
              ) : (
                notesList.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-medium text-slate-300">{n.authorName} ({n.authorRole})</span>
                      <span>{new Date(n.createdAt).toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="text-slate-200">{n.note}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
