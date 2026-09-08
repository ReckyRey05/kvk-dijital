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

export default function ItemSepetiAdminModerationPage() {
  const [activeTab, setActiveTab] = useState<"sellers" | "listings">("listings");

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

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleApproveSeller = (sellerId: string) => {
    setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, status: "approved" } : s)));
    setFeedback("Satıcı başvurusu onaylandı. Kullanıcı artık ilan açabilir.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRejectSeller = (sellerId: string) => {
    setSellers((prev) => prev.map((s) => (s.id === sellerId ? { ...s, status: "rejected" } : s)));
    setFeedback("Satıcı başvurusu reddedildi.");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleApproveListing = (listingId: string) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status: "active" } : l)));
    setFeedback("İlan onaylandı ve pazaryerinde yayına alındı!");
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleRejectListing = (listingId: string) => {
    setListings((prev) => prev.map((l) => (l.id === listingId ? { ...l, status: "rejected" } : l)));
    setFeedback("İlan reddedildi ve satıcıya bildirim gönderildi.");
    setTimeout(() => setFeedback(null), 3000);
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
                Satıcı olma başvurularını ve pazaryerine gönderilen yeni ilanları denetleyin.
              </p>
            </div>

            <div className="flex items-center gap-2 p-1 rounded-[10px] border border-[#DCDDE1] dark:border-[#282C3A] bg-white dark:bg-[#161921]">
              <button
                onClick={() => setActiveTab("listings")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                  activeTab === "listings"
                    ? "bg-[#D99532] text-white"
                    : "text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Onay Bekleyen İlanlar ({listings.filter((l) => l.status === "pending_review").length})
              </button>
              <button
                onClick={() => setActiveTab("sellers")}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-colors ${
                  activeTab === "sellers"
                    ? "bg-[#D99532] text-white"
                    : "text-[#626772] dark:text-[#9498A6]"
                }`}
              >
                Satıcı Başvuruları ({sellers.filter((s) => s.status === "pending").length})
              </button>
            </div>
          </div>

          {feedback && (
            <div className="p-3.5 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedback}</span>
            </div>
          )}

          {/* TAB 1: PENDING LISTINGS */}
          {activeTab === "listings" && (
            <div className="space-y-3">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-[14px] border bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D99532]/10 text-[#D99532]">
                        {item.gameName}
                      </span>
                      <span className="text-xs text-[#9498A6]">Satıcı: <strong className="text-inherit">@{item.sellerName}</strong></span>
                      <span className="text-xs text-[#9498A6]">&bull; {item.submittedAt}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          item.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : item.status === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {item.status === "active"
                          ? "Onaylandı"
                          : item.status === "rejected"
                          ? "Reddedildi"
                          : "İnceleme Bekliyor"}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-inherit">{item.title}</h3>

                    <div className="flex items-center gap-4 text-xs text-[#9498A6]">
                      <span>Birim Fiyat: <strong className="text-inherit">{item.price.toLocaleString("tr-TR")} TL</strong></span>
                      <span>Stok: <strong className="text-inherit">{item.stock} Adet</strong></span>
                    </div>
                  </div>

                  {item.status === "pending_review" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRejectListing(item.id)}
                        className="px-3 py-2 rounded-[8px] border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reddet
                      </button>
                      <ItemSepetiButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveListing(item.id)}
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
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
