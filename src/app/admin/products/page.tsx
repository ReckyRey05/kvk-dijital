"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/auth";
import {
  PackageCheck,
  Search,
  Filter,
  RefreshCw,
  Ban,
  CheckCircle,
  Archive,
  Tag,
} from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  async function loadProducts() {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/teklifim-gelsin/admin/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setProducts(json.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [statusFilter, categoryFilter]);

  async function handleModerate(productId: string, newStatus: "active" | "suspended" | "archived") {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      const res = await fetch("/api/teklifim-gelsin/admin/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "İşlem başarısız.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.title || p.name)?.toLowerCase().includes(q) ||
      p.supplierName?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <PackageCheck size={24} className="text-purple-400" />
            Ürün Moderasyon Masası
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tedarikçilerin eklediği ürün kataloglarını inceleyin, onaylayın veya durdurun.
          </p>
        </div>
        <button
          onClick={loadProducts}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Yenile
        </button>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full md:w-80 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
          <Search size={16} className="text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı, tedarikçi, barkod..."
            className="bg-transparent text-white text-xs placeholder:text-slate-500 focus:outline-none flex-1"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter size={14} />
            <span>Durum:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif (Yayında)</option>
              <option value="suspended">Askıya Alınmış</option>
              <option value="archived">Arşivlenmiş</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Tedarikçi</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Fiyat & Birim</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">Moderasyon Aksiyonu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    {loading ? "Ürünler getiriliyor..." : "Ürün kaydı bulunamadı."}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isActive = p.status === "active" || p.status === "published";
                  const isSuspended = p.status === "suspended";
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{p.title || p.name}</div>
                        {p.brand && <div className="text-[11px] text-slate-400">Marka: {p.brand}</div>}
                        <div className="text-[10px] font-mono text-slate-500">{p.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-200">{p.supplierName || "Tedarikçi"}</div>
                        <div className="text-[10px] text-slate-500">{p.supplierId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Tag size={12} className="text-slate-500" />
                          {p.category || "Genel"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-emerald-400">
                          {Number(p.price || 0).toLocaleString("tr-TR")} TL
                        </div>
                        <div className="text-[11px] text-slate-400">Birim: {p.unit || "Adet"}</div>
                      </td>
                      <td className="px-4 py-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle size={12} />
                            Yayında
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-500/10 text-red-400 border border-red-500/20">
                            <Ban size={12} />
                            Durduruldu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-400">
                            <Archive size={12} />
                            Arşiv
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSuspended ? (
                            <button
                              onClick={() => handleModerate(p.id, "active")}
                              className="px-2.5 py-1 rounded text-[11px] bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors"
                            >
                              Yayına Al
                            </button>
                          ) : (
                            <button
                              onClick={() => handleModerate(p.id, "suspended")}
                              className="px-2.5 py-1 rounded text-[11px] bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 transition-colors"
                            >
                              Durdur
                            </button>
                          )}
                          <button
                            onClick={() => handleModerate(p.id, "archived")}
                            title="Arşive Taşı"
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                          >
                            <Archive size={14} />
                          </button>
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
    </div>
  );
}
