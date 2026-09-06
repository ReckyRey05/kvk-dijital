"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Clock,
  LogOut,
  ChevronRight,
  Inbox,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Share2,
  Trash2
} from "lucide-react";
import { TekLinkForm, TekLinkSubmission } from "@/types/teklink";

export default function TekLinkDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<TekLinkForm[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<TekLinkSubmission[]>([]);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formToDelete, setFormToDelete] = useState<TekLinkForm | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://kvkdijitalcozumler.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklink");
      } else {
        setUser(currentUser);
        await loadDashboardData(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadDashboardData = async (currentUser: any) => {
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      let loaded = false;

      // Tier 1: Try Server API
      try {
        const res = await fetch("/api/teklink/forms?stats=true", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }

        if (res.ok && data) {
          setForms(data.forms || []);
          setRecentSubmissions(data.recentSubmissions || []);
          loaded = true;
        }
      } catch (apiErr) {
        console.warn("Server dashboard load notice:", apiErr);
      }

      // Tier 2: Client Firestore / Local Storage Fallback
      if (!loaded) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { collection, query, where, getDocs } = await import("firebase/firestore");
          const q = query(collection(db, "teklink_forms"), where("tenantId", "==", currentUser.uid));
          const snap = await getDocs(q);
          const cForms: TekLinkForm[] = [];
          snap.forEach((d) => cForms.push({ id: d.id, ...(d.data() as any) }));
          if (cForms.length > 0) {
            setForms(cForms.sort((a, b) => b.createdAt - a.createdAt));
            loaded = true;
          }
        } catch (dbErr) {
          console.warn("Client Firestore read notice:", dbErr);
        }

        if (!loaded) {
          try {
            const localKey = `teklink_forms_${currentUser.uid}`;
            const localForms = JSON.parse(localStorage.getItem(localKey) || "[]");
            setForms(localForms);
          } catch {}
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Panel verileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (slug: string) => {
    const link = `${siteUrl}/f/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    setTimeout(() => {
      setCopiedSlug(null);
    }, 2000);
  };

  const handleToggleActive = async (form: TekLinkForm) => {
    try {
      const token = await user.getIdToken();
      const newStatus = !form.isActive;
      await fetch(`/api/teklink/forms/${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus }),
      });

      setForms((prev) =>
        prev.map((f) => (f.id === form.id ? { ...f, isActive: newStatus } : f))
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/teklink");
  };

  const confirmDeleteForm = async () => {
    if (!formToDelete || !user) return;
    setDeleting(true);

    try {
      const token = await user.getIdToken();

      // 1. Try Server API delete
      try {
        await fetch(`/api/teklink/forms/${formToDelete.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (apiErr) {
        console.warn("Server API delete notice:", apiErr);
      }

      // 2. Client Firestore delete
      try {
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, deleteDoc, collection, query, where, getDocs } = await import("firebase/firestore");

        await deleteDoc(doc(db, "teklink_forms", formToDelete.id));

        // Delete associated submissions
        const subQ = query(collection(db, "teklink_submissions"), where("formId", "==", formToDelete.id));
        const subSnap = await getDocs(subQ);
        subSnap.forEach((d) => deleteDoc(d.ref));
      } catch (dbErr) {
        console.warn("Client Firestore delete notice:", dbErr);
      }

      // 3. LocalStorage clean
      try {
        const localKey = `teklink_forms_${user.uid}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
        localStorage.setItem(localKey, JSON.stringify(existing.filter((f: any) => f.id !== formToDelete.id)));
      } catch {}

      // Update state
      setForms((prev) => prev.filter((f) => f.id !== formToDelete.id));
      setFormToDelete(null);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError("Form silinirken bir hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeleteAllForms = async () => {
    if (!user) return;
    setDeleting(true);

    try {
      const token = await user.getIdToken();

      // 1. Try Server API delete all
      try {
        await fetch("/api/teklink/forms", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (apiErr) {
        console.warn("Server API delete all forms notice:", apiErr);
      }

      // 2. Client Firestore delete all for this tenant
      try {
        const { db } = await import("@/lib/firebase/firestore");
        const { collection, query, where, getDocs, deleteDoc } = await import("firebase/firestore");

        // Delete all forms
        const formsQ = query(collection(db, "teklink_forms"), where("tenantId", "==", user.uid));
        const formsSnap = await getDocs(formsQ);
        formsSnap.forEach((d) => deleteDoc(d.ref));

        // Delete all submissions
        const subsQ = query(collection(db, "teklink_submissions"), where("tenantId", "==", user.uid));
        const subsSnap = await getDocs(subsQ);
        subsSnap.forEach((d) => deleteDoc(d.ref));
      } catch (dbErr) {
        console.warn("Client Firestore delete all notice:", dbErr);
      }

      // 3. Clean localStorage
      try {
        localStorage.removeItem(`teklink_forms_${user.uid}`);
      } catch {}

      // Update state
      setForms([]);
      setRecentSubmissions([]);
      setShowDeleteAllModal(false);
    } catch (err: any) {
      console.error("Delete all error:", err);
      setError("Bütün formlar silinirken bir hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  const totalResponses = forms.reduce((acc, f) => acc + (f.responseCount || 0), 0);
  const activeLinksCount = forms.filter((f) => f.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white font-sans selection:bg-blue-600">
      {/* Top Bar */}
      <header className="border-b border-white/10 px-6 py-4 bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">TekLink</span>
              <span className="text-[11px] text-slate-400 font-mono">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teklink/forms/new"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Form</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Simple Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Toplam Formlar</div>
            <div className="text-3xl font-black text-white mt-1">{forms.length}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Aktif Linkler</div>
            <div className="text-3xl font-black text-emerald-400 mt-1">{activeLinksCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Gelen Cevaplar</div>
            <div className="text-3xl font-black text-blue-400 mt-1">{totalResponses}</div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Forms Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Formlarınız ve TekLinkleriniz</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Müşterilerinize göndermek için ilgili formun linkini kopyalayın veya formu yönetin.
              </p>
            </div>

            {forms.length > 0 && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Tüm formları ve gelen cevapları topluca sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bütün Formları Sil</span>
                </button>

                <Link
                  href="/teklink/forms/new"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Form Ekle</span>
                </Link>
              </div>
            )}
          </div>

          {forms.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">Henüz bir form oluşturmadınız</h3>
                <p className="text-xs text-slate-400">
                  Müşterilerinizden bilgi veya evrak toplamak için ilk formunuzu oluşturup tek linkinizi üretin.
                </p>
              </div>
              <Link
                href="/teklink/forms/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>İlk Formunuzu Oluşturun</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {forms.map((form) => {
                const publicUrl = `${siteUrl}/f/${form.slug}`;
                const isCopied = copiedSlug === form.slug;

                return (
                  <div
                    key={form.id}
                    className="p-5 sm:p-6 rounded-2xl bg-[#111827] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Left Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold text-white">{form.title}</h3>
                        <button
                          onClick={() => handleToggleActive(form)}
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                            form.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/30"
                          }`}
                          title="Form durumunu değiştir"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${form.isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
                          <span>{form.isActive ? "Aktif Link" : "Kapalı"}</span>
                        </button>
                      </div>

                      {form.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{form.description}</p>
                      )}

                      {/* Public Link Bar */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 select-all">
                          /f/{form.slug}
                        </span>
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Müşteri Gözünden Gör</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                      {/* Copy Link CTA */}
                      <button
                        onClick={() => copyLink(form.slug)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          isCopied
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopied ? "Link Kopyalandı!" : "Linki Kopyala"}</span>
                      </button>

                      {/* View Responses CTA */}
                      <Link
                        href={`/teklink/forms/${form.id}/responses`}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition-colors"
                      >
                        <Inbox className="w-4 h-4 text-blue-400" />
                        <span>Cevaplar ({form.responseCount || 0})</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>

                      {/* Delete Specific Form Button */}
                      <button
                        onClick={() => setFormToDelete(form)}
                        className="px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                        title="Bu Formu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Formu Sil</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Mini-Feed */}
        {recentSubmissions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-white">Son Gelen Müşteri Cevapları</h3>
            <div className="space-y-2">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <div>
                      <strong className="text-white block">{sub.senderSummary}</strong>
                      <span className="text-[11px] text-slate-400 font-medium">{sub.formTitle}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(sub.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Link
                      href={`/teklink/forms/${sub.formId}/responses`}
                      className="block text-[11px] text-blue-400 hover:underline font-bold mt-0.5"
                    >
                      İncele →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Specific Form Confirmation Modal */}
      {formToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#111827] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                Spesifik Form Silme
              </span>
              <h3 className="text-lg font-bold text-white">Bu Formu Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-white">"{formToDelete.title}"</strong> formunu ve bu forma ait tüm müşteri cevaplarını silmek üzeresiniz. Sadece bu spesifik form silinecektir. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFormToDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={confirmDeleteForm}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Formu Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete ALL Forms Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#111827] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-rose-500/30">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                Toplu Form Temizleme
              </span>
              <h3 className="text-lg font-bold text-white">Bütün Formları Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hesabınızdaki <strong className="text-white">toplam {forms.length} adet formun tamamı</strong> ve bu formlara ait tüm müşteri yanıtları kalıcı olarak silinecektir. Bu işlem geri alınamaz!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={confirmDeleteAllForms}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Bütün Formları Sil</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
