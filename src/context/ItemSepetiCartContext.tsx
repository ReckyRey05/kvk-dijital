"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ItemSepetiCartItem } from "@/types/marketplace";

interface CartContextValue {
  items: ItemSepetiCartItem[];
  itemCount: number;
  isLoading: boolean;
  addItem: (listingId: string, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (listingId: string, quantity: number) => Promise<{ success: boolean; error?: string }>;
  removeItem: (listingId: string) => Promise<{ success: boolean }>;
  clearCartItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const ItemSepetiCartContext = createContext<CartContextValue>({
  items: [],
  itemCount: 0,
  isLoading: false,
  addItem: async () => ({ success: false }),
  updateQuantity: async () => ({ success: false }),
  removeItem: async () => ({ success: false }),
  clearCartItems: async () => {},
  refreshCart: async () => {},
});

const GUEST_CART_KEY = "itemsepeti_guest_cart";

export function ItemSepetiCartProvider({
  children,
  currentUserId,
}: {
  children: React.ReactNode;
  currentUserId?: string;
}) {
  const [items, setItems] = useState<ItemSepetiCartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load cart on mount or user change
  const refreshCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (currentUserId) {
        // Authenticated buyer: check if guest cart needs merge
        const guestJson = typeof window !== "undefined" ? localStorage.getItem(GUEST_CART_KEY) : null;
        if (guestJson) {
          try {
            const guestItems = JSON.parse(guestJson);
            if (Array.isArray(guestItems) && guestItems.length > 0) {
              await fetch("/api/itemsepeti/cart/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  buyerId: currentUserId,
                  action: "merge",
                  guestItems,
                }),
              });
              localStorage.removeItem(GUEST_CART_KEY);
            }
          } catch {}
        }

        // Fetch authoritative server cart
        const res = await fetch(`/api/itemsepeti/cart?buyerId=${encodeURIComponent(currentUserId)}`);
        const data = await res.json();
        if (data.success && data.cart) {
          setItems(data.cart.items || []);
        }
      } else {
        // Guest user: local storage
        if (typeof window !== "undefined") {
          const guestJson = localStorage.getItem(GUEST_CART_KEY);
          if (guestJson) {
            setItems(JSON.parse(guestJson) || []);
          } else {
            setItems([]);
          }
        }
      }
    } catch {
      // Graceful error fallback
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Add Item
  const addItem = async (listingId: string, quantity: number = 1): Promise<{ success: boolean; error?: string }> => {
    if (currentUserId) {
      try {
        const res = await fetch("/api/itemsepeti/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyerId: currentUserId, listingId, quantity }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          return { success: false, error: data.error || "Ürün sepete eklenemedi." };
        }
        await refreshCart();
        return { success: true };
      } catch {
        return { success: false, error: "Bağlantı hatası oluştu." };
      }
    } else {
      // Guest local cart
      const currentGuest = [...items];
      const existing = currentGuest.find((it) => it.listingId === listingId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        currentGuest.push({ listingId, quantity, addedAt: Date.now() });
      }
      setItems(currentGuest);
      if (typeof window !== "undefined") {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(currentGuest));
      }
      return { success: true };
    }
  };

  // Update Quantity
  const updateQuantity = async (listingId: string, quantity: number): Promise<{ success: boolean; error?: string }> => {
    if (currentUserId) {
      try {
        const res = await fetch(`/api/itemsepeti/cart/items/${encodeURIComponent(listingId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buyerId: currentUserId, quantity }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          return { success: false, error: data.error || "Sepet güncellenemedi." };
        }
        await refreshCart();
        return { success: true };
      } catch {
        return { success: false, error: "Bağlantı hatası oluştu." };
      }
    } else {
      let currentGuest = [...items];
      if (quantity <= 0) {
        currentGuest = currentGuest.filter((it) => it.listingId !== listingId);
      } else {
        const it = currentGuest.find((i) => i.listingId === listingId);
        if (it) it.quantity = quantity;
      }
      setItems(currentGuest);
      if (typeof window !== "undefined") {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(currentGuest));
      }
      return { success: true };
    }
  };

  // Remove Item
  const removeItem = async (listingId: string): Promise<{ success: boolean }> => {
    if (currentUserId) {
      try {
        await fetch(
          `/api/itemsepeti/cart/items/${encodeURIComponent(listingId)}?buyerId=${encodeURIComponent(currentUserId)}`,
          { method: "DELETE" }
        );
        await refreshCart();
        return { success: true };
      } catch {
        return { success: false };
      }
    } else {
      const currentGuest = items.filter((it) => it.listingId !== listingId);
      setItems(currentGuest);
      if (typeof window !== "undefined") {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(currentGuest));
      }
      return { success: true };
    }
  };

  // Clear Cart
  const clearCartItems = async (): Promise<void> => {
    if (currentUserId) {
      try {
        await fetch(`/api/itemsepeti/cart?buyerId=${encodeURIComponent(currentUserId)}`, { method: "DELETE" });
        await refreshCart();
      } catch {}
    } else {
      setItems([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(GUEST_CART_KEY);
      }
    }
  };

  const itemCount = items.reduce((acc, it) => acc + (it.quantity || 0), 0);

  return (
    <ItemSepetiCartContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCartItems,
        refreshCart,
      }}
    >
      {children}
    </ItemSepetiCartContext.Provider>
  );
}

export function useItemSepetiCart() {
  return useContext(ItemSepetiCartContext);
}