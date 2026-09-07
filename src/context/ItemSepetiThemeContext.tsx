"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ItemSepetiThemeMode } from "@/styles/itemsepetiTokens";

interface ItemSepetiThemeContextType {
  theme: ItemSepetiThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ItemSepetiThemeMode) => void;
}

const ItemSepetiThemeContext = createContext<ItemSepetiThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ItemSepetiThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ItemSepetiThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("itemsepeti_theme");
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      } else {
        // System preference fallback with dark as canonical default
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setThemeState(prefersDark ? "dark" : "dark"); // Default dark mode
      }
    } catch {
      setThemeState("dark");
    }
    setMounted(true);
  }, []);

  const setTheme = (mode: ItemSepetiThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem("itemsepeti_theme", mode);
      document.cookie = `itemsepeti_theme=${mode}; path=/; max-age=31536000`;
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ItemSepetiThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div
        data-itemsepeti-theme={mounted ? theme : "dark"}
        className={`min-h-screen w-full font-sans transition-colors duration-200 ${
          theme === "dark" ? "itemsepeti-dark" : "itemsepeti-light"
        }`}
        style={{
          backgroundColor: theme === "dark" ? "#12141A" : "#F4F5F8",
          color: theme === "dark" ? "#EDEEF2" : "#141721",
        }}
      >
        {children}
      </div>
    </ItemSepetiThemeContext.Provider>
  );
}

export function useItemSepetiTheme() {
  return useContext(ItemSepetiThemeContext);
}
