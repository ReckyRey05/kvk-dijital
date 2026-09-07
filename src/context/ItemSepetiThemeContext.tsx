"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ItemSepetiThemeMode } from "@/styles/itemsepetiTokens";

interface ItemSepetiThemeContextType {
  theme: ItemSepetiThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ItemSepetiThemeMode) => void;
}

const ItemSepetiThemeContext = createContext<ItemSepetiThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ItemSepetiThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ItemSepetiThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("itemsepeti_theme");
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      } else {
        // Canonical default is LIGHT mode as per FAZ 3.5 Revision
        setThemeState("light");
      }
    } catch {
      setThemeState("light");
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
        data-itemsepeti-theme={mounted ? theme : "light"}
        className={`min-h-screen w-full font-sans transition-colors duration-150 ${
          theme === "dark" ? "itemsepeti-dark" : "itemsepeti-light"
        }`}
        style={{
          backgroundColor: theme === "dark" ? "#12141A" : "#F7F7F5",
          color: theme === "dark" ? "#EDEEF2" : "#17191F",
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
