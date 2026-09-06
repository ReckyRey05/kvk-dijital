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
  Share2
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
      const res = await fetch("/api/teklink/forms?stats=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Veriler yüklenemedi");
      }

      const data = await res.json();
      setForms(data.forms || []);
      setRecentSubmissions(data.recentSubmissions || []);
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Formlarınız ve TekLinkleriniz</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Müşterilerinize göndermek için ilgili formun linkini kopyalayın.
              </p>
            </div>

            {forms.length > 0 && (
              <Link
                href="/teklink/forms/new"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-4 h-4" />
                <span>Form Ekle</span>
              </Link>
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
    </div>
  );
}
