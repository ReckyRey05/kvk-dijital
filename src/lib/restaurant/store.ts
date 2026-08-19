"use client";

import { useState, useEffect } from "react";
import { Order, Table, WaiterCall, MenuItem, Category, ManagerAlert, CustomerVoucher, SongRequest } from "@/types/restaurant";
import { DEMO_TABLES, DEMO_MENU_ITEMS, DEMO_CATEGORIES } from "./mockData";
import { playOrderAlertSound, playWaiterCallSound } from "./audio";

// Initial Demo Active Orders
const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_101",
    restaurantId: "rest_aura_bistro",
    tableId: "m-2",
    tableNumber: "Masa 2",
    sessionToken: "sess_demo_101",
    status: "PREPARING",
    items: [
      {
        id: "item_ord_1",
        menuItemId: "item_truffle_burger",
        name: "Trüflü Gurme Dana Burger (180g)",
        basePrice: 340,
        finalPrice: 400,
        quantity: 2,
        selectedOptions: [
          {
            groupId: "opt_burger_doneness",
            groupTitle: "Köfte Pişme Derecesi",
            selectedItems: [{ id: "doneness_med", name: "Orta (Medium)", priceDelta: 0 }],
          },
          {
            groupId: "opt_burger_extras",
            groupTitle: "Ekstra Lezzetler",
            selectedItems: [{ id: "extra_bacon", name: "Çıtır Dana Füme", priceDelta: 60 }],
          },
        ],
        itemNotes: "Lütfen patatesler ekstra çıtır olsun.",
      },
    ],
    subtotal: 800,
    taxAmount: 80,
    serviceCharge: 0,
    totalAmount: 800,
    paymentStatus: "PENDING",
    paymentMethod: "CREDIT_CARD",
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_102",
    restaurantId: "rest_aura_bistro",
    tableId: "m-4",
    tableNumber: "Masa 4",
    sessionToken: "sess_demo_102",
    status: "PENDING_CONFIRMATION", // Kasada Garson Onayı Bekliyor!
    items: [
      {
        id: "item_ord_2",
        menuItemId: "item_ribeye_steak",
        name: "Közlenmiş Kuşkonmazlı Antrikot (250g)",
        basePrice: 680,
        finalPrice: 680,
        quantity: 1,
        selectedOptions: [
          {
            groupId: "opt_steak_doneness",
            groupTitle: "Et Pişme Derecesi",
            selectedItems: [{ id: "steak_med_rare", name: "Az-Orta (Medium Rare)", priceDelta: 0 }],
          },
        ],
      },
      {
        id: "item_ord_3",
        menuItemId: "item_burrata_pizza",
        name: "Burrata & Pesto Taş Fırın Pizza",
        basePrice: 420,
        finalPrice: 470,
        quantity: 1,
        selectedOptions: [
          {
            groupId: "opt_pizza_crust",
            groupTitle: "Kenar Seçeneği",
            selectedItems: [{ id: "crust_mozzarella", name: "Peynir Dolgulu Kenar", priceDelta: 50 }],
          },
        ],
      },
    ],
    subtotal: 1150,
    taxAmount: 115,
    serviceCharge: 0,
    totalAmount: 1150,
    notes: "Bebek arabamız var, terasın köşesindeyiz.",
    paymentStatus: "PENDING",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

const INITIAL_CALLS: WaiterCall[] = [
  {
    id: "call_1",
    restaurantId: "rest_aura_bistro",
    tableId: "m-4",
    tableNumber: "Masa 4",
    type: "WAITER",
    message: "Menü hakkında soru sormak istiyor.",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: "call_2",
    restaurantId: "rest_aura_bistro",
    tableId: "m-5",
    tableNumber: "Masa 5",
    type: "BILL_CARD",
    message: "Hesap İsteği (Kredi Kartı POS)",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
  },
];

// In-Memory Shared State Across Components (Cross-Tab via BroadcastChannel / CustomEvent)
let globalOrders = [...INITIAL_ORDERS];
let globalTables = [...DEMO_TABLES];
let globalCalls = [...INITIAL_CALLS];
let globalMenuItems = [...DEMO_MENU_ITEMS];
let globalCategories = [...DEMO_CATEGORIES];

