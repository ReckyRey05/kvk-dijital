"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Package,
  ArrowLeft,
  AlertTriangle,
  ExternalLink,
  CreditCard,
  Banknote,
  Scale,
  Activity,
} from "lucide-react";

interface PendingSeller {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface PendingListing {
  id: string;
  title: string;
  gameName: string;
  sellerName: string;
  price: number;
  stock: number;
  submittedAt: string;
  status: "pending_review" | "active" | "rejected";
}

interface PendingPayout {
  id: string;
  sellerName: string;
  sellerEmail: string;
  amount: number;
  iban: string;
  accountHolder: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

interface PendingAuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: string;
}

interface PendingDispute {
  id: string;
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  reason: string;
  description: string;
  openedAt: string;
  status: "OPEN" | "RESOLVED_BUYER" | "RESOLVED_SELLER";
}

export default function ItemSepetiAdminModerationPage() {
  const [activeTab, setActiveTab] = useState<"sellers" | "listings" | "payouts" | "disputes" | "audit">("listings");

  const [sellers, setSellers] = useState<PendingSeller[]>([
    {
      id: "usr_req_1",
      displayName: "AnadoluYangPazari",
      email: "iletisim@anadoluyang.com",
      phone: "0532 999 88 77",
      requestedAt: "10 dakika önce",
      status: "pending",
    },
    {
      id: "usr_req_2",
      displayName: "GamerEpinDunyasi",
      email: "destek@gamerepin.com",
      phone: "0544 111 22 33",
      requestedAt: "1 saat önce",
      status: "pending",
    },
  ]);

  const [listings, setListings] = useState<PendingListing[]>([
    {
      id: "lst_mod_1",
      title: "AK-47 | Asiimov (Field-Tested) 0.19 Float Temiz",
      gameName: "CS2",
      sellerName: "DragonTrader",
      price: 1850,
      stock: 1,
      submittedAt: "5 dakika önce",
      status: "pending_review",
    },
    {
      id: "lst_mod_2",
      title: "Marmara 100 Won Yang Paketi - Anında Köy Teslimatı",
      gameName: "Metin2",
      sellerName: "Metin2Efsane",
      price: 450,
      stock: 25,
      submittedAt: "12 dakika önce",
      status: "pending_review",
    },
    {
      id: "lst_mod_3",
      title: "Valorant 2800 VP Riot Dijital Kod",
      gameName: "Valorant",
      sellerName: "KodMerkezi",
      price: 680,
      stock: 10,
      submittedAt: "25 dakika önce",
      status: "pending_review",
    },
  ]);

  const [payouts, setPayouts] = useState<PendingPayout[]>([
    {
      id: "pay_req_1",
      sellerName: "DragonTrader",
      sellerEmail: "dragontrader@itemsepeti.com",
      amount: 1794.5,
      iban: "TR330006100511123220000001",
      accountHolder: "Ahmet Demir",
      requestedAt: "15 dakika önce",
      status: "pending",
    },
    {
      id: "pay_req_2",
      sellerName: "Metin2Efsane",
      sellerEmail: "metin2efsane@gmail.com",
      amount: 2150.0,
      iban: "TR560006200000012990022301",
      accountHolder: "Mustafa Çelik",
      requestedAt: "45 dakika önce",
      status: "pending",
    },
  ]);

  const [disputes, setDisputes] = useState<PendingDispute[]>([
    {
      id: "dsp_1",
      orderNumber: "SIP-2026-902144",
      buyerName: "Ali H.",
      sellerName: "DragonTrader",
      amount: 450,
      reason: "Ürün Teslim Edilmedi",
      description: "Satıcı 45 dakikadır oyunda takas teklifini kabul etmedi ve chatten cevap vermiyor.",
      openedAt: "20 dakika önce",
      status: "OPEN",
    },
    {
      id: "dsp_2",
      orderNumber: "SIP-2026-881230",
      buyerName: "Caner T.",
      sellerName: "KodMerkezi",
      amount: 680,
      reason: "Geçersiz Dijital Kod",
      description: "Riot istemcisinde kod kullanılmış uyarısı verdi. Satıcıdan yeni kod talep ediyorum.",
      openedAt: "1 saat önce",
      status: "OPEN",
    },
  ]);

    const [auditLogs] = useState<PendingAuditLog[]>([
    {
      id: "aud_01",
      actorId: "usr_admin_root",
      actorRole: "admin",
      action: "DISPUTE_ARBITRATED",
      resource: "dispute",
      resourceId: "dsp_SIP-2026-902144",
      details: "Alıcı lehine karar verildi. Escrow 450 TL cüzdana iade edildi.",
      timestamp: "5 dakika önce",
    },
    {
      id: "aud_02",
      actorId: "usr_admin_root",
      actorRole: "admin",
      action: "LISTING_APPROVED",
      resource: "listing",
      resourceId: "lst_mod_1",
      details: "AK-47 Asiimov ilanı onaylandı ve yayına alındı.",
      timestamp: "18 dakika önce",
    },
    {
      id: "aud_03",
      actorId: "usr_gamer_ali",
      actorRole: "buyer",
      action: "ORDER_STATUS_CHANGED",
      resource: "order",
      resourceId: "ord_101",
      details: "Sipariş durumu PENDING_PAYMENT -> PAID olarak güncellendi.",
      timestamp: "35 dakika önce",
    },
    {
      id: "aud_04",
      actorId: "DragonTrader",
      actorRole: "seller",
      action: "ORDER_STATUS_CHANGED",
      resource: "order",
      resourceId: "ord_101",
      details: "Satıcı ürünü teslim ettiğini bildirdi (PAID -> DELIVERED).",
      timestamp: "50 dakika önce",
    },
  ]);

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleApproveSeller = (sellerId: string) => {
    setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, status: "approved" } : s)));
    setFeedback("Satıcı başvurusu onaylandı. Kullanıcı artık ilan açabilir.");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRejectSeller = (sellerId: string) => {
    setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, status: "rejected" } : s)));
    setFeedback("Satıcı başvurusu reddedildi.");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApproveListing = (listingId: string) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status: "active" } : l)));
    setFeedback("İlan onaylandı ve pazaryerinde canlıya alındı!");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRejectListing = (listingId: string) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status: "rejected" } : l)));
    setFeedback("İlan reddedildi ve satıcıya bildirim gönderildi.");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleApprovePayout = (payoutId: string) => {
    setPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status: "approved" } : p)));
    setFeedback("Para çekme talebi onaylandı! Banka transferi kuyruğuna alındı.");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleRejectPayout = (payoutId: string) => {
    setPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status: "rejected" } : p)));
    setFeedback("Para çekme talebi reddedildi. Bakiye satıcı cüzdanına iade edildi.");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleArbitrateDispute = (disputeId: string, decision: "buyer" | "seller") => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId
          ? { ...d, status: decision === "buyer" ? "RESOLVED_BUYER" : "RESOLVED_SELLER" }
          : d
      )
    );
    if (decision === "buyer") {
      setFeedback("Hakem Kararı: Escrow bedeli alıcı cüzdanına iade edildi (REFUND).");
    } else {
      setFeedback("Hakem Kararı: İtiraz haksız bulundu. Escrow satıcı hesabına aktarıldı.");
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#D99532]/20 text-[#D99532]">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-black tracking-tight text-inherit">
                  İtemSepeti Moderasyon & Admin Onay Merkezi
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#9498A6]">
                Satıcı başvurularını, onay bekleyen ilanları, para çekimleri ve uyuşmazlık (dispute) hakem heyetini yönetin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 p-1 rounded-[10px] border border-[#DCDDE1] dark:border-[#282C3A] bg-white dark:bg-[#161921]">
              <button
                onClick={() => setActiveTab("listings")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                  activeTab === "listings"
                    ? "bg-[#D99532] text-white"
                    : "text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                İlan Onay ({listings.filter((l) => l.status === "pending_review").length})
              </button>
              <button
                onClick={() => setActiveTab("sellers")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                  activeTab === "sellers"
                    ? "bg-[#D99532] text-white"
                    : "text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Satıcı Başvuru ({sellers.filter((s) => s.status === "pending").length})
              </button>
              <button
                onClick={() => setActiveTab("payouts")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                  activeTab === "payouts"
                    ? "bg-[#D99532] text-white"
                    : "text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Para Çekme ({payouts.filter((p) => p.status === "pending").length})
              </button>
              <button
                onClick={() => setActiveTab("disputes")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                  activeTab === "disputes"
                    ? "bg-red-500 text-white"
                    : "text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                İtiraz / Hakem ({disputes.filter((d) => d.status === "OPEN").length})
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                  activeTab === "audit"
                    ? "bg-purple-600 text-white"
                    : "text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Denetim İzi (Audit Logs)
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3.5 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* TAB 1: PENDING LISTINGS */}
          {activeTab === "listings" && (
            <div className="space-y-3">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-4 sm:p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#9498A6]">
                        {listing.gameName}
                      </span>
                      <h3 className="text-base font-bold text-inherit">{listing.title}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          listing.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : listing.status === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {listing.status === "active"
                          ? "Onaylandı & Canlıda"
                          : listing.status === "rejected"
                          ? "Reddedildi"
                          : "Onay Bekliyor"}
                      </span>
                    </div>

                    <p className="text-xs text-[#9498A6]">
                      Satıcı: <strong className="text-inherit">{listing.sellerName}</strong> &bull; Stok: {listing.stock} &bull; Fiyat:{" "}
                      <strong className="text-inherit">{listing.price.toLocaleString("tr-TR")} TL</strong> &bull; Gönderim: {listing.submittedAt}
                    </p>
                  </div>

                  {listing.status === "pending_review" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectListing(listing.id)}
                        className="px-3 py-2 rounded-[8px] border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reddet
                      </button>
                      <ItemSepetiButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveListing(listing.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>İlanı Onayla & Yayınla</span>
                      </ItemSepetiButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PENDING SELLERS */}
          {activeTab === "sellers" && (
            <div className="space-y-3">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  className="p-4 sm:p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#D99532]" />
                      <h3 className="text-base font-bold text-inherit">{seller.displayName}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          seller.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : seller.status === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {seller.status === "approved"
                          ? "Onaylandı"
                          : seller.status === "rejected"
                          ? "Reddedildi"
                          : "Onay Bekliyor"}
                      </span>
                    </div>

                    <p className="text-xs text-[#9498A6]">
                      E-Posta: <strong className="text-inherit">{seller.email}</strong> &bull; Tel: <strong className="text-inherit">{seller.phone}</strong> &bull; Başvuru: {seller.requestedAt}
                    </p>
                  </div>

                  {seller.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectSeller(seller.id)}
                        className="px-3 py-2 rounded-[8px] border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reddet
                      </button>
                      <ItemSepetiButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveSeller(seller.id)}
                      >
                        <UserCheck className="w-3.5 h-3.5 mr-1" />
                        <span>Satıcıyı Onayla</span>
                      </ItemSepetiButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PENDING PAYOUTS */}
          {activeTab === "payouts" && (
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 sm:p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-base font-bold text-inherit">
                        {payout.amount.toLocaleString("tr-TR")} TL
                      </h3>
                      <span className="text-xs text-[#9498A6]">
                        ({payout.sellerName})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          payout.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : payout.status === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {payout.status === "approved"
                          ? "Onaylandı / Transfer Edildi"
                          : payout.status === "rejected"
                          ? "Reddedildi"
                          : "Onay Bekliyor"}
                      </span>
                    </div>

                    <p className="text-xs text-[#9498A6]">
                      Hesap Sahibi: <strong className="text-inherit">{payout.accountHolder}</strong> &bull; IBAN: <code className="text-xs font-mono font-bold text-inherit bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">{payout.iban}</code>
                    </p>
                    <p className="text-[11px] text-[#9498A6]">
                      E-Posta: {payout.sellerEmail} &bull; Talep: {payout.requestedAt}
                    </p>
                  </div>

                  {payout.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectPayout(payout.id)}
                        className="px-3 py-2 rounded-[8px] border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reddet & İade Et
                      </button>
                      <ItemSepetiButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprovePayout(payout.id)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Transferi Onayla</span>
                      </ItemSepetiButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: DISPUTES & ARBITRATION */}
          {activeTab === "disputes" && (
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-4 sm:p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-red-500" />
                      <span className="font-mono font-bold text-xs text-inherit">{dispute.orderNumber}</span>
                      <span className="text-xs font-bold text-inherit">&bull; {dispute.reason}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          dispute.status === "RESOLVED_BUYER"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : dispute.status === "RESOLVED_SELLER"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {dispute.status === "RESOLVED_BUYER"
                          ? "Alıcıya İade Edildi"
                          : dispute.status === "RESOLVED_SELLER"
                          ? "Satıcıya Aktarıldı"
                          : "Hakem İncelemesinde"}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-inherit">
                      Escrow Bloke: <span className="text-[#D99532]">{dispute.amount} TL</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-red-500/[0.04] border border-red-500/20 text-xs text-inherit leading-relaxed">
                    <p className="font-semibold text-red-600 dark:text-red-400 mb-0.5">Alıcı Şikayet & Gerekçe Açıklaması:</p>
                    {dispute.description}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#9498A6]">
                    <div>
                      Alıcı: <strong className="text-inherit">{dispute.buyerName}</strong> &bull; Satıcı: <strong className="text-inherit">{dispute.sellerName}</strong> &bull; Açılış: {dispute.openedAt}
                    </div>

                    {dispute.status === "OPEN" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleArbitrateDispute(dispute.id, "seller")}
                          className="px-3 py-1.5 rounded-[8px] border border-slate-300 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-inherit transition-colors cursor-pointer"
                        >
                          Satıcıyı Haklı Bul (Escrow Serbest Bırak)
                        </button>
                        <button
                          onClick={() => handleArbitrateDispute(dispute.id, "buyer")}
                          className="px-3 py-1.5 rounded-[8px] bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Alıcıyı Haklı Bul (Parayı İade Et)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              <div className="p-4 rounded-[12px] bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                <Activity className="w-4 h-4 shrink-0" />
                <span>Değiştirilemez Denetim İzi: Platformdaki tüm bakiye, hakem ve durum değişiklikleri kriptografik zaman damgasıyla saklanır.</span>
              </div>

              <div className="rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/5 dark:bg-white/5 border-b border-[#DCDDE1] dark:border-[#282C3A] text-[#9498A6] font-semibold">
                    <tr>
                      <th className="p-3">İşlem / Eylem</th>
                      <th className="p-3">Aktör</th>
                      <th className="p-3">Kaynak</th>
                      <th className="p-3">Detay</th>
                      <th className="p-3 text-right">Zaman</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCDDE1]/60 dark:divide-[#282C3A]/60">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                        <td className="p-3">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-inherit">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-inherit">{log.actorId}</span>{" "}
                          <span className="text-[10px] text-[#9498A6]">({log.actorRole})</span>
                        </td>
                        <td className="p-3 text-[#9498A6]">
                          {log.resource}:{log.resourceId}
                        </td>
                        <td className="p-3 text-inherit">{log.details}</td>
                        <td className="p-3 text-right text-[#9498A6] whitespace-nowrap">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
