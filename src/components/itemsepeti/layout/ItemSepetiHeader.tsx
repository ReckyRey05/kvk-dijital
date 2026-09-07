"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sun, Moon, ShoppingCart, User, Menu, X } from "lucide-react";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";
import ItemSepetiLogo from "../ui/ItemSepetiLogo";
import ItemSepetiHeaderSearch from "./ItemSepetiHeaderSearch";

export default function ItemSepetiHeader() {
  const { theme, toggleTheme } = useItemSepetiTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 select-none"
      style={{
        backgroundColor: theme === "dark" ? "rgba(18, 20, 26, 0.92)" : "rgba(255, 255, 255, 0.92)",
        borderColor: theme === "dark" ? "#282C3A" : "#E2E5EC",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* BRAND LOGO */}
        <div className="shrink-0 flex items-center">
          <ItemSepetiLogo size="md" />
        </div>

        {/* PRIMARY FOCAL POINT: SEARCH BAR */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
          <ItemSepetiHeaderSearch />
        </div>

        {/* COMPACT DESKTOP ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* How it Works link */}
          <Link
            href="/nasil-calisir"
            className="hidden lg:inline-flex text-xs font-semibold text-[#9498A6] hover:text-inherit px-2.5 py-1.5 rounded-[8px] transition-colors"
          >
            Nasıl Çalışır?
          </Link>

          {/* İlan Ver CTA */}
          <Link
            href="/ilan-ver"
            className="hidden sm:inline-flex items-center justify-center text-xs font-semibold text-inherit px-3 py-1.5 rounded-[8px] border transition-colors hover:border-[#E8A33D]/60"
            style={{
              borderColor: theme === "dark" ? "#282C3A" : "#E2E5EC",
              backgroundColor: theme === "dark" ? "#1B1E27" : "#F0F2F6",
            }}
          >
            İlan Ver
          </Link>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            aria-label={`Tema Değiştir (${theme === "dark" ? "Açık Moda Geç" : "Koyu Moda Geç"})`}
            className="p-2 rounded-[8px] border text-[#9498A6] hover:text-inherit transition-colors cursor-pointer"
            style={{
              borderColor: theme === "dark" ? "#282C3A" : "#E2E5EC",
              backgroundColor: theme === "dark" ? "#1B1E27" : "#F0F2F6",
            }}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-[#E8A33D]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart Icon / Action */}
          <button
            aria-label="Sepetim (0 ürün)"
            className="relative p-2 rounded-[8px] border text-[#9498A6] hover:text-inherit transition-colors cursor-pointer"
            style={{
              borderColor: theme === "dark" ? "#282C3A" : "#E2E5EC",
              backgroundColor: theme === "dark" ? "#1B1E27" : "#F0F2F6",
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-[#12141A]"
              style={{ backgroundColor: "#E8A33D" }}
            >
              0
            </span>
          </button>

          {/* Auth Button */}
          <Link
            href="/itemsepeti"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-xs font-semibold text-[#12141A] transition-all active:scale-[0.98]"
            style={{ backgroundColor: "#E8A33D" }}
          >
            <User className="w-3.5 h-3.5" />
            <span>Giriş Yap</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mobil Menüyü Aç"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-[8px] border text-[#9498A6] hover:text-inherit transition-colors cursor-pointer"
            style={{
              borderColor: theme === "dark" ? "#282C3A" : "#E2E5EC",
            }}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE INLINE SEARCH */}
      <div className="md:hidden px-4 pb-3">
        <ItemSepetiHeaderSearch placeholder="Item, hesap veya kod ara..." />
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobil Menü"
          className="md:hidden border-t px-4 py-4 space-y-3"
          style={{
            backgroundColor: theme === "dark" ? "#1B1E27" : "#FFFFFF",
            borderColor: theme === "dark" ? "#282C3A" : "#E2E5EC",
          }}
        >
          <Link
            href="/kategori/cs2"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#9498A6] hover:text-inherit py-1.5"
          >
            CS2 İlanları
          </Link>
          <Link
            href="/kategori/metin2"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#9498A6] hover:text-inherit py-1.5"
          >
            Metin2 Yang & İtem
          </Link>
          <Link
            href="/nasil-calisir"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-[#9498A6] hover:text-inherit py-1.5"
          >
            Nasıl Çalışır?
          </Link>
        </nav>
      )}
    </header>
  );
}
