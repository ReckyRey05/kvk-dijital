"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  ExternalLink,
  Inbox,
  X,
  Eye,
  FileCheck,
  Trash2
} from "lucide-react";
import { TekLinkForm, TekLinkSubmission } from "@/types/teklink";

export default function FormResponsesPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params?.formId as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<TekLinkForm | null>(null);
  const [submissions, setSubmissions] = useState<TekLinkSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<TekLinkSubmission | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<TekLinkSubmission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://kvkdijitalcozumler.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/teklink");
      } else {
        setUser(currentUser);
        await loadData(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router, formId]);

  const loadData = async (currentUser: any) => {
    try {
      setLoading(true);
      setError("");
      let currentForm: TekLinkForm | null = null;
      let currentSubmissions: TekLinkSubmission[] = [];

      // Tier 1: Try Server API
      try {
        const token = await currentUser.getIdToken();
        const formRes = await fetch(`/api/teklink/forms/${formId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (formRes.ok) {
          const formData = await formRes.json();
          currentForm = formData.form;
        }

        const subRes = await fetch(`/api/teklink/forms/${formId}/responses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          currentSubmissions = subData.submissions || [];
        }
      } catch (apiErr) {
        console.warn("Server API notice in responses page:", apiErr);
      }

      // Tier 2: Client Firestore fallback (reads directly from kvk-dijital Firestore)
      if (!currentForm || currentSubmissions.length === 0) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { doc, getDoc, collection, query, where, getDocs } = await import("firebase/firestore");

          // 1. Find the form
          if (!currentForm) {
            const formDocSnap = await getDoc(doc(db, "teklink_forms", formId));
            if (formDocSnap.exists()) {
              currentForm = { id: formDocSnap.id, ...(formDocSnap.data() as any) };
            } else {
              // Try searching by slug
              const qSlug = query(collection(db, "teklink_forms"), where("slug", "==", formId));
              const sSnap = await getDocs(qSlug);
              if (!sSnap.empty) {
                currentForm = { id: sSnap.docs[0].id, ...(sSnap.docs[0].data() as any) };
              }
            }

            // Also check localStorage
            if (!currentForm) {
              const localForms = JSON.parse(localStorage.getItem(`teklink_forms_${currentUser.uid}`) || "[]");
              currentForm = localForms.find((f: any) => f.id === formId || f.slug === formId) || null;
            }
          }

          // 2. Find submissions for this form
          const targetFormId = currentForm?.id || formId;
          const targetSlug = currentForm?.slug || "";

          let subsSnap = await getDocs(
            query(collection(db, "teklink_submissions"), where("formId", "==", targetFormId))
          );

          const cSubs: TekLinkSubmission[] = [];
          subsSnap.forEach((d) => cSubs.push({ id: d.id, ...(d.data() as any) }));

          // If not found by formId, try by slug
          if (cSubs.length === 0 && targetSlug) {
            const slugSnap = await getDocs(
              query(collection(db, "teklink_submissions"), where("formId", "==", targetSlug))
            );
            slugSnap.forEach((d) => cSubs.push({ id: d.id, ...(d.data() as any) }));
          }

          // If still not found and tenant has submissions, find matching formTitle
          if (cSubs.length === 0 && currentUser.uid) {
            const tenantSnap = await getDocs(
              query(collection(db, "teklink_submissions"), where("tenantId", "==", currentUser.uid))
            );
            tenantSnap.forEach((d) => {
              const data = d.data() as any;
              if (data.formId === targetFormId || data.formId === targetSlug || (currentForm && data.formTitle === currentForm.title)) {
                cSubs.push({ id: d.id, ...data });
              }
            });
          }

          if (cSubs.length > 0) {
            currentSubmissions = cSubs.sort((a, b) => b.createdAt - a.createdAt);
          }
        } catch (clientDbErr) {
          console.warn("Client Firestore read notice in responses page:", clientDbErr);
        }
      }

      if (!currentForm) {
        throw new Error("Form bulunamadı");
      }

      setForm(currentForm);
      setSubmissions(currentSubmissions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Veriler alınırken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!form) return;
    navigator.clipboard.writeText(`${siteUrl}/f/${form.slug}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const confirmDeleteForm = async () => {
    if (!form || !user) return;
    setDeleting(true);

    try {
      const token = await user.getIdToken();

      // 1. Try Server API delete
      try {
        await fetch(`/api/teklink/forms/${form.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (apiErr) {
        console.warn("Server API delete notice in responses:", apiErr);
      }

      // 2. Client Firestore delete
      try {
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, deleteDoc, collection, query, where, getDocs } = await import("firebase/firestore");

        await deleteDoc(doc(db, "teklink_forms", form.id));

        // Delete associated submissions
        const subQ = query(collection(db, "teklink_submissions"), where("formId", "==", form.id));
        const subSnap = await getDocs(subQ);
        subSnap.forEach((d) => deleteDoc(d.ref));
      } catch (dbErr) {
        console.warn("Client Firestore delete notice in responses:", dbErr);
      }

      // 3. LocalStorage clean
      try {
        const localKey = `teklink_forms_${user.uid}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
        localStorage.setItem(localKey, JSON.stringify(existing.filter((f: any) => f.id !== form.id)));
      } catch {}

      router.push("/teklink/dashboard");
    } catch (err: any) {
      console.error("Delete error:", err);
      setError("Form silinirken bir hata oluştu.");
      setDeleting(false);
    }
  };

  const confirmDeleteSubmission = async () => {
    if (!submissionToDelete || !user) return;
    setDeleting(true);

    try {
      const token = await user.getIdToken();

      // 1. Server API delete
      try {
        await fetch(`/api/teklink/forms/${form?.id || formId}/responses?subId=${submissionToDelete.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (apiErr) {
        console.warn("Server API delete submission notice:", apiErr);
      }

      // 2. Client Firestore delete
      try {
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, deleteDoc, updateDoc } = await import("firebase/firestore");

        await deleteDoc(doc(db, "teklink_submissions", submissionToDelete.id));

        if (form) {
          const formRef = doc(db, "teklink_forms", form.id);
          await updateDoc(formRef, {
            responseCount: Math.max(0, (form.responseCount || 1) - 1),
          }).catch(() => {});
        }
      } catch (dbErr) {
        console.warn("Client Firestore delete submission notice:", dbErr);
      }

      // Update state
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionToDelete.id));
      if (form) {
        setForm({ ...form, responseCount: Math.max(0, (form.responseCount || 1) - 1) });
      }
      if (selectedSubmission?.id === submissionToDelete.id) {
        setSelectedSubmission(null);
      }
      setSubmissionToDelete(null);
    } catch (err: any) {
      console.error("Delete submission error:", err);
      setError("Cevap silinirken bir hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white font-sans selection:bg-blue-600 pb-20">
      {/* Top Navigation */}
      <header className="border-b border-white/10 px-6 py-4 bg-[#090D16]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/teklink/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Panele Dön</span>
          </Link>

          {form && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyLink}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCopied ? "bg-emerald-600 text-white" : "bg-blue-600 text-white hover:bg-blue-500"
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? "Kopyalandı" : "Linki Kopyala"}</span>
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Formu Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Formu Sil</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Title Header */}
        <div>
          <span className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wider">
            Gelen Müşteri Cevapları
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {form?.title || "Form Cevapları"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Toplam {submissions.length} müşteri bu formu doldurdu.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">Henüz gelen cevap yok</h3>
              <p className="text-xs text-slate-400">
                Form linkini müşterinize ilettiğinizde, doldurulan tüm bilgiler ve yüklenen evraklar burada anında listelenecektir.
              </p>
            </div>
            {form && (
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>TekLinki Kopyala ve Paylaş</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub, idx) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-[#111827] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-blue-400">#{submissions.length - idx}</span>
                    <h3 className="text-sm font-bold text-white">{sub.senderSummary}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {new Date(sub.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>

                    {sub.files && sub.files.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                        {sub.files.length} Adet Dosya Eki
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Cevapları İncele</span>
                  </button>

                  <button
                    onClick={() => setSubmissionToDelete(sub)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-colors cursor-pointer"
                    title="Bu Yanıtı Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Submission Detail Modal */}
      {selectedSubmission && form && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#111827] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-mono text-blue-400 font-bold uppercase">Müşteri Başvurusu</span>
                <h3 className="text-lg font-bold text-white">{selectedSubmission.senderSummary}</h3>
                <span className="text-[11px] text-slate-400">
                  {new Date(selectedSubmission.createdAt).toLocaleString("tr-TR")}
                </span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions & Answers List */}
            <div className="space-y-4">
              {form.fields.map((field) => {
                const answer = selectedSubmission.answers[field.id];
                return (
                  <div key={field.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      {field.label}
                    </span>
                    <div className="text-sm font-semibold text-white">
                      {answer === undefined || answer === null || answer === "" ? (
                        <span className="text-slate-500 italic">Boş bırakıldı</span>
                      ) : typeof answer === "boolean" ? (
                        answer ? "Evet / Onaylandı" : "Hayır"
                      ) : Array.isArray(answer) ? (
                        answer.join(", ")
                      ) : (
                        String(answer)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Uploaded Files Section */}
            {selectedSubmission.files && selectedSubmission.files.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Yüklenen Belgeler ve Dosyalar ({selectedSubmission.files.length})
                </h4>
                <div className="space-y-2">
                  {selectedSubmission.files.map((file, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-sm">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="font-semibold text-white truncate">{file.fileName || `Belge_${i + 1}`}</span>
                      </div>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        <span>İndir / Aç</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSubmissionToDelete(selectedSubmission)}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Bu Yanıtı Sil</span>
              </button>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Specific Form Confirmation Modal */}
      {showDeleteModal && form && (
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
                <strong className="text-white">"{form.title}"</strong> formu ve bu forma ait tüm müşteri cevapları kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
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

      {/* Delete Specific Submission Confirmation Modal */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#111827] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider block">
                Müşteri Yanıtı Silme
              </span>
              <h3 className="text-lg font-bold text-white">Bu Yanıtı Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-white">"{submissionToDelete.senderSummary}"</strong> tarafından gönderilen bu müşteri yanıtını silmek üzeresiniz. Bu işlem geri alınamaz.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmissionToDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={confirmDeleteSubmission}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Evet, Yanıtı Sil</span>
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
