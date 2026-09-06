"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { TeklifimConversation } from "@/types/teklifimGelsin";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import ConversationPane from "@/components/teklifimGelsin/ConversationPane";
import {
  MessageSquare,
  Search,
  Building2,
  Clock,
  ShieldCheck,
  Inbox,
  Filter,
  RefreshCw,
  FileCheck,
} from "lucide-react";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("c") || "";

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [conversations, setConversations] = useState<TeklifimConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [selectedConvId, setSelectedConvId] = useState<string>(initialConvId);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoadingUser(false);
      if (!usr) {
        router.push("/teklifim-gelsin/login?redirect=/teklifim-gelsin/messages");
      }
    });
    return () => unsub();
  }, [router]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      setLoadingConversations(true);
      const res = await fetch("/api/teklifim-gelsin/conversations");
      const data = await res.json();
      if (data.conversations) {
        setConversations(data.conversations);
        if (!selectedConvId && data.conversations.length > 0) {
          setSelectedConvId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.warn("fetchConversations error:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Sync with searchParams ?c=
  useEffect(() => {
    const cParam = searchParams.get("c");
    if (cParam && cParam !== selectedConvId) {
      setSelectedConvId(cParam);
    }
  }, [searchParams]);

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2 text-sm text-zinc-500">
          <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
          <span>Oturum kontrol ediliyor...</span>
        </div>
      </div>
    );
  }

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const isBusiness = c.businessId === user?.uid;
    const otherName = isBusiness ? c.supplierName : c.businessName;
    const matchesSearch =
      otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.requestTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "unread") {
      const unread = isBusiness ? c.unreadCountBusiness : c.unreadCountSupplier;
      return (unread || 0) > 0;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
      <TeklifimHeader />

      <main className="flex flex-1 overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-7xl flex-1 overflow-hidden">
          {/* Left Panel: Conversation List */}
          <aside className="flex w-full flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:w-80 lg:w-96">
            {/* Top Bar */}
            <div className="border-b border-zinc-100 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Görüşmeler
                </h1>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {conversations.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Firma veya talep adı ile ara..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 py-2 text-xs outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/80 dark:focus:border-zinc-500"
                />
              </div>

              {/* Tab Pills */}
              <div className="mt-3 flex items-center gap-1 text-xs">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    activeTab === "all"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`rounded-lg px-3 py-1.5 font-medium transition ${
                    activeTab === "unread"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  Okunmamış
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {loadingConversations ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-xs text-zinc-500">
                  <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
                  <span>Yükleniyor...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center p-6 text-center text-zinc-400">
                  <Inbox className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">Görüşme Bulunamadı</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Gelen teklifler üzerinden görüşme başlattığınızda burada listelenecektir.
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isBusiness = c.businessId === user?.uid;
                  const otherName = isBusiness ? c.supplierName : c.businessName;
                  const unreadCount = isBusiness ? c.unreadCountBusiness : c.unreadCountSupplier;
                  const isSelected = c.id === selectedConvId;
                  const timeStr = c.lastMessageAt
                    ? new Date(c.lastMessageAt).toLocaleDateString("tr-TR", {
                        month: "short",
                        day: "numeric",
                      })
                    : "";

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedConvId(c.id);
                        router.replace(`/teklifim-gelsin/messages?c=${c.id}`);
                      }}
                      className={`cursor-pointer p-4 transition ${
                        isSelected
                          ? "border-l-4 border-zinc-900 bg-zinc-100/80 dark:border-zinc-100 dark:bg-zinc-800/80"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-xs font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                            {otherName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {otherName}
                            </h4>
                            <p className="truncate text-2xs text-zinc-500 dark:text-zinc-400">
                              {c.requestTitle}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 text-2xs text-zinc-400">{timeStr}</span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <p className="truncate text-zinc-500 dark:text-zinc-400 pr-2">
                          {c.lastMessageText || "Görüşme başlatıldı."}
                        </p>
                        {unreadCount > 0 && (
                          <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-rose-600 px-1.5 text-2xs font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Right Panel: Active Chat Pane */}
          <section className="flex flex-1 flex-col overflow-hidden">
            {selectedConvId && user ? (
              <ConversationPane
                key={selectedConvId}
                conversationId={selectedConvId}
                currentUserId={user.uid}
                onRefreshConversations={fetchConversations}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-zinc-400">
                <MessageSquare className="h-12 w-12 mb-3 opacity-40" />
                <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                  Bir Görüşme Seçin
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Pazarlık yapmak, teklif şartlarını netleştirmek veya anlaşma sağlamak için sol listeden bir görüşmeye tıklayın.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function TeklifimMessagesPage() {
  return (
    <TeklifimThemeProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <div className="flex flex-col items-center gap-2 text-sm text-zinc-500">
              <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
              <span>Yükleniyor...</span>
            </div>
          </div>
        }
      >
        <MessagesContent />
      </Suspense>
    </TeklifimThemeProvider>
  );
}
