"use client";

import { useState } from "react";
import { Table, Restaurant } from "@/types/restaurant";
import { useRestaurantStore } from "@/lib/restaurant/store";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Users,
  Layers,
  Search,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  QrCode,
  LayoutGrid,
} from "lucide-react";

interface TableManagerProps {
  restaurant: Restaurant;
  tables: Table[];
  onSelectTableForQr?: (table: Table) => void;
}

export default function TableManager({
  restaurant,
  tables,
  onSelectTableForQr,
}: TableManagerProps) {
  const { addTable, updateTable, deleteTable } = useRestaurantStore();

  // Filter & Search
  const [selectedSection, setSelectedSection] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Table Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newSection, setNewSection] = useState("Genel Salon");
  const [newCapacity, setNewCapacity] = useState<number>(4);
  const [customSectionInput, setCustomSectionInput] = useState("");

  // Quick Batch Add State
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState("Masa ");
  const [batchStart, setBatchStart] = useState(1);
  const [batchCount, setBatchCount] = useState(5);
  const [batchSection, setBatchSection] = useState("Genel Salon");

  // Edit Table State
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editSection, setEditSection] = useState("");
  const [editCapacity, setEditCapacity] = useState<number>(4);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Extract distinct sections from tables
  const distinctSections = Array.from(
    new Set([
      "Genel Salon",
      "Bahçe",
      "Teras",
      "VIP Salon",
      "Bar",
      ...tables.map((t) => t.section || "Genel Salon"),
    ])
  );

  // Filtered Tables
  const filteredTables = tables.filter((t) => {
    const matchesSection =
      selectedSection === "ALL" || (t.section || "Genel Salon") === selectedSection;
    const matchesSearch =
      !searchQuery.trim() ||
      t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.section || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    const finalSection =
      newSection === "__CUSTOM__" ? customSectionInput.trim() || "Genel Salon" : newSection;

    addTable({
      tableNumber: newTableNumber.trim(),
      section: finalSection,
      capacity: Number(newCapacity) || 4,
    });

    setNewTableNumber("");
    setCustomSectionInput("");
    setIsAddModalOpen(false);
  };

  const handleBatchAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.min(50, Math.max(1, Number(batchCount)));
    const start = Number(batchStart) || 1;

    for (let i = 0; i < count; i++) {
      const num = start + i;
      addTable({
        tableNumber: `${batchPrefix}${num}`,
        section: batchSection || "Genel Salon",
        capacity: 4,
      });
    }

    setIsBatchOpen(false);
  };

  const handleStartEdit = (t: Table) => {
    setEditingTableId(t.id);
    setEditNumber(t.tableNumber);
    setEditSection(t.section || "Genel Salon");
    setEditCapacity(t.capacity || 4);
  };

  const handleSaveEdit = (t: Table) => {
    if (!editNumber.trim()) return;
    updateTable(t.id, {
      tableNumber: editNumber.trim(),
      section: editSection.trim() || "Genel Salon",
      capacity: Number(editCapacity) || 4,
    });
    setEditingTableId(null);
  };

  const handleDelete = (tableId: string) => {
    deleteTable(tableId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0c1212] border border-white/10 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white">Masa & Bölüm Yönetimi</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-xs font-black">
              {tables.length} Masa
            </span>
          </div>
          <p className="text-xs text-foreground/60 mt-0.5">
            İstediğiniz bölüme (Bahçe, Teras, Salon vb.) yeni masa ekleyin, düzenleyin veya silin.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsBatchOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-foreground/80 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Toplu Ekle</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-accent/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Masa Ekle</span>
          </button>
        </div>
      </div>

      {/* Filters & Section Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Section Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto sleek-scrollbar pb-1">
          <button
            onClick={() => setSelectedSection("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedSection === "ALL"
                ? "bg-accent text-black font-extrabold shadow-sm"
                : "bg-white/5 text-foreground/70 hover:bg-white/10"
            }`}
          >
            Tüm Bölümler ({tables.length})
          </button>

          {distinctSections.map((sec) => {
            const count = tables.filter((t) => (t.section || "Genel Salon") === sec).length;
            if (count === 0 && selectedSection !== sec) return null;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSection === sec
                    ? "bg-accent text-black font-extrabold shadow-sm"
                    : "bg-white/5 text-foreground/70 hover:bg-white/10"
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Masa ara (örn: Bahçe 1)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-foreground/40 focus:outline-hidden focus:border-accent"
          />
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredTables.map((table) => {
          const isEditing = editingTableId === table.id;
          const isDeleting = deleteConfirmId === table.id;
          const isOccupied = table.status !== "EMPTY";

          return (
            <div
              key={table.id}
              className={`relative p-4 rounded-2xl border transition-all ${
                isOccupied
                  ? "bg-amber-500/[0.03] border-amber-500/30 shadow-xs"
                  : "bg-white/[0.02] border-white/10 hover:border-white/20"
              }`}
            >
              {/* Table Card Body */}
              {!isEditing ? (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-sm text-white">
                        {table.tableNumber.replace(/[^0-9]/g, "") || table.tableNumber.slice(0, 3)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-white">
                          {table.tableNumber}
                        </h4>
                        <span className="text-[11px] text-accent font-semibold block">
                          {table.section || "Genel Salon"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                        table.status === "EMPTY"
                          ? "bg-white/5 text-foreground/50 border-white/10"
                          : table.status === "OCCUPIED"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          : table.status === "BILL_REQUESTED"
                          ? "bg-purple-500/15 text-purple-400 border-purple-500/30 animate-pulse"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      }`}
                    >
                      {table.status === "EMPTY"
                        ? "Boş"
                        : table.status === "OCCUPIED"
                        ? "Dolu"
                        : table.status === "BILL_REQUESTED"
                        ? "Hesap İsteniyor"
                        : "Garson Çağrıldı"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-foreground/60">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Users className="w-3 h-3 text-foreground/40" />
                      {table.capacity || 4} Kişilik
                    </span>

                    {table.activeBillTotal > 0 && (
                      <span className="text-white font-extrabold text-[11px]">
                        ₺{table.activeBillTotal.toLocaleString("tr-TR")}
                      </span>
                    )}
                  </div>

                  {/* Actions Strip */}
                  <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-white/5">
                    {onSelectTableForQr && (
                      <button
                        onClick={() => onSelectTableForQr(table)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        title="QR Kodunu Görüntüle / Yazdır"
                      >
                        <QrCode className="w-3 h-3 text-accent" />
                        <span>QR</span>
                      </button>
                    )}

                    <a
                      href={`/qr/${restaurant.slug}/${table.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/70 hover:text-accent text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Müşteri QR Ekranını Yeni Sekmede Aç"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Canlı Önizleme</span>
                    </a>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(table)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-foreground/70 hover:text-white transition-colors cursor-pointer"
                        title="Masayı Düzenle"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-red-950/80 p-0.5 rounded-lg border border-red-500/50">
                          <button
                            onClick={() => handleDelete(table.id)}
                            className="px-1.5 py-0.5 text-[9px] bg-red-600 text-white font-extrabold rounded-md cursor-pointer"
                          >
                            Evet, Sil
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-1 py-0.5 text-[9px] text-foreground/70 hover:text-white cursor-pointer"
                          >
                            İptal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(table.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-foreground/50 hover:text-red-400 transition-colors cursor-pointer"
                          title="Masayı Sil"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Inline Edit Mode */
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-accent">Masayı Düzenle</div>

                  <div>
                    <label className="text-[10px] text-foreground/50 block">Masa Adı</label>
                    <input
                      type="text"
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-hidden focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-foreground/50 block">Bölüm</label>
                      <input
                        type="text"
                        value={editSection}
                        onChange={(e) => setEditSection(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-hidden focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-foreground/50 block">Kapasite</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={editCapacity}
                        onChange={(e) => setEditCapacity(Number(e.target.value))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-hidden focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleSaveEdit(table)}
                      className="flex-1 py-1.5 rounded-lg bg-accent text-black font-extrabold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Kaydet</span>
                    </button>
                    <button
                      onClick={() => setEditingTableId(null)}
                      className="py-1.5 px-2.5 rounded-lg bg-white/10 text-white font-bold text-[11px] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12 bg-white/[0.01] border border-white/5 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-foreground/40">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-white">Bu Filtrede Masa Bulunamadı</h4>
          <p className="text-xs text-foreground/50">
            Farklı bir bölüm seçebilir veya yukarıdaki butondan yeni bir masa ekleyebilirsiniz.
          </p>
        </div>
      )}

      {/* MODAL 1: TEK MASA EKLE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-white">Yeni Masa Ekle</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTableSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Masa Numarası / Adı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Örn: Masa 12, Bahçe 4, VIP 2..."
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-foreground/40 focus:outline-hidden focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">
                    Bölüm Seçimi
                  </label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-accent cursor-pointer"
                  >
                    {distinctSections.map((sec) => (
                      <option key={sec} value={sec} className="bg-neutral-900 text-white">
                        {sec}
                      </option>
                    ))}
                    <option value="__CUSTOM__" className="bg-neutral-900 text-amber-300 font-bold">
                      + Yeni Özel Bölüm...
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">
                    Kapasite (Kişi)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>

              {newSection === "__CUSTOM__" && (
                <div className="animate-fade-in">
                  <label className="text-xs font-bold text-amber-300 block mb-1">
                    Yeni Bölüm İsmi
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Havuz Başı, Teras Üst Kat..."
                    value={customSectionInput}
                    onChange={(e) => setCustomSectionInput(e.target.value)}
                    className="w-full bg-white/5 border border-amber-400/40 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-foreground/40 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-black font-extrabold text-xs shadow-md shadow-accent/20 cursor-pointer"
                >
                  Masayı Kaydet & Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TOPLU MASA EKLE */}
      {isBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-white">Toplu Masa Oluşturucu</h3>
              </div>
              <button
                onClick={() => setIsBatchOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-foreground/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-foreground/60">
              Hızlıca ardışık birden fazla masa eklemek için ön ek ve adet belirleyin.
            </p>

            <form onSubmit={handleBatchAddSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Masa Ön Eki
                </label>
                <input
                  type="text"
                  placeholder="Örn: Masa , Bahçe , Teras-..."
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">
                    Başlangıç No
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={batchStart}
                    onChange={(e) => setBatchStart(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground/80 block mb-1">
                    Kaç Masa Eklensin?
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Hangi Bölüme Eklensin?
                </label>
                <select
                  value={batchSection}
                  onChange={(e) => setBatchSection(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-accent cursor-pointer"
                >
                  {distinctSections.map((sec) => (
                    <option key={sec} value={sec} className="bg-neutral-900 text-white">
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-[11px] text-foreground/70">
                Oluşturulacak Masalar:{" "}
                <strong className="text-white">
                  {batchPrefix}
                  {batchStart}
                </strong>{" "}
                ile{" "}
                <strong className="text-white">
                  {batchPrefix}
                  {batchStart + Math.max(1, batchCount) - 1}
                </strong>{" "}
                arası ({batchCount} adet)
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 cursor-pointer"
                >
                  Toplu Masaları Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
