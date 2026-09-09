"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ItemSepetiUserRole } from "@/types/marketplace";

export interface AuthUserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  isPhoneVerified: boolean;
  role: ItemSepetiUserRole;
  sellerApprovalStatus?: "pending" | "approved" | "rejected";
  kycStatus?: "none" | "pending" | "verified" | "rejected";
  tcKimlikNo?: string;
  balance: number;
  steamTradeUrl?: string;
  gameNicknames?: Record<string, string>;
  createdAt: number;
}

interface AuthContextType {
  user: AuthUserProfile | null;
  isLoading: boolean;
  login: (email: string, role?: ItemSepetiUserRole, displayName?: string) => Promise<boolean>;
  signup: (data: { email: string; displayName: string; phone?: string; role?: ItemSepetiUserRole }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<AuthUserProfile>) => Promise<boolean>;
}

const ItemSepetiAuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  updateProfile: async () => false,
});

const DEFAULT_DEMO_USER: AuthUserProfile = {
  uid: "usr_gamer_ali",
  email: "ali@itemsepeti.com",
  displayName: "DragonTrader",
  phone: "+90 555 123 45 67",
  isPhoneVerified: true,
  role: "seller",
  sellerApprovalStatus: "approved",
  kycStatus: "verified",
  tcKimlikNo: "10000000146",
  balance: 1450.50,
  steamTradeUrl: "https://steamcommunity.com/tradeoffer/new/?partner=12345678&token=abcdefgh",
  gameNicknames: {
    cs2: "DragonSlayer",
    metin2: "KarakterX",
  },
  createdAt: Date.now() - 30 * 86400000,
};

export function ItemSepetiAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("itemsepeti_session_user");
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, role: ItemSepetiUserRole = "buyer", displayName?: string): Promise<boolean> => {
    // Check if user already has an existing saved profile with balance
    let existingBalance = 0;
    try {
      const saved = localStorage.getItem("itemsepeti_session_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email === email && typeof parsed.balance === "number") {
          existingBalance = parsed.balance;
        }
      }
    } catch {}

    const newUser: AuthUserProfile = {
      uid: `usr_${Date.now()}`,
      email,
      displayName: displayName || email.split("@")[0],
      isPhoneVerified: true,
      role,
      balance: existingBalance,
      createdAt: Date.now(),
    };
    setUser(newUser);
    try {
      localStorage.setItem("itemsepeti_session_user", JSON.stringify(newUser));
    } catch {}
    return true;
  };

  const signup = async (data: { email: string; displayName: string; phone?: string; role?: ItemSepetiUserRole }): Promise<boolean> => {
    const newUser: AuthUserProfile = {
      uid: `usr_${Date.now()}`,
      email: data.email,
      displayName: data.displayName,
      phone: data.phone,
      isPhoneVerified: !!data.phone,
      role: data.role || "buyer",
      sellerApprovalStatus: data.role === "seller" ? "pending" : undefined,
      balance: 0,
      createdAt: Date.now(),
    };
    setUser(newUser);
    try {
      localStorage.setItem("itemsepeti_session_user", JSON.stringify(newUser));
    } catch {}
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("itemsepeti_session_user");
    } catch {}
  };

  const updateProfile = async (data: Partial<AuthUserProfile>): Promise<boolean> => {
    if (!user) return false;
    const updated = { ...user, ...data };
    setUser(updated);
    try {
      localStorage.setItem("itemsepeti_session_user", JSON.stringify(updated));
    } catch {}
    return true;
  };

  return (
    <ItemSepetiAuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </ItemSepetiAuthContext.Provider>
  );
}

export function useItemSepetiAuth() {
  return useContext(ItemSepetiAuthContext);
}
