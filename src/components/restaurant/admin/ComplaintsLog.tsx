"use client";

import { useState } from "react";
import { ManagerAlert } from "@/types/restaurant";
import { useRestaurantStore } from "@/lib/restaurant/store";
import { censorProfanity } from "@/lib/restaurant/profanityFilter";
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Clock,
  User,
  Phone,
  Eye,
  EyeOff,
  Search,
  MessageSquareWarning,
  Lock,
} from "lucide-react";

interface ComplaintsLogProps {
  alerts: ManagerAlert[];
}

export default function ComplaintsLog({ alerts }: ComplaintsLogProps) {
  const { resolveManagerAlert, deleteManagerAlert } = useRestaurantStore();

  const [filter, setFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAlerts = alerts
    .filter((a) => {
      if (filter === "PENDING") return !a.isResolved;
      if (filter === "RESOLVED") return a.isResolved;
      return true;
    })
    .filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.tableNumber.toLowerCase().includes(q) ||
        a.message.toLowerCase().includes(q) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.customerName && a.customerName.toLowerCase().includes(q))
      );
    });

  const pendingCount = alerts.filter((a) => !a.isResolved).length;
  const resolvedCount = alerts.filter((a) => a.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Top Security & Integrity Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
          <Lock className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-extrabold text-white flex items-center gap-2">
            <span>Korumalı Patron Denetim Günlüğü (Boss Audit Log)</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500/20 text-amber-300 font-black uppercase">
              Personel Müdahalesine Kapalı
            </span>
          </h4>
          <p className="text-foreground/70 leading-relaxed">
            Müşterilerin ilettiği şikayet ve düşük puanlar garsonlar veya kasa personeli tarafından ekrandan silinemez.
            Kasa görevlileri yalnızca masaya gidip müdahale edildiğini işaretleyebilir; kayıtlar kalıcı olarak burada birikir ve yalnızca işletme sahibi (Patron) silebilir.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0f0f] border border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Toplam Şikayet</span>
            <span className="text-lg sm:text-xl font-black text-white">{alerts.length} Kayıt</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white/5 text-white flex items-center justify-center shrink-0">
            <MessageSquareWarning className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0f0f] border border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Açık / Bekleyen</span>
            <span className={`text-lg sm:text-xl font-black truncate ${pendingCount > 0 ? "text-red-400 animate-pulse" : "text-white"}`}>
              {pendingCount} Adet
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0f0f] border border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-foreground/50 block font-medium truncate">Müdahale Edilen</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 truncate">{resolvedCount} Adet</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto overflow-x-auto sleek-scrollbar">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filter === "ALL" ? "bg-accent text-black shadow-md" : "text-foreground/70 hover:text-white"
            }`}
          >
            Tümü ({alerts.length})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filter === "PENDING" ? "bg-red-500 text-white shadow-md" : "text-foreground/70 hover:text-white"
            }`}
          >
            Açık ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("RESOLVED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              filter === "RESOLVED" ? "bg-emerald-500 text-black shadow-md" : "text-foreground/70 hover:text-white"
            }`}
          >
            Çözülen ({resolvedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Masa, konu veya isim ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-foreground/40 outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0a0f0f] border border-white/10 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-white">Kayıt Bulunamadı</h4>
            <p className="text-xs text-foreground/50">Müşterilerden gelen tüm şikayetler burada listelenir.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isRevealed = !!revealedIds[alert.id];
            const displayMessage = isRevealed ? alert.message : censorProfanity(alert.message);

            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl bg-[#0a0f0f] border transition-all ${
                  !alert.isResolved
                    ? "border-red-500/40 shadow-xl shadow-red-950/20"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Header line */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl bg-accent/20 text-accent font-extrabold text-xs">
                        {alert.tableNumber}
                      </span>

                      {alert.category && (
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[11px]">
                          {alert.category}
                        </span>
                      )}

                      {alert.rating && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
                          ★ {alert.rating}/5 Puan
                        </span>
                      )}

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          alert.isResolved
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse"
                        }`}
                      >
                        {alert.isResolved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Müdahale Edildi</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Acil İnceleme Bekliyor</span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] text-foreground/40 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(alert.createdAt).toLocaleString("tr-TR")}</span>
                      </span>
                    </div>

                    {/* Complaint Message with Censorship & Reveal Toggle */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <p className="text-xs text-white leading-relaxed font-medium">
                        {displayMessage}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-foreground/50 border-t border-white/5">
                        <span className="italic">
                          {isRevealed ? "Orijinal metin gösteriliyor" : "Uygunsuz ifadeler otomatik sansürlendi (***)"}
                        </span>
                        <button
                          onClick={() => toggleReveal(alert.id)}
                          className="text-accent hover:underline flex items-center gap-1 font-bold cursor-pointer"
                        >
                          {isRevealed ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Sansürle</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Orijinal Metni Göster</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Customer contact info if provided */}
                    {(alert.customerName || alert.customerPhone) && (
                      <div className="flex items-center gap-4 text-xs text-foreground/70 pt-1">
                        {alert.customerName && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-accent" />
                            <span>{alert.customerName}</span>
                          </div>
                        )}
                        {alert.customerPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-accent" />
                            <a href={`tel:${alert.customerPhone}`} className="hover:text-white underline">
                              {alert.customerPhone}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions for Boss */}
                  <div className="flex md:flex-col items-center gap-2 shrink-0 pt-2 md:pt-0">
                    {!alert.isResolved && (
                      <button
                        onClick={() => resolveManagerAlert(alert.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Çözüldü İşaretle</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm("Bu şikayet kaydını kalıcı olarak silmek istediğinize emin misiniz?")) {
                          deleteManagerAlert(alert.id);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/20 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Kayıt yalnızca patron tarafından silinebilir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kaydı Sil</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
