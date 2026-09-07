"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PackageCheck,
  Building2,
  Truck,
  Sun,
  Moon,
  Bell,
  Plus,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Search,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { TeklifimProfile, TeklifimNotification } from "@/types/teklifimGelsin";
import { useTeklifimTheme } from "@/context/TeklifimThemeContext";
import NotificationDropdown from "./NotificationDropdown";
import ComparisonDrawer from "./ComparisonDrawer";

export default function TeklifimHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTeklifimTheme();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeklifimProfile | null>(null);
  const [notifications, setNotifications] = useState<TeklifimNotification[]>([]);
  const [unreadConvCount, setUnreadConvCount] = useState<number>(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Try cached profile first
        const cached = localStorage.getItem(`teklifim_profile_${currentUser.uid}`);
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch {}
        }
        loadUserData(currentUser);
      } else {
        setProfile(null);
        setNotifications([]);
        setUnreadConvCount(0);
      }
    });
    return () => unsub();
  }, []);

  const loadUserData = async (currentUser: any) => {
    try {
      const token = await currentUser.getIdToken();
      // Load profile
      const pRes = await fetch("/api/teklifim-gelsin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.profile) {
          setProfile(pData.profile);
          localStorage.setItem(
            `teklifim_profile_${currentUser.uid}`,
            JSON.stringify(pData.profile)
          );
        }
      }

      // Load notifications
      const nRes = await fetch("/api/teklifim-gelsin/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (nRes.ok) {
        const nData = await nRes.json();
        if (nData.notifications) {
          setNotifications(nData.notifications);
        }
      }

      // Load conversations for unread badge
      const cRes = await fetch("/api/teklifim-gelsin/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.conversations) {
          const totalUnread = cData.conversations.reduce((acc: number, c: any) => {
            const isBiz = c.businessId === currentUser.uid;
            return acc + (isBiz ? (c.unreadCountBusiness || 0) : (c.unreadCountSupplier || 0));
          }, 0);
          setUnreadConvCount(totalUnread);
        }
      }
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      if (user) {
        const token = await user.getIdToken();
        await fetch("/api/teklifim-gelsin/notifications", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notificationId: id }),
        });
      }
    } catch {}
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/teklifim-gelsin");
    } catch {}
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0A0E17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
        {/* BRAND LOGO */}
        <div className="flex items-center gap-6">
          <Link
            href="/teklifim-gelsin"
            className="flex items-center gap-3 group transition-transform active:scale-98"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-500 dark:to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Teklifim<span className="text-emerald-600 dark:text-emerald-400">Gelsin</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                B2B Tedarik Pazaryeri
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200 dark:border-slate-800">
            <Link
              href="/teklifim-gelsin/dashboard"
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname === "/teklifim-gelsin/dashboard"
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              Panel
            </Link>
            <Link
              href="/teklifim-gelsin/search"
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/teklifim-gelsin/search")
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Arama</span>
            </Link>
            <Link
              href="/teklifim-gelsin/categories"
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname.startsWith("/teklifim-gelsin/categories")
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              Kategoriler
            </Link>
            <Link
              href="/teklifim-gelsin/suppliers"
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname.startsWith("/teklifim-gelsin/suppliers")
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              Tedarikçiler
            </Link>
            <Link
              href="/teklifim-gelsin/products"
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                pathname.startsWith("/teklifim-gelsin/products")
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              Ürünler
            </Link>
            {user && profile?.role === "supplier" && (
              <Link
                href="/teklifim-gelsin/offers"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.startsWith("/teklifim-gelsin/offers")
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                Tekliflerim
              </Link>
            )}
            {user && profile?.role !== "supplier" && (
              <Link
                href="/teklifim-gelsin/favorites"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.startsWith("/teklifim-gelsin/favorites")
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                Favorilerim
              </Link>
            )}
            {user && (
              <Link
                href="/teklifim-gelsin/messages"
                className={`relative px-3 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 ${
                  pathname.startsWith("/teklifim-gelsin/messages")
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <span>Mesajlar</span>
                {unreadConvCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white leading-none">
                    {unreadConvCount}
                  </span>
                )}
              </Link>
            )}
            {user && (
              <Link
                href="/teklifim-gelsin/orders"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.startsWith("/teklifim-gelsin/orders")
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                Siparişler
              </Link>
            )}
            {user && (
              <Link
                href="/teklifim-gelsin/payments"
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  pathname.startsWith("/teklifim-gelsin/payments")
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                Ödemeler & Finans
              </Link>
            )}
            <Link
              href="/teklifim-gelsin#akisi-gor"
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              Nasıl Çalışır?
            </Link>
            <Link
              href="/teklifim-gelsin#kategoriler"
              className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
              Kategoriler
            </Link>
          </nav>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* THEME TOGGLE SWITCH */}
          <button
            onClick={toggleTheme}
            aria-label="Tema Değiştir"
            title={theme === "light" ? "Karanlık Moda Geç" : "Aydınlık Moda Geç"}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* LOGGED IN CONTROLS */}
          {user ? (
            <>
              {/* NOTIFICATION BELL */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  aria-label="Bildirimler"
                  className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-950 animate-pulse">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <NotificationDropdown
                    notifications={notifications}
                    onMarkRead={handleMarkRead}
                    onClose={() => setShowNotifs(false)}
                  />
                )}
              </div>

              {/* USER PROFILE & ROLE PILL */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <div className="flex flex-col items-start leading-tight">
                    <span className="max-w-[120px] truncate font-bold">
                      {profile?.companyName || user.email?.split("@")[0] || "Hesabım"}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      {profile?.role === "supplier" ? "Toptancı" : "İşletme"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-1.5 text-xs font-medium space-y-1">
                    <Link
                      href="/teklifim-gelsin/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Kontrol Paneli</span>
                    </Link>

                    {profile?.role === "supplier" ? (
                      <>
                        <Link
                          href="/teklifim-gelsin/offers"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <PackageCheck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tekliflerim</span>
                        </Link>
                        <Link
                          href={`/teklifim-gelsin/suppliers/${user.uid}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5 text-slate-500" />
                          <span>Firma Profilim</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        href="/teklifim-gelsin/favorites"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Favori Tedarikçilerim</span>
                      </Link>
                    )}

                    <Link
                      href="/teklifim-gelsin/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                      <span>Siparişlerim</span>
                    </Link>

                    <Link
                      href="/teklifim-gelsin/payments"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      <span>{profile?.role === "supplier" ? "Finans & Hakedişlerim" : "Ödemelerim"}</span>
                    </Link>

                    <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-1" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>

              {/* PRIMARY ACTION BUTTON */}
              {profile?.role === "supplier" ? (
                <Link
                  href="/teklifim-gelsin/dashboard"
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all"
                >
                  Talepleri Gör
                </Link>
              ) : (
                <Link
                  href="/teklifim-gelsin/requests/new"
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Talep Oluştur</span>
                  <span className="sm:hidden">Talep</span>
                </Link>
              )}
            </>
          ) : (
            /* GUEST STATE */
            <div className="flex items-center gap-2">
              <Link
                href="/teklifim-gelsin/auth"
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Giriş
              </Link>
              <Link
                href="/teklifim-gelsin/auth?role=business"
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all"
              >
                Teklif İste
              </Link>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E17] p-4 space-y-3">
          <Link
            href="/teklifim-gelsin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Kontrol Paneli
          </Link>
          <Link
            href="/teklifim-gelsin/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Pazar Arama & Keşif</span>
          </Link>
          <Link
            href="/teklifim-gelsin/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Kategoriler & Sektörler
          </Link>
          <Link
            href="/teklifim-gelsin/suppliers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Tedarikçiler
          </Link>
          <Link
            href="/teklifim-gelsin/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Ürünler
          </Link>
          {user && profile?.role === "supplier" && (
            <Link
              href="/teklifim-gelsin/offers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Tekliflerim
            </Link>
          )}
          {user && profile?.role !== "supplier" && (
            <Link
              href="/teklifim-gelsin/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Favorilerim
            </Link>
          )}
          {user && (
            <Link
              href="/teklifim-gelsin/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span>Mesajlar</span>
              {unreadConvCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1.5 text-xs font-bold text-white leading-none">
                  {unreadConvCount}
                </span>
              )}
            </Link>
          )}
          {user && (
            <Link
              href="/teklifim-gelsin/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Siparişler
            </Link>
          )}
          {user && (
            <Link
              href="/teklifim-gelsin/payments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Ödemeler & Finans
            </Link>
          )}
          <Link
            href="/teklifim-gelsin#akisi-gor"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Nasıl Çalışır?
          </Link>
          <Link
            href="/teklifim-gelsin#kategoriler"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Kategoriler
          </Link>

          {user && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      )}

      {/* COMPARISON FLOATING DOCK */}
      <ComparisonDrawer />
    </header>
  );
}
