"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Package,
  Building2,
  Layers,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { TeklifimAutocompleteSuggestion } from "@/types/teklifimGelsin";
import { sanitizeSearchQuery } from "@/lib/teklifimGelsin/searchUtils";

interface SearchBarProps {
  initialQuery?: string;
  initialCategory?: string;
  placeholder?: string;
  compact?: boolean;
  autoFocus?: boolean;
  onSearch?: (query: string, category?: string) => void;
  className?: string;
}

export default function SearchBar({
  initialQuery = "",
  initialCategory = "",
  placeholder = "Ürün, marka, SKU, toptancı veya kategori ara...",
  compact = false,
  autoFocus = false,
  onSearch,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<TeklifimAutocompleteSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Debounced autocomplete fetch
  useEffect(() => {
    const cleaned = sanitizeSearchQuery(query);
    if (!cleaned || cleaned.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/teklifim-gelsin/search/autocomplete?q=${encodeURIComponent(cleaned)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
          setIsOpen((data.suggestions || []).length > 0);
        }
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
    if (onSearch) {
      onSearch("", initialCategory);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    const cleaned = sanitizeSearchQuery(query);

    if (onSearch) {
      onSearch(cleaned, initialCategory);
    } else {
      const catParam = initialCategory
        ? `&category=${encodeURIComponent(initialCategory)}`
        : "";
      router.push(`/teklifim-gelsin/search?q=${encodeURIComponent(cleaned)}${catParam}`);
    }
  };

  const handleSelectSuggestion = (suggestion: TeklifimAutocompleteSuggestion) => {
    setIsOpen(false);
    router.push(suggestion.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleSubmit();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "category":
      case "subCategory":
        return <Layers className="w-4 h-4 text-amber-500 shrink-0" />;
      case "supplier":
        return <Building2 className="w-4 h-4 text-blue-500 shrink-0" />;
      default:
        return <Package className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 sm:left-4 pointer-events-none text-slate-400">
          <Search className={compact ? "w-4 h-4" : "w-5 h-5"} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={`w-full font-sans transition-all duration-200 outline-none
            bg-slate-50 dark:bg-slate-900/90
            border border-slate-200 dark:border-slate-800
            focus:border-emerald-500 dark:focus:border-emerald-500
            focus:bg-white dark:focus:bg-slate-950
            focus:ring-2 focus:ring-emerald-500/20
            text-slate-900 dark:text-slate-100 placeholder:text-slate-400
            ${
              compact
                ? "py-2 pl-10 pr-20 text-xs sm:text-sm rounded-xl"
                : "py-3.5 pl-11 sm:pl-12 pr-28 text-sm sm:text-base rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
            }
          `}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {loading && (
            <div className="p-1.5 text-slate-400 animate-spin">
              <Loader2 className="w-4 h-4" />
            </div>
          )}

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              title="Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className={`font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm ${
              compact ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-xs sm:text-sm"
            }`}
          >
            Ara
          </button>
        </div>
      </form>

      {/* AUTOCOMPLETE DROPDOWN */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          <div className="py-1">
            {suggestions.map((item, idx) => (
              <button
                key={`${item.type}-${item.id || item.title}-${idx}`}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full px-4 py-2.5 flex items-center justify-between text-left transition-colors ${
                  selectedIndex === idx
                    ? "bg-slate-50 dark:bg-slate-800/80"
                    : "hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {getIconForType(item.type)}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </button>
            ))}
          </div>

          <div className="p-2.5 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              <strong>&quot;{query}&quot;</strong> ile ilgili tüm sonuçları gör
            </span>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              Tümünü Gör
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
