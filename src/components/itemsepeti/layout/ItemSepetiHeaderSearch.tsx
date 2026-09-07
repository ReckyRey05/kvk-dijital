"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Command, Gamepad2, Tag, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ItemSepetiPrice } from "../marketplace/MarketplacePrimitives";

interface HeaderSearchProps {
  placeholder?: string;
  className?: string;
}

export default function ItemSepetiHeaderSearch({
  placeholder = "Oyun, item veya ürün ara...",
  className = "",
}: HeaderSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    games: any[];
    categories: any[];
    listings: any[];
  }>({ games: [], categories: [], listings: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

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
          className="relative flex items-center w-full h-10 sm:h-11 rounded-[8px] border transition-all"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.15)",
            borderColor: isFocused ? "#E8A33D" : "rgba(148, 152, 166, 0.2)",
            boxShadow: isFocused ? "0 0 0 2px rgba(232, 163, 61, 0.25)" : "none",
          }}
        >
          <Search className="w-4 h-4 text-[#9498A6] ml-3 shrink-0 pointer-events-none" aria-hidden="true" />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            aria-label="Ürün, oyun veya ilan ara"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            className="w-full h-full bg-transparent px-3 text-xs sm:text-sm text-inherit placeholder:text-[#9498A6] focus:outline-none"
          />

          {query ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Aramayı temizle"
              className="p-1 mr-2 text-[#9498A6] hover:text-inherit rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#E8A33D]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 mr-3 px-1.5 py-0.5 rounded-[4px] border border-white/10 text-[10px] text-[#9498A6] font-mono select-none">
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </div>
          )}
        </div>
      </form>

      {/* AUTOCOMPLETE RESULTS POPUP */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-[12px] border shadow-2xl overflow-hidden backdrop-blur-md transition-all text-xs"
          style={{
            backgroundColor: "rgba(22, 25, 33, 0.98)",
            borderColor: "#282C3A",
          }}
        >
          {loading && (
            <div className="p-3 text-center text-[#9498A6]">Aranıyor...</div>
          )}

          {!loading && totalSuggestions === 0 && (
            <div className="p-4 text-center text-[#9498A6]">
              <p>Sonuç bulunamadı.</p>
              <button
                type="button"
                onClick={() => {
                  setIsFocused(false);
                  router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-2 text-[#E8A33D] hover:underline font-medium"
              >
                &ldquo;{query}&rdquo; için tüm sonuçları gör
              </button>
            </div>
          )}

          {!loading && totalSuggestions > 0 && (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 py-1">
              {/* GAMES */}
              {suggestions.games.length > 0 && (
                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9498A6]">
                    Oyunlar
                  </div>
                  {suggestions.games.map((game) => (
                    <Link
                      key={game.id}
                      href={`/kategori/${game.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors text-inherit"
                    >
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-3.5 h-3.5 text-[#E8A33D]" />
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
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9498A6]">
                    İlanlar
                  </div>
                  {suggestions.listings.map((l) => (
                    <Link
                      key={l.id}
                      href={`/ilan/${l.id}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 truncate pr-2">
                        <span className="text-inherit font-medium truncate block">{l.title}</span>
                        <span className="text-[10px] text-[#9498A6]">
                          {l.gameName} &bull; {l.categoryName}
                        </span>
                      </div>
                      <ItemSepetiPrice amount={l.unitPrice} size="sm" />
                    </Link>
                  ))}
                </div>
              )}

              {/* BOTTOM FOOTER: SEE ALL */}
              <div className="p-2 text-center bg-black/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsFocused(false);
                    router.push(`/arama?q=${encodeURIComponent(query.trim())}`);
                  }}
                  className="w-full py-1.5 rounded-[6px] text-xs font-semibold text-[#E8A33D] hover:bg-[#E8A33D]/10 transition-colors"
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
