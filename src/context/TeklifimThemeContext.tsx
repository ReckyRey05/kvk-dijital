"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TeklifimTheme = "light" | "dark";

interface TeklifimThemeContextType {
  theme: TeklifimTheme;
  toggleTheme: () => void;
  setTheme: (theme: TeklifimTheme) => void;
}

const TeklifimThemeContext = createContext<TeklifimThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function TeklifimThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<TeklifimTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("teklifim_theme");
      if (saved === "dark" || saved === "light") {
        setThemeState(saved);
      } else {
        // Default is light mode as requested
        setThemeState("light");
      }
    } catch {
      setThemeState("light");
    }
    setMounted(true);
  }, []);

  const setTheme = (newTheme: TeklifimTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("teklifim_theme", newTheme);
      document.cookie = `teklifim_theme=${newTheme}; path=/; max-age=31536000`;
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
  };

  return (
    <TeklifimThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <div
        data-teklifim-theme={mounted ? theme : "light"}
        className={mounted && theme === "dark" ? "dark" : ""}
      >
        {children}
      </div>
    </TeklifimThemeContext.Provider>
  );
}

export function useTeklifimTheme() {
  return useContext(TeklifimThemeContext);
}