let globalManagerAlerts: ManagerAlert[] = [
  {
    id: "alert_1",
    tableId: "m-4",
    tableNumber: "Masa 4",
    type: "VIP_VISIT",
    message: "VIP Düzenli Müşteri Masaya Oturdu (Ahmet Bey)",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    isResolved: false,
  },
];

let globalVouchers: CustomerVoucher[] = [];

let globalSongRequests: SongRequest[] = [
  {
    id: "song_1",
    tableNumber: "Masa 2",
    songTitle: "Midnight City",
    artist: "M83",
    votes: 6,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "song_2",
    tableNumber: "Masa 4",
    songTitle: "Save Your Tears",
    artist: "The Weeknd",
    votes: 4,
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "song_3",
    tableNumber: "Masa 6",
    songTitle: "Get Lucky",
    artist: "Daft Punk ft. Pharrell",
    votes: 9,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
];

const listeners = new Set<() => void>();
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel("cep_garson_realtime_sync");
  } catch (e) {
    console.error("BroadcastChannel init failed", e);
  }
}

function saveToStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cg_orders", JSON.stringify(globalOrders));
    localStorage.setItem("cg_tables", JSON.stringify(globalTables));
    localStorage.setItem("cg_calls", JSON.stringify(globalCalls));
    localStorage.setItem("cg_menu", JSON.stringify(globalMenuItems));
    localStorage.setItem("cg_alerts", JSON.stringify(globalManagerAlerts));
    localStorage.setItem("cg_vouchers", JSON.stringify(globalVouchers));
    localStorage.setItem("cg_songs", JSON.stringify(globalSongRequests));
  } catch (e) {
    console.error("Storage save error", e);
  }
}

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const orders = localStorage.getItem("cg_orders");
    if (orders) globalOrders = JSON.parse(orders);

    const tables = localStorage.getItem("cg_tables");
    if (tables) globalTables = JSON.parse(tables);

    const calls = localStorage.getItem("cg_calls");
    if (calls) globalCalls = JSON.parse(calls);

    const menu = localStorage.getItem("cg_menu");
    if (menu) globalMenuItems = JSON.parse(menu);

    const alerts = localStorage.getItem("cg_alerts");
    if (alerts) globalManagerAlerts = JSON.parse(alerts);

    const vouchers = localStorage.getItem("cg_vouchers");
    if (vouchers) globalVouchers = JSON.parse(vouchers);

    const songs = localStorage.getItem("cg_songs");
    if (songs) globalSongRequests = JSON.parse(songs);
  } catch (e) {
    console.error("Storage load error", e);
  }
}

function notifyAll(broadcast = true) {
  saveToStorage();
  listeners.forEach((listener) => listener());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("restaurant_state_sync"));
    if (broadcast && broadcastChannel) {
      broadcastChannel.postMessage({
        type: "STATE_SYNC",
        orders: globalOrders,
        tables: globalTables,
        calls: globalCalls,
        menuItems: globalMenuItems,
        alerts: globalManagerAlerts,
        vouchers: globalVouchers,
        songs: globalSongRequests,
      });
    }
  }
}

