"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Upload,
  AlertCircle,
  FileText,
  Lock,
  X,
  Send
} from "lucide-react";
import { TekLinkPublicForm, TekLinkField } from "@/types/teklink";

export default function PublicTekLinkFormPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<TekLinkPublicForm | null>(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [fileAttachments, setFileAttachments] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const loadForm = async () => {
      try {
        setLoading(true);
        let loadedForm: any = null;

        // Tier 1: Try Server API
        try {
          const res = await fetch(`/api/teklink/public/${slug}`);
          const text = await res.text();
          const data = text ? JSON.parse(text) : null;
          if (res.ok && data?.form) {
            loadedForm = data.form;
          }
        } catch (apiErr) {
          console.warn("Public form server API notice:", apiErr);
        }

        // Tier 2: Client Firestore fallback
        if (!loadedForm) {
          try {
            const { db } = await import("@/lib/firebase/firestore");
            const { collection, query, where, getDocs } = await import("firebase/firestore");
            const q = query(collection(db, "teklink_forms"), where("slug", "==", slug.toLowerCase().trim()));
            const snap = await getDocs(q);
            if (!snap.empty) {
              const d = snap.docs[0].data();
              if (d.isActive) {
                loadedForm = {
                  slug: d.slug,
                  title: d.title,
                  description: d.description || "",
                  businessName: d.businessName || "İşletme",
                  logoUrl: d.logoUrl || "",
                  fields: d.fields || [],
                };
              }
            }
          } catch (dbErr) {
            console.warn("Client Firestore public form lookup notice:", dbErr);
          }
        }

        if (!loadedForm) {
          throw new Error("Form bulunamadı veya bağlantı süresi dolmuş.");
        }

        setForm(loadedForm);

        // Initialize default answers
        const initialAnswers: Record<string, any> = {};
        loadedForm.fields.forEach((field: TekLinkField) => {
          if (field.type === "checkbox") {
            initialAnswers[field.id] = false;
          } else {
            initialAnswers[field.id] = "";
          }
        });
        setAnswers(initialAnswers);
      } catch (err: any) {
        setError(err.message || "Form yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [slug]);

  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleFileUpload = (fieldId: string, fieldLabel: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError("Dosya boyutu 5 MB'dan küçük olmalıdır.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      setFileAttachments((prev) => [
        ...prev.filter((f) => f.fieldId !== fieldId),
        {
          fieldId,
          fieldName: fieldLabel,
          fileName: file.name,
          fileUrl: base64Url,
          fileSize: file.size,
        },
      ]);
      handleInputChange(fieldId, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!form) return;

    // Check required fields
    for (const field of form.fields) {
      if (field.required) {
        const val = answers[field.id];
        if (val === undefined || val === null || val === "" || val === false) {
          setSubmitError(`Lütfen "${field.label}" alanını doldurunuz.`);
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      let sent = false;

      // Tier 1: Try Server API
      try {
        const res = await fetch(`/api/teklink/submit/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            files: fileAttachments,
          }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (res.ok && data?.success) {
          sent = true;
        }
      } catch (apiErr) {
        console.warn("Public form submit API notice:", apiErr);
      }

      // Tier 2: Client Firestore direct submission fallback
      if (!sent) {
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { collection, addDoc, query, where, getDocs, doc, updateDoc, increment } = await import("firebase/firestore");

          let senderSummary = "Müşteri Yanıtı";
          const emailField = form.fields.find((f) => f.type === "email");
          const phoneField = form.fields.find((f) => f.type === "phone");
          const nameField = form.fields.find((f) => f.label.toLowerCase().includes("ad") || f.label.toLowerCase().includes("isim"));

          if (nameField && answers[nameField.id]) {
            senderSummary = String(answers[nameField.id]);
            if (phoneField && answers[phoneField.id]) {
              senderSummary += ` (${answers[phoneField.id]})`;
            }
          } else if (phoneField && answers[phoneField.id]) {
            senderSummary = String(answers[phoneField.id]);
          } else if (emailField && answers[emailField.id]) {
            senderSummary = String(answers[emailField.id]);
          }

          // Lookup formDoc to get formId and tenantId
          let formId = "";
          let tenantId = "";
          const formQ = query(collection(db, "teklink_forms"), where("slug", "==", slug.toLowerCase().trim()));
          const formSnap = await getDocs(formQ);
          if (!formSnap.empty) {
            formId = formSnap.docs[0].id;
            tenantId = formSnap.docs[0].data().tenantId || "";
            // Increment count
            updateDoc(doc(db, "teklink_forms", formId), { responseCount: increment(1) }).catch(() => {});
          }

          await addDoc(collection(db, "teklink_submissions"), {
            formId,
            tenantId,
            formTitle: form.title,
            answers,
            files: fileAttachments || [],
            senderSummary,
            createdAt: Date.now(),
          });

          sent = true;
        } catch (dbErr) {
          console.warn("Client Firestore direct submit notice:", dbErr);
        }
      }

      if (!sent) {
        throw new Error("Form iletilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Form iletilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-800">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-800">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Form Bulunamadı</h2>
          <p className="text-xs text-slate-500">
            {error || "Bu bağlantı geçersiz veya işletme tarafından yanıtlara kapatılmış."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white py-8 sm:py-16 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
          {submitted ? (
            /* Thank you screen */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900">Bilgileriniz Başarıyla İletildi!</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {form.businessName} yetkililerine yanıtınız ulaştırıldı. Teşekkür ederiz.
                </p>
              </div>
              <div className="pt-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Güvenli İletim Tamamlandı</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Business Header */}
              <div className="border-b border-slate-100 pb-5 space-y-2 text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  {form.businessName}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {form.title}
                </h1>
                {form.description && (
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {form.description}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {submitError}
                </div>
              )}

              {/* Form Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
                {form.fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="block font-bold text-slate-800">
                      {field.label}
                      {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>

                    {/* TEXT INPUT */}
                    {field.type === "text" && (
                      <input
                        type="text"
                        required={field.required}
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "Cevabınız"}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    )}

                    {/* TEXTAREA */}
                    {field.type === "textarea" && (
                      <textarea
                        rows={3}
                        required={field.required}
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "Detayları yazınız..."}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors resize-none"
                      />
                    )}

                    {/* PHONE */}
                    {field.type === "phone" && (
                      <input
                        type="tel"
                        required={field.required}
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "05XX XXX XX XX"}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    )}

                    {/* EMAIL */}
                    {field.type === "email" && (
                      <input
                        type="email"
                        required={field.required}
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        placeholder={field.placeholder || "ornek@eposta.com"}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    )}

                    {/* DATE */}
                    {field.type === "date" && (
                      <input
                        type="date"
                        required={field.required}
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                      />
                    )}

                    {/* SELECT */}
                    {field.type === "select" && (
                      <select
                        required={field.required}
                        value={answers[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                      >
                        <option value="">Lütfen Seçiniz</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* CHECKBOX */}
                    {field.type === "checkbox" && (
                      <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required={field.required}
                          checked={Boolean(answers[field.id])}
                          onChange={(e) => handleInputChange(field.id, e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                        />
                        <span className="text-xs font-semibold text-slate-700">
                          {field.placeholder || "Yukarıdaki bilgilerin doğruluğunu onaylıyorum."}
                        </span>
                      </label>
                    )}

                    {/* FILE / DOCUMENT UPLOAD */}
                    {field.type === "file" && (
                      <div className="space-y-2">
                        <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 transition-colors cursor-pointer text-center">
                          <Upload className="w-7 h-7 text-blue-600 mb-2" />
                          <span className="text-xs font-bold text-slate-700">
                            {answers[field.id] ? "Başka dosya seç veya değiştir" : "Dosya / Belge Seçin"}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG (Maks 5 MB)</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(field.id, field.label, e)}
                          />
                        </label>
                        {answers[field.id] && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{answers[field.id]}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Formu Gönder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="text-center text-[11px] text-slate-400">
          Powered by <strong className="text-slate-600">TekLink</strong> — Ultra Basit Bilgi Toplama
        </div>
      </div>
    </div>
  );
}
