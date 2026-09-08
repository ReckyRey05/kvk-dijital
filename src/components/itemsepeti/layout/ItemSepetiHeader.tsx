"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sun, Moon, ShoppingCart, User, Menu, X, PlusCircle } from "lucide-react";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";
import { useItemSepetiCart } from "@/context/ItemSepetiCartContext";
import { useItemSepetiAuth } from "@/context/ItemSepetiAuthContext";
import ItemSepetiLogo from "../ui/ItemSepetiLogo";
import ItemSepetiHeaderSearch from "./ItemSepetiHeaderSearch";
import ItemSepetiNotificationDropdown from "./ItemSepetiNotificationDropdown";

export default function ItemSepetiHeader() {
  const { theme, toggleTheme } = useItemSepetiTheme();
  const isDark = theme === "dark";
  const { itemCount } = useItemSepetiCart();
  const { user } = useItemSepetiAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors select-none"
      style={{
        backgroundColor: isDark ? "rgba(18, 20, 26, 0.95)" : "rgba(255, 255, 255, 0.96)",
        borderColor: isDark ? "#282C3A" : "#DCDDE1",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* BRAND LOGO */}
        <div className="shrink-0 flex items-center">
          <ItemSepetiLogo size="md" />
        </div>

        {/* PRIMARY FOCAL POINT: LARGE SEARCH */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <ItemSepetiHeaderSearch placeholder="Oyun, item veya ürün ara... (Ctrl+K)" />
        </div>

        {/* COMPACT DESKTOP ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Secondary quiet links */}
          <Link
            href="/nasil-calisir"
            className={`hidden lg:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-[8px] transition-colors ${
              isDark ? "text-[#9498A6] hover:text-[#EDEEF2]" : "text-[#626772] hover:text-[#17191F]"
            }`}
          >
            Nasıl Çalışır?
          </Link>

          {/* İlan Ver Action Button */}
          <Link
            href="/ilan-ver"
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-[8px] transition-transform active:scale-95"
            style={{
              backgroundColor: isDark ? "#2C3140" : "#F0F1F3",
              color: isDark ? "#EDEEF2" : "#17191F",
              border: isDark ? "1px solid #383F52" : "1px solid #DCDDE1",
            }}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#D99532]" />
            <span>İlan Ver</span>
          </Link>

          {/* User Notification Center */}
          {user && <ItemSepetiNotificationDropdown userId={user.uid} />}

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            aria-label={`Tema Değiştir (${isDark ? "Açık Moda Geç" : "Koyu Moda Geç"})`}
            className={`p-2 rounded-[8px] border transition-colors cursor-pointer ${
              isDark
                ? "border-[#282C3A] bg-[#161921] text-[#9498A6] hover:text-[#EDEEF2]"
                : "border-[#DCDDE1] bg-white text-[#626772] hover:text-[#17191F]"
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#D99532]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart Icon */}
          <Link
            href="/sepet"
            aria-label={`Sepetim (${itemCount} ürün)`}
            className={`relative p-2 rounded-[8px] border transition-colors cursor-pointer ${
              isDark
                ? "border-[#282C3A] bg-[#161921] text-[#9498A6] hover:text-[#EDEEF2]"
                : "border-[#DCDDE1] bg-white text-[#626772] hover:text-[#17191F]"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
              style={{ backgroundColor: "#D99532" }}
            >
              {itemCount}
            </span>
          </Link>

          {/* Auth Button / Profile Menu */}
          {user ? (
            <Link
              href="/profilim"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[8px] text-xs font-bold text-white transition-all active:scale-[0.98] shadow-xs"
              style={{ backgroundColor: "#D99532" }}
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[80px] sm:max-w-[110px] truncate">{user.displayName}</span>
            </Link>
          ) : (
            <Link
              href="/giris"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] text-xs font-bold text-white transition-all active:scale-[0.98]"
              style={{ backgroundColor: "#D99532" }}
            >
              <User className="w-3.5 h-3.5" />
              <span>Giriş Yap</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mobil Menüyü Aç"
            aria-expanded={mobileMenuOpen}
            className={`md:hidden p-2 rounded-[8px] border transition-colors cursor-pointer ${
              isDark
                ? "border-[#282C3A] text-[#9498A6] hover:text-[#EDEEF2]"
                : "border-[#DCDDE1] text-[#626772] hover:text-[#17191F]"
            }`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* BYNOGAME STYLE GAME CATEGORY SUB-NAV BAR (DESKTOP) */}
      <div
        className="hidden md:block border-t text-xs overflow-x-auto no-scrollbar"
        style={{
          backgroundColor: isDark ? "#161921" : "#FAFAFA",
          borderColor: isDark ? "#282C3A" : "#ECECEC",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-6 whitespace-nowrap">
          <Link
            href="/kategori/cs2"
            className="font-bold hover:text-[#D99532] transition-colors flex items-center gap-1.5"
            style={{ color: isDark ? "#EDEEF2" : "#17191F" }}
          >
            <span className="w-2 h-2 rounded-full bg-[#D99532]"></span>
            <span>CS2 Skin & Kasa</span>
          </Link>
          <Link
            href="/kategori/metin2"
            className="font-semibold hover:text-[#D99532] transition-colors flex items-center gap-1.5"
            style={{ color: isDark ? "#9498A6" : "#626772" }}
          >
            <span>Metin2 Yang & Won</span>
          </Link>
          <Link
            href="/kategori/valorant"
            className="font-semibold hover:text-[#D99532] transition-colors flex items-center gap-1.5"
            style={{ color: isDark ? "#9498A6" : "#626772" }}
          >
            <span>Valorant VP</span>
          </Link>
          <Link
            href="/kategori/pubg"
            className="font-semibold hover:text-[#D99532] transition-colors flex items-center gap-1.5"
            style={{ color: isDark ? "#9498A6" : "#626772" }}
          >
            <span>PUBG Mobile UC</span>
          </Link>
          <Link
            href="/kategori/steam"
            className="font-semibold hover:text-[#D99532] transition-colors flex items-center gap-1.5"
            style={{ color: isDark ? "#9498A6" : "#626772" }}
          >
            <span>Steam Cüzdan Kodu</span>
          </Link>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <Link
            href="/nasil-calisir"
            className="font-medium hover:text-[#D99532] transition-colors ml-auto text-[11px]"
            style={{ color: isDark ? "#9498A6" : "#7D8290" }}
          >
            Güvenli Alışveriş &bull; 7/24 Destek
          </Link>
        </div>
      </div>

      {/* MOBILE INLINE SEARCH */}
      <div className="md:hidden px-4 pb-3">
        <ItemSepetiHeaderSearch placeholder="Oyun, item veya kod ara..." />
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobil Menü"
          className={`md:hidden border-t px-4 py-4 space-y-3 ${
            isDark ? "bg-[#12141A] border-[#282C3A]" : "bg-[#F7F7F5] border-[#DCDDE1]"
          }`}
        >
          <Link
            href="/kategori/cs2"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold py-1.5"
          >
            CS2 Pazarı
          </Link>
          <Link
            href="/kategori/metin2"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold py-1.5"
          >
            Metin2 Yang & Won
          </Link>
          <Link
            href="/kategori/valorant"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold py-1.5"
          >
            Valorant VP E-Pin
          </Link>
          <Link
            href="/nasil-calisir"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold py-1.5"
          >
            Nasıl Çalışır?
          </Link>
          <Link
            href="/ilan-ver"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold text-[#D99532] py-1.5"
          >
            + İlan Ver
          </Link>
        </nav>
      )}
    </header>
  );
}
