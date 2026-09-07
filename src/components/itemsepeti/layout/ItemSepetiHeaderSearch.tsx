"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Command, Gamepad2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ItemSepetiPrice } from "../marketplace/MarketplacePrimitives";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

interface HeaderSearchProps {
  placeholder?: string;
  className?: string;
}

export default function ItemSepetiHeaderSearch({
  placeholder = "Oyun, item veya ürün ara...",
  className = "",
}: HeaderSearchProps) {
  const router = useRouter();
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    games: any[];
    categories: any[];
    listings: any[];
  }>({ games: [], categories: [], listings: [] });
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions({ games: [], categories: [], listings: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/itemsepeti/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSuggestions({
              games: data.games || [],
              categories: data.categories || [],
              listings: (data.listings || []).slice(0, 4),
            });
          }
        }
      } catch {}
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions({ games: [], categories: [], listings: [] });
    inputRef.current?.focus();
  };

  const totalSuggestions =
    suggestions.games.length + suggestions.categories.length + suggestions.listings.length;
  const showDropdown = isFocused && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative flex items-center w-full max-w-xl transition-all ${className}`}>
      <form onSubmit={handleSearch} className="w-full" role="search">
        <div
          className="relative flex items-center w-full h-11 rounded-[10px] border transition-all"
          style={{
            backgroundColor: isDark ? "rgba(0, 0, 0, 0.3)" : "#FFFFFF",
            borderColor: isFocused ? "#D99532" : isDark ? "#282C3A" : "#DCDDE1",
            boxShadow: isFocused ? "0 0 0 3px rgba(217, 149, 50, 0.18)" : "none",
          }}
        >
          <Search
            className={`w-4 h-4 ml-3.5 shrink-0 pointer-events-none ${
              isFocused ? "text-[#D99532]" : isDark ? "text-[#9498A6]" : "text-[#626772]"
            }`}
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            aria-label="Ürün, oyun veya ilan ara"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            className={`w-full h-full bg-transparent px-3 text-sm focus:outline-none ${
              isDark ? "text-[#EDEEF2] placeholder:text-[#9498A6]" : "text-[#17191F] placeholder:text-[#626772]"
            }`}
          />

          {query ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Aramayı temizle"
              className={`p-1 mr-2 rounded-[6px] hover:text-inherit focus:outline-none focus:ring-1 focus:ring-[#D99532] ${
                isDark ? "text-[#9498A6]" : "text-[#626772]"
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div
              className={`hidden sm:flex items-center gap-0.5 mr-3 px-1.5 py-0.5 rounded-[4px] border text-[10px] font-mono select-none ${
                isDark
                  ? "border-white/10 text-[#9498A6] bg-black/20"
                  : "border-[#DCDDE1] text-[#626772] bg-[#F0F1F3]"
              }`}
            >
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          )}
        </div>
      </form>

      {/* AUTOCOMPLETE RESULTS POPUP */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-[12px] border shadow-xl overflow-hidden backdrop-blur-md transition-all text-xs"
          style={{
            backgroundColor: isDark ? "rgba(22, 25, 33, 0.98)" : "#FFFFFF",
            borderColor: isDark ? "#282C3A" : "#DCDDE1",
          }}
        >
          {loading && (
            <div className={`p-3 text-center ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>Aranıyor...</div>
          )}

          {!loading && totalSuggestions === 0 && (
            <div className={`p-4 text-center ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
              <p>Sonuç bulunamadı.</p>
              <button
                type="button"
                onClick={() => {
                  setIsFocused(false);
                  router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-2 text-[#D99532] hover:underline font-semibold"
              >
                &ldquo;{query}&rdquo; için tüm sonuçları gör
              </button>
            </div>
          )}

          {!loading && totalSuggestions > 0 && (
            <div className={`max-h-[380px] overflow-y-auto divide-y py-1 ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
              {/* GAMES */}
              {suggestions.games.length > 0 && (
                <div className="py-1">
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? "text-[#9498A6]" : "text-[#626772]"
                  }`}>
                    Oyunlar
                  </div>
                  {suggestions.games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/kategori/${game.slug}`}
                      onClick={() => setIsFocused(false)}
                      className={`flex items-center justify-between px-3 py-2 transition-colors ${
                        isDark ? "hover:bg-white/5 text-[#EDEEF2]" : "hover:bg-[#F0F1F3] text-[#17191F]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-3.5 h-3.5 text-[#D99532]" />
                        <span className="font-semibold">{game.name}</span>
                      </div>
                      <ChevronRight className="w-3 h-3 text-[#9498A6]" />
                    </Link>
                  ))}
                </div>
              )}

              {/* LISTINGS */}
              {suggestions.listings.length > 0 && (
                <div className="py-1">
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? "text-[#9498A6]" : "text-[#626772]"
                  }`}>
                    İlanlar
                  </div>
                  {suggestions.listings.map((l) => (
                    <Link
                      key={l.id}
                      href={`/ilan/${l.id}`}
                      onClick={() => setIsFocused(false)}
                      className={`flex items-center justify-between px-3 py-2 transition-colors ${
                        isDark ? "hover:bg-white/5 text-[#EDEEF2]" : "hover:bg-[#F0F1F3] text-[#17191F]"
                      }`}
                    >
                      <div className="flex-1 truncate pr-2">
                        <span className="font-medium truncate block">{l.title}</span>
                        <span className={`text-[10px] ${isDark ? "text-[#9498A6]" : "text-[#626772]"}`}>
                          {l.gameName} &bull; {l.categoryName}
                        </span>
                      </div>
                      <ItemSepetiPrice amount={l.unitPrice} size="sm" />
                    </Link>
                  ))}
                </div>
              )}

              {/* BOTTOM FOOTER */}
              <div className={`p-2 text-center ${isDark ? "bg-black/20" : "bg-[#F7F7F5]"}`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full py-1.5 rounded-[6px] text-xs font-semibold text-[#D99532] hover:bg-[#D99532]/10 transition-colors"
                >
                  &ldquo;{query}&rdquo; için tüm sonuçları gör
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
