"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Command } from "lucide-react";
import { useRouter } from "next/navigation";

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/kategori/cs2?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex items-center w-full max-w-xl transition-all ${className}`}
      role="search"
    >
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
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          aria-label="Ürün, oyun veya ilan ara"
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
  );
}
