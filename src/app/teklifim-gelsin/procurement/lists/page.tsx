"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ListOrdered,
  Plus,
  ArrowLeft,
  Send,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimProcurementList, TeklifimProcurementItem } from "@/types/teklifimGelsin";
import BulkRequestItemBuilder from "@/components/teklifimGelsin/BulkRequestItemBuilder";

function ProcurementListsContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<TeklifimProcurementList[]>([]);

  // Create List Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [listName, setListName] = useState("");
  const [listDesc, setListDesc] = useState("");
  const [reminderFreq, setReminderFreq] = useState<"none" | "weekly" | "monthly" | "quarterly">("monthly");
  const [items, setItems] = useState<TeklifimProcurementItem[]>([
    {
      id: "it_1",
      productName: "",
      category: "Ambalaj & Paketleme",
      quantity: 10,
      unit: "Koli",
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [requestingListId, setRequestingListId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        await fetchLists(currUser);
      } else {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const fetchLists = async (currUser: any) => {
    setLoading(true);
    try {
      const token = await currUser.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/procurement/lists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists || []);
      }
    } catch (err) {
      console.error("Failed to load procurement lists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/teklifim-gelsin/procurement/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: listName.trim(),
          description: listDesc.trim(),
          reminderFrequency: reminderFreq,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Liste olusturulamadi.");

      setModalOpen(false);
      setListName("");
      setListDesc("");
      setItems([
        {
          id: `it_${Date.now()}`,
          productName: "",
          category: "Ambalaj & Paketleme",
          quantity: 10,
          unit: "Koli",
        },
      ]);
      await fetchLists(user);
      setActionMessage("Satin alma listesi basariyla kaydedildi.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Liste olusturulamadi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAll = async (listId: string) => {
    if (!user) return;
    setRequestingListId(listId);
    setErrorMessage(null);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/procurement/lists/${listId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryDays: 7 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Toplu talep olusturulamadi.");

      setActionMessage("Listeden toplu talep basariyla yayinlandi! Tedarikciler teklif vermeye baslayabilir.");
      await fetchLists(user);
    } catch (err: any) {
      setErrorMessage(err.message || "Islem gerceklestirilemedi.");
    } finally {
      setRequestingListId(null);
    }
  };

  const handleDeleteList = async (listId: string, name: string) => {
    if (!confirm(`"${name}" listesini silmek istediginize emin misiniz?`)) return;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/teklifim-gelsin/procurement/lists/${listId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchLists(user);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link
            href="/teklifim-gelsin/procurement"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Satin Alma Merkezine Don</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Satin Alma Listeleri
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Duzenli kurumsal sarf listeleri ve tek tikla toplu talep ("Hepsini Talep Et")
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Liste Olustur</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* LISTS GRID */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Listeler yukleniyor...
        </div>
      ) : lists.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
          <ListOrdered className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Kayitli Satin Alma Listesi Yok
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5 max-w-md mx-auto">
            Haftalik veya aylik toptan alisverisleriniz icin (orn: Kafe Aylik Sarf) liste olusturun ve tek tikla tum kalemleri toptancilardan talep edin.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ilk Listeni Olustur</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded uppercase tracking-wider">
                      {list.category || "Genel"}
                    </span>
                    {list.reminderFrequency !== "none" && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{list.reminderFrequency}</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteList(list.id, list.name)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                    title="Listeyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {list.name}
                </h3>
                {list.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {list.description}
                  </p>
                )}

                {/* ITEMS PREVIEW */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Kalemler ({list.itemCount})</span>
                    <span>Tahmini: {list.totalEstimatedCost.toLocaleString("tr-TR")} TL</span>
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {list.items.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/40"
                      >
                        <span className="font-medium truncate max-w-[170px]">{it.productName}</span>
                        <span className="text-[11px] text-slate-500">{it.quantity} {it.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTION: HEPSINI TALEP ET */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={requestingListId === list.id}
                  onClick={() => handleRequestAll(list.id)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{requestingListId === list.id ? "Talep Olusturuluyor..." : "Hepsini Talep Et"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE LIST MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Yeni Satin Alma Listesi
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Liste Adi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Orn: Kafe Aylik Sarf & Temizlik"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Aciklama (Opsiyonel)
                </label>
                <input
                  type="text"
                  placeholder="Orn: Her ay basinda toptan alinacak urunler"
                  value={listDesc}
                  onChange={(e) => setListDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hatirlatici Sikligi
                  </label>
                  <select
                    value={reminderFreq}
                    onChange={(e) => setReminderFreq(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="none">Hatirlatma Yok</option>
                    <option value="weekly">Haftalik</option>
                    <option value="monthly">Aylik (Her ayin 1'i)</option>
                    <option value="quarterly">3 Aylik</option>
                  </select>
                </div>
              </div>

              <BulkRequestItemBuilder
                items={items}
                onChange={setItems}
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Vazgec
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-colors"
                >
                  {submitting ? "Kaydediliyor..." : "Listeyi Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProcurementListsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ProcurementListsContent />
    </Suspense>
  );
}