export function useRestaurantStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    loadFromStorage();
    const handler = () => setTick((t) => t + 1);
    listeners.add(handler);
    window.addEventListener("restaurant_state_sync", handler);

    // Cross-tab storage listener
    const handleStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("cg_")) {
        loadFromStorage();
        handler();
      }
    };
    window.addEventListener("storage", handleStorage);

    // Cross-tab broadcast listener
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.type === "STATE_SYNC") {
        if (event.data.orders) globalOrders = event.data.orders;
        if (event.data.tables) globalTables = event.data.tables;
        if (event.data.calls) globalCalls = event.data.calls;
        if (event.data.menuItems) globalMenuItems = event.data.menuItems;
        if (event.data.alerts) globalManagerAlerts = event.data.alerts;
        if (event.data.vouchers) globalVouchers = event.data.vouchers;
        if (event.data.songs) globalSongRequests = event.data.songs;
        handler();
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener("message", handleBroadcast);
    }

    // Periodic check for expired discounts
    const checkExpirations = () => {
      const now = new Date();
      let hasChanges = false;
      globalMenuItems = globalMenuItems.map((item) => {
        if (item.discountUntil && new Date(item.discountUntil) <= now && item.originalPrice) {
          hasChanges = true;
          return {
            ...item,
            price: item.originalPrice,
            originalPrice: undefined,
            discountUntil: undefined,
          };
        }
        return item;
      });
      if (hasChanges) notifyAll();
    };

    checkExpirations();
    const expiryInterval = setInterval(checkExpirations, 10000);

    return () => {
      listeners.delete(handler);
      window.removeEventListener("restaurant_state_sync", handler);
      window.removeEventListener("storage", handleStorage);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener("message", handleBroadcast);
      }
      clearInterval(expiryInterval);
    };
  }, []);

  return {
    orders: globalOrders,
    tables: globalTables,
    waiterCalls: globalCalls,
    menuItems: globalMenuItems,
    categories: globalCategories,
    managerAlerts: globalManagerAlerts,
    vouchers: globalVouchers,
    songRequests: globalSongRequests,

    // Actions
    createOrder: (order: Order) => {
      globalOrders = [order, ...globalOrders];
      // Update Table Status
      globalTables = globalTables.map((t) =>
        t.id === order.tableId
          ? {
              ...t,
              status: order.status === "PENDING_CONFIRMATION" ? "OCCUPIED" : "OCCUPIED",
              activeOrderId: order.id,
              activeBillTotal: (t.activeBillTotal || 0) + order.totalAmount,
              lastOrderTime: "Az önce",
            }
          : t
      );
      playOrderAlertSound();
      notifyAll();
      return order;
    },

    confirmOrder: (orderId: string) => {
      globalOrders = globalOrders.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: "PREPARING", confirmedAt: new Date().toISOString() }
          : ord
      );
      notifyAll();
    },

    updateOrderStatus: (orderId: string, status: Order["status"]) => {
      globalOrders = globalOrders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              readyAt: status === "READY" ? new Date().toISOString() : ord.readyAt,
              servedAt: status === "SERVED" ? new Date().toISOString() : ord.servedAt,
            }
          : ord
      );
      notifyAll();
    },

    callWaiter: (call: WaiterCall) => {
      globalCalls = [call, ...globalCalls.filter((c) => c.tableId !== call.tableId || c.status !== "ACTIVE")];
      globalTables = globalTables.map((t) =>
        t.id === call.tableId
          ? {
              ...t,
              status: call.type.startsWith("BILL") ? "BILL_REQUESTED" : "WAITER_CALLED",
              lastCallType: call.type,
              lastCallTime: "Az önce",
            }
          : t
      );
      playWaiterCallSound();
      notifyAll();
    },

    resolveWaiterCall: (callId: string) => {
      const call = globalCalls.find((c) => c.id === callId);
      globalCalls = globalCalls.map((c) =>
        c.id === callId ? { ...c, status: "RESOLVED", resolvedAt: new Date().toISOString() } : c
      );
      if (call) {
        globalTables = globalTables.map((t) =>
          t.id === call.tableId ? { ...t, status: t.activeBillTotal > 0 ? "OCCUPIED" : "EMPTY" } : t
        );
      }
      notifyAll();
    },

    closeTableBill: (tableId: string) => {
      // 1. Mark orders as COMPLETED
      globalOrders = globalOrders.map((ord) =>
        ord.tableId === tableId && ord.status !== "CANCELLED"
          ? { ...ord, status: "COMPLETED", completedAt: new Date().toISOString() }
          : ord
      );

      // 2. Clear Table status & bill
      globalTables = globalTables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: "EMPTY",
              activeOrderId: undefined,
              activeBillTotal: 0,
              lastOrderTime: undefined,
              lastCallTime: undefined,
              lastCallType: undefined,
            }
          : t
      );

      // 3. Resolve any pending waiter calls
      globalCalls = globalCalls.map((c) =>
        c.tableId === tableId ? { ...c, status: "RESOLVED", resolvedAt: new Date().toISOString() } : c
      );

      notifyAll();
    },

    toggleItemAvailability: (itemId: string) => {
      globalMenuItems = globalMenuItems.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      );
      notifyAll();
    },

    updateItemPrice: (itemId: string, newPrice: number) => {
      if (isNaN(newPrice) || newPrice < 0) return;
      globalMenuItems = globalMenuItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              price: Math.round(newPrice),
              originalPrice: undefined,
              discountUntil: undefined,
            }
          : item
      );
      notifyAll();
    },

    setCampaignDiscount: (itemId: string, discountedPrice: number, discountUntil: string) => {
      if (isNaN(discountedPrice) || discountedPrice <= 0) return;
      globalMenuItems = globalMenuItems.map((item) => {
        if (item.id === itemId) {
          const originalPrice = item.originalPrice || item.price;
          return {
            ...item,
            price: Math.round(discountedPrice),
            originalPrice,
            discountUntil,
          };
        }
        return item;
      });
      notifyAll();
    },

    cancelCampaignDiscount: (itemId: string) => {
      globalMenuItems = globalMenuItems.map((item) => {
        if (item.id === itemId && item.originalPrice) {
          return {
            ...item,
            price: item.originalPrice,
            originalPrice: undefined,
            discountUntil: undefined,
          };
        }
        return item;
      });
      notifyAll();
    },

    transferTable: (fromTableId: string, toTableId: string) => {
      const fromTable = globalTables.find((t) => t.id === fromTableId);
      const toTable = globalTables.find((t) => t.id === toTableId);
      if (!fromTable || !toTable) return false;

      // 1. Move all active orders to toTable
      globalOrders = globalOrders.map((ord) =>
        ord.tableId === fromTableId && ord.status !== "COMPLETED" && ord.status !== "CANCELLED"
          ? { ...ord, tableId: toTableId, tableNumber: toTable.tableNumber }
          : ord
      );

      // 2. Move waiter calls
      globalCalls = globalCalls.map((c) =>
        c.tableId === fromTableId && c.status === "ACTIVE"
          ? { ...c, tableId: toTableId, tableNumber: toTable.tableNumber }
          : c
      );

      // 3. Update toTable bill & status
      globalTables = globalTables.map((t) => {
        if (t.id === toTableId) {
          return {
            ...t,
            status: fromTable.status,
            activeBillTotal: (t.activeBillTotal || 0) + fromTable.activeBillTotal,
            lastOrderTime: fromTable.lastOrderTime || t.lastOrderTime,
          };
        }
        if (t.id === fromTableId) {
          return {
            ...t,
            status: "EMPTY",
            activeOrderId: undefined,
            activeBillTotal: 0,
            lastOrderTime: undefined,
            lastCallTime: undefined,
            lastCallType: undefined,
          };
        }
        return t;
      });

      notifyAll();
      return true;
    },

    addManagerAlert: (alert: ManagerAlert) => {
      globalManagerAlerts = [alert, ...globalManagerAlerts];
      playWaiterCallSound();
      notifyAll();
    },

    resolveManagerAlert: (alertId: string) => {
      globalManagerAlerts = globalManagerAlerts.map((a) =>
        a.id === alertId ? { ...a, isResolved: true } : a
      );
      notifyAll();
    },

    addVoucher: (voucher: CustomerVoucher) => {
      globalVouchers = [voucher, ...globalVouchers];
      notifyAll();
    },

    addSongRequest: (song: SongRequest) => {
      globalSongRequests = [song, ...globalSongRequests];
      notifyAll();
    },

    voteSong: (songId: string) => {
      globalSongRequests = globalSongRequests.map((s) =>
        s.id === songId ? { ...s, votes: s.votes + 1 } : s
      );
      notifyAll();
    },

    payTableOnline: (tableId: string) => {
      globalOrders = globalOrders.map((ord) =>
        ord.tableId === tableId && ord.status !== "CANCELLED"
          ? { ...ord, paymentStatus: "PAID_ONLINE", paymentMethod: "ONLINE_POS", status: "COMPLETED" }
          : ord
      );
      globalTables = globalTables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: "EMPTY",
              activeOrderId: undefined,
              activeBillTotal: 0,
              lastOrderTime: undefined,
            }
          : t
      );
      notifyAll();
      return true;
    },
  };
}
