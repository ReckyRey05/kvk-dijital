"use client";

import { useState, useEffect } from "react";
import {
  Order,
  Table,
  WaiterCall,
  MenuItem,
  Category,
  ManagerAlert,
  CustomerVoucher,
  SongRequest,
  OrderItem,
  TableParticipant,
  Ingredient,
  WasteLog,
  HappyHourRule,
  RecipeItem,
  DeliveryPlatform,
  DeliveryPlatformConfig,
  DeliveryOrder,
  EFaturaRecord,
  StaffRole,
  StaffPermissions,
  StaffMember,
  BossSecuritySettings,
} from "@/types/restaurant";
import {
  DEMO_TABLES,
  DEMO_MENU_ITEMS,
  DEMO_CATEGORIES,
  DEMO_INGREDIENTS,
  DEMO_WASTE_LOGS,
  DEMO_HAPPY_HOUR_RULES,
  DEMO_DELIVERY_PLATFORMS,
  DEMO_DELIVERY_ORDERS,
  DEMO_EFATURA_RECORDS,
  DEFAULT_ROLE_PERMISSIONS,
  DEMO_STAFF_MEMBERS,
  DEMO_BOSS_SECURITY,
} from "./mockData";
import { playOrderAlertSound, playWaiterCallSound } from "./audio";
import { censorProfanity } from "./profanityFilter";

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

let globalSharedCarts: Record<string, OrderItem[]> = {};
let globalTableParticipants: Record<string, TableParticipant[]> = {};
let globalIngredients: Ingredient[] = [...DEMO_INGREDIENTS];
let globalWasteLogs: WasteLog[] = [...DEMO_WASTE_LOGS];
let globalHappyHourRules: HappyHourRule[] = [...DEMO_HAPPY_HOUR_RULES];
let globalDeliveryPlatforms: DeliveryPlatformConfig[] = [...DEMO_DELIVERY_PLATFORMS];
let globalDeliveryOrders: DeliveryOrder[] = [...DEMO_DELIVERY_ORDERS];
let globalEFaturaRecords: EFaturaRecord[] = [...DEMO_EFATURA_RECORDS];
let globalTableTransfers: Record<string, { toTableId: string; toTableNumber: string; timestamp: number }> = {};
let globalStaffMembers: StaffMember[] = [...DEMO_STAFF_MEMBERS];
let globalRolePermissions: Record<StaffRole, StaffPermissions> = { ...DEFAULT_ROLE_PERMISSIONS };
let globalBossSecurity: BossSecuritySettings = { ...DEMO_BOSS_SECURITY };

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
    localStorage.setItem("cg_shared_carts", JSON.stringify(globalSharedCarts));
    localStorage.setItem("cg_table_participants", JSON.stringify(globalTableParticipants));
    localStorage.setItem("cg_ingredients", JSON.stringify(globalIngredients));
    localStorage.setItem("cg_waste_logs", JSON.stringify(globalWasteLogs));
    localStorage.setItem("cg_happy_hour", JSON.stringify(globalHappyHourRules));
    localStorage.setItem("cg_delivery_platforms", JSON.stringify(globalDeliveryPlatforms));
    localStorage.setItem("cg_delivery_orders", JSON.stringify(globalDeliveryOrders));
    localStorage.setItem("cg_efatura_records", JSON.stringify(globalEFaturaRecords));
    localStorage.setItem("cg_table_transfers", JSON.stringify(globalTableTransfers));
    localStorage.setItem("cg_staff_members", JSON.stringify(globalStaffMembers));
    localStorage.setItem("cg_role_permissions", JSON.stringify(globalRolePermissions));
    localStorage.setItem("cg_boss_security", JSON.stringify(globalBossSecurity));
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

    const sharedCarts = localStorage.getItem("cg_shared_carts");
    if (sharedCarts) globalSharedCarts = JSON.parse(sharedCarts);

    const participants = localStorage.getItem("cg_table_participants");
    if (participants) globalTableParticipants = JSON.parse(participants);

    const ingredients = localStorage.getItem("cg_ingredients");
    if (ingredients) globalIngredients = JSON.parse(ingredients);

    const wasteLogs = localStorage.getItem("cg_waste_logs");
    if (wasteLogs) globalWasteLogs = JSON.parse(wasteLogs);

    const happyHour = localStorage.getItem("cg_happy_hour");
    if (happyHour) globalHappyHourRules = JSON.parse(happyHour);

    const deliveryPlatforms = localStorage.getItem("cg_delivery_platforms");
    if (deliveryPlatforms) globalDeliveryPlatforms = JSON.parse(deliveryPlatforms);

    const deliveryOrders = localStorage.getItem("cg_delivery_orders");
    if (deliveryOrders) globalDeliveryOrders = JSON.parse(deliveryOrders);

    const efaturaRecords = localStorage.getItem("cg_efatura_records");
    if (efaturaRecords) globalEFaturaRecords = JSON.parse(efaturaRecords);

    const tableTransfers = localStorage.getItem("cg_table_transfers");
    if (tableTransfers) {
      try {
        const parsed = JSON.parse(tableTransfers);
        const now = Date.now();
        const fresh: Record<string, { toTableId: string; toTableNumber: string; timestamp: number }> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (v && typeof v === "object" && (v as any).timestamp && now - (v as any).timestamp < 30000) {
            fresh[k] = v as any;
          }
        }
        globalTableTransfers = fresh;
      } catch {
        globalTableTransfers = {};
      }
    }

    const staffMembers = localStorage.getItem("cg_staff_members");
    if (staffMembers) globalStaffMembers = JSON.parse(staffMembers);

    const rolePermissions = localStorage.getItem("cg_role_permissions");
    if (rolePermissions) globalRolePermissions = JSON.parse(rolePermissions);

    const bossSecurity = localStorage.getItem("cg_boss_security");
    if (bossSecurity) globalBossSecurity = JSON.parse(bossSecurity);
  } catch (e) {
    console.error("Storage load error", e);
  }
}

let lastKnownServerVersion = 0;

async function syncWithServer(action: string, payload?: any) {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/restaurant/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ action, payload }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.version) {
        lastKnownServerVersion = data.version;
      }
    }
  } catch (err) {
    // Silently continue in offline/fallback mode
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
        sharedCarts: globalSharedCarts,
        participants: globalTableParticipants,
        ingredients: globalIngredients,
        wasteLogs: globalWasteLogs,
        happyHourRules: globalHappyHourRules,
        deliveryPlatforms: globalDeliveryPlatforms,
        deliveryOrders: globalDeliveryOrders,
        efaturaRecords: globalEFaturaRecords,
        tableTransfers: globalTableTransfers,
        staffMembers: globalStaffMembers,
        rolePermissions: globalRolePermissions,
        bossSecurity: globalBossSecurity,
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
        const prevOrderCount = globalOrders.length;
        const prevCallCount = globalCalls.filter((c) => c.status === "ACTIVE").length;
        const prevAlertCount = globalManagerAlerts.filter((a) => !a.isResolved).length;

        if (event.data.orders) globalOrders = event.data.orders;
        if (event.data.tables) globalTables = event.data.tables;
        if (event.data.calls) globalCalls = event.data.calls;
        if (event.data.menuItems) globalMenuItems = event.data.menuItems;
        if (event.data.alerts) globalManagerAlerts = event.data.alerts;
        if (event.data.vouchers) globalVouchers = event.data.vouchers;
        if (event.data.songs) globalSongRequests = event.data.songs;
        if (event.data.sharedCarts) globalSharedCarts = event.data.sharedCarts;
        if (event.data.participants) globalTableParticipants = event.data.participants;
        if (event.data.ingredients) globalIngredients = event.data.ingredients;
        if (event.data.wasteLogs) globalWasteLogs = event.data.wasteLogs;
        if (event.data.happyHourRules) globalHappyHourRules = event.data.happyHourRules;
        if (event.data.deliveryPlatforms) globalDeliveryPlatforms = event.data.deliveryPlatforms;
        if (event.data.deliveryOrders) globalDeliveryOrders = event.data.deliveryOrders;
        if (event.data.efaturaRecords) globalEFaturaRecords = event.data.efaturaRecords;
        if (event.data.tableTransfers) globalTableTransfers = event.data.tableTransfers;
        if (event.data.staffMembers) globalStaffMembers = event.data.staffMembers;
        if (event.data.rolePermissions) globalRolePermissions = event.data.rolePermissions;
        if (event.data.bossSecurity) globalBossSecurity = event.data.bossSecurity;

        const newCallCount = globalCalls.filter((c) => c.status === "ACTIVE").length;
        const newAlertCount = globalManagerAlerts.filter((a) => !a.isResolved).length;

        if (event.data.orders && event.data.orders.length > prevOrderCount) {
          playOrderAlertSound();
        } else if (newCallCount > prevCallCount || newAlertCount > prevAlertCount) {
          playWaiterCallSound();
        }

        handler();
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener("message", handleBroadcast);
    }

    // Real-time live server polling for multi-device sync (Phone 1 -> PC -> Phone 2)
    const pollServer = async () => {
      try {
        const res = await fetch(`/api/restaurant/sync?t=${Date.now()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.version && data.version !== lastKnownServerVersion) {
            const prevOrderCount = globalOrders.length;
            const prevCallCount = globalCalls.filter((c) => c.status === "ACTIVE").length;
            const prevAlertCount = globalManagerAlerts.filter((a) => !a.isResolved).length;

            lastKnownServerVersion = data.version;
            if (data.orders) globalOrders = data.orders;
            if (data.tables) globalTables = data.tables;
            if (data.waiterCalls) globalCalls = data.waiterCalls;
            if (data.managerAlerts) globalManagerAlerts = data.managerAlerts;
            if (data.vouchers) globalVouchers = data.vouchers;
            if (data.songs) globalSongRequests = data.songs;
            if (data.menuItems) globalMenuItems = data.menuItems;
            if (data.tableTransfers) globalTableTransfers = data.tableTransfers;
            if (data.tableParticipants) globalTableParticipants = data.tableParticipants;
            if (data.sharedCarts) globalSharedCarts = data.sharedCarts;

            const newCallCount = globalCalls.filter((c) => c.status === "ACTIVE").length;
            const newAlertCount = globalManagerAlerts.filter((a) => !a.isResolved).length;

            if (data.orders && data.orders.length > prevOrderCount) {
              playOrderAlertSound();
            } else if (newCallCount > prevCallCount || newAlertCount > prevAlertCount) {
              playWaiterCallSound();
            }

            saveToStorage();
            notifyAll(false);
            handler();
          }
        }
      } catch {
        // ignore polling network errors
      }
    };

    pollServer();
    const serverSyncInterval = setInterval(pollServer, 600);

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
      clearInterval(serverSyncInterval);
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
      syncWithServer("CREATE_ORDER", { order });
      return order;
    },

    confirmOrder: (orderId: string) => {
      globalOrders = globalOrders.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: "PREPARING", confirmedAt: new Date().toISOString() }
          : ord
      );
      notifyAll();
      syncWithServer("CONFIRM_ORDER", { orderId });
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
      syncWithServer("UPDATE_ORDER_STATUS", { orderId, status });
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
      syncWithServer("CALL_WAITER", { call });
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
      syncWithServer("RESOLVE_CALL", { callId });
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

      // 4. Clear any table transfer redirects
      if (globalTableTransfers[tableId]) {
        const nextTransfers = { ...globalTableTransfers };
        delete nextTransfers[tableId];
        globalTableTransfers = nextTransfers;
      }

      notifyAll();
      syncWithServer("CLOSE_TABLE_BILL", { tableId });
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

      // 3. Move shared cart & participants seamlessly
      if (globalSharedCarts[fromTableId]) {
        globalSharedCarts[toTableId] = [
          ...(globalSharedCarts[toTableId] || []),
          ...globalSharedCarts[fromTableId],
        ];
        delete globalSharedCarts[fromTableId];
      }

      if (globalTableParticipants[fromTableId]) {
        globalTableParticipants[toTableId] = [
          ...(globalTableParticipants[toTableId] || []),
          ...globalTableParticipants[fromTableId],
        ];
        delete globalTableParticipants[fromTableId];
      }

      // 4. Record transfer redirect event for customer phone real-time sync
      globalTableTransfers[fromTableId] = {
        toTableId,
        toTableNumber: toTable.tableNumber,
        timestamp: Date.now(),
      };

      // 5. Update toTable bill & status
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
      syncWithServer("TRANSFER_TABLE", { fromTableId, toTableId });
      return true;
    },

    addManagerAlert: (alert: ManagerAlert) => {
      const censoredAlert: ManagerAlert = {
        ...alert,
        message: censorProfanity(alert.message),
      };
      globalManagerAlerts = [censoredAlert, ...globalManagerAlerts];
      playWaiterCallSound();
      notifyAll();
    },

    resolveManagerAlert: (alertId: string) => {
      globalManagerAlerts = globalManagerAlerts.map((a) =>
        a.id === alertId ? { ...a, isResolved: true } : a
      );
      notifyAll();
    },

    deleteManagerAlert: (alertId: string) => {
      globalManagerAlerts = globalManagerAlerts.filter((a) => a.id !== alertId);
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
      // Clear shared cart on checkout
      if (globalSharedCarts[tableId]) {
        globalSharedCarts = { ...globalSharedCarts, [tableId]: [] };
      }
      notifyAll();
      return true;
    },

    // Shared Group Table Cart & Host System
    sharedCarts: globalSharedCarts,
    tableParticipants: globalTableParticipants,

    addToSharedCart: (tableId: string, item: OrderItem) => {
      const current = globalSharedCarts[tableId] || [];
      globalSharedCarts = {
        ...globalSharedCarts,
        [tableId]: [...current, item],
      };
      notifyAll();
      syncWithServer("ADD_TO_SHARED_CART", { tableId, item });
    },

    updateSharedCartQuantity: (tableId: string, index: number, newQty: number) => {
      const current = globalSharedCarts[tableId] || [];
      globalSharedCarts = {
        ...globalSharedCarts,
        [tableId]: current.map((it, idx) => (idx === index ? { ...it, quantity: newQty } : it)),
      };
      notifyAll();
      syncWithServer("UPDATE_SHARED_CART_QTY", { tableId, index, newQty });
    },

    removeFromSharedCart: (tableId: string, index: number) => {
      const current = globalSharedCarts[tableId] || [];
      globalSharedCarts = {
        ...globalSharedCarts,
        [tableId]: current.filter((_, idx) => idx !== index),
      };
      notifyAll();
      syncWithServer("REMOVE_FROM_SHARED_CART", { tableId, index });
    },

    clearSharedCart: (tableId: string) => {
      globalSharedCarts = {
        ...globalSharedCarts,
        [tableId]: [],
      };
      notifyAll();
      syncWithServer("CLEAR_SHARED_CART", { tableId });
    },

    registerParticipant: (tableId: string, participant: TableParticipant) => {
      const current = globalTableParticipants[tableId] || [];
      const exists = current.find((p) => p.id === participant.id);
      if (!exists) {
        const isFirst = current.length === 0;
        const newPart = { ...participant, isHost: isFirst || participant.isHost };
        globalTableParticipants = {
          ...globalTableParticipants,
          [tableId]: [...current, newPart],
        };
        notifyAll();
        syncWithServer("REGISTER_PARTICIPANT", { tableId, participant: newPart });
        return newPart;
      }
      syncWithServer("REGISTER_PARTICIPANT", { tableId, participant });
      return exists;
    },

    transferHostRole: (tableId: string, targetParticipantId: string) => {
      const current = globalTableParticipants[tableId] || [];
      globalTableParticipants = {
        ...globalTableParticipants,
        [tableId]: current.map((p) => ({
          ...p,
          isHost: p.id === targetParticipantId,
        })),
      };
      notifyAll();
      syncWithServer("TRANSFER_HOST_ROLE", { tableId, targetParticipantId });
    },

    updateParticipantName: (tableId: string, participantId: string, newName: string) => {
      const current = globalTableParticipants[tableId] || [];
      globalTableParticipants = {
        ...globalTableParticipants,
        [tableId]: current.map((p) =>
          p.id === participantId ? { ...p, name: newName.trim() || p.name } : p
        ),
      };
      notifyAll();
      syncWithServer("UPDATE_PARTICIPANT_NAME", { tableId, participantId, newName });
    },

    // Priority 0: Recipe & Raw Ingredient Stock Management
    ingredients: globalIngredients,
    wasteLogs: globalWasteLogs,
    happyHourRules: globalHappyHourRules,

    addIngredient: (ingredient: Ingredient) => {
      globalIngredients = [ingredient, ...globalIngredients];
      notifyAll();
    },

    updateIngredientCost: (ingredientId: string, newUnitCost: number) => {
      const validCost = Math.max(0, newUnitCost);
      globalIngredients = globalIngredients.map((ing) =>
        ing.id === ingredientId ? { ...ing, unitCost: validCost } : ing
      );

      // Auto-recalculate costPrice and margin for all recipes using this ingredient
      globalMenuItems = globalMenuItems.map((item) => {
        if (!item.recipe || item.recipe.length === 0) return item;
        const totalCost = item.recipe.reduce((sum, r) => {
          const ing = globalIngredients.find((i) => i.id === r.ingredientId);
          return sum + (ing ? ing.unitCost * r.quantity : 0);
        }, 0);
        return {
          ...item,
          costPrice: Math.round(totalCost * 100) / 100,
        };
      });
      notifyAll();
    },

    updateIngredient: (ingredientId: string, updates: Partial<Ingredient>) => {
      globalIngredients = globalIngredients.map((ing) =>
        ing.id === ingredientId ? { ...ing, ...updates } : ing
      );

      if (updates.unitCost !== undefined) {
        globalMenuItems = globalMenuItems.map((item) => {
          if (!item.recipe || item.recipe.length === 0) return item;
          const totalCost = item.recipe.reduce((sum, r) => {
            const ing = globalIngredients.find((i) => i.id === r.ingredientId);
            return sum + (ing ? ing.unitCost * r.quantity : 0);
          }, 0);
          return {
            ...item,
            costPrice: Math.round(totalCost * 100) / 100,
          };
        });
      }
      notifyAll();
    },

    deleteIngredient: (ingredientId: string) => {
      globalIngredients = globalIngredients.filter((ing) => ing.id !== ingredientId);
      notifyAll();
    },

    updateIngredientStock: (ingredientId: string, newStock: number) => {
      globalIngredients = globalIngredients.map((ing) =>
        ing.id === ingredientId
          ? {
              ...ing,
              currentStock: Math.max(0, newStock),
              lastRestockedAt: new Date().toISOString().split("T")[0],
            }
          : ing
      );
      notifyAll();
    },

    saveRecipe: (itemId: string, recipe: RecipeItem[]) => {
      const totalCost = recipe.reduce((sum, r) => {
        const ing = globalIngredients.find((i) => i.id === r.ingredientId);
        return sum + (ing ? ing.unitCost * r.quantity : 0);
      }, 0);

      globalMenuItems = globalMenuItems.map((m) =>
        m.id === itemId
          ? {
              ...m,
              recipe,
              costPrice: Math.round(totalCost * 100) / 100,
            }
          : m
      );
      notifyAll();
    },

    logWaste: (waste: WasteLog) => {
      globalWasteLogs = [waste, ...globalWasteLogs];
      // Automatically deduct from raw ingredient stock
      globalIngredients = globalIngredients.map((ing) =>
        ing.id === waste.ingredientId
          ? { ...ing, currentStock: Math.max(0, ing.currentStock - waste.quantity) }
          : ing
      );
      notifyAll();
    },

    toggleHappyHourRule: (ruleId: string) => {
      globalHappyHourRules = globalHappyHourRules.map((r) =>
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      );
      notifyAll();
    },

    saveHappyHourRule: (rule: HappyHourRule) => {
      const exists = globalHappyHourRules.find((r) => r.id === rule.id);
      if (exists) {
        globalHappyHourRules = globalHappyHourRules.map((r) => (r.id === rule.id ? rule : r));
      } else {
        globalHappyHourRules = [rule, ...globalHappyHourRules];
      }
      notifyAll();
    },

    // Delivery Aggregator Platform Actions (Getir, Yemeksepeti, Trendyol, Migros)
    deliveryPlatforms: globalDeliveryPlatforms,
    deliveryOrders: globalDeliveryOrders,
    efaturaRecords: globalEFaturaRecords,
    tableTransfers: globalTableTransfers,

    toggleDeliveryPlatform: (platform: DeliveryPlatform) => {
      globalDeliveryPlatforms = globalDeliveryPlatforms.map((p) =>
        p.platform === platform ? { ...p, isOpen: !p.isOpen } : p
      );
      notifyAll();
    },

    updateDeliveryOrderStatus: (orderId: string, status: DeliveryOrder["status"]) => {
      globalDeliveryOrders = globalDeliveryOrders.map((ord) =>
        ord.id === orderId ? { ...ord, status } : ord
      );
      notifyAll();
    },

    issueEFatura: (record: EFaturaRecord) => {
      globalEFaturaRecords = [record, ...globalEFaturaRecords];
      notifyAll();
    },

    // Staff & Permission Management Actions (RBAC)
    staffMembers: globalStaffMembers,
    rolePermissions: globalRolePermissions,
    bossSecurity: globalBossSecurity,

    updateBossSecurity: (settings: Partial<BossSecuritySettings>) => {
      globalBossSecurity = { ...globalBossSecurity, ...settings };
      notifyAll();
    },

    updateRolePermissions: (role: StaffRole, permissions: Partial<StaffPermissions>) => {
      globalRolePermissions = {
        ...globalRolePermissions,
        [role]: { ...globalRolePermissions[role], ...permissions },
      };
      notifyAll();
    },

    addStaffMember: (staff: StaffMember) => {
      globalStaffMembers = [...globalStaffMembers, staff];
      notifyAll();
    },

    updateStaffMember: (staffId: string, updates: Partial<StaffMember>) => {
      globalStaffMembers = globalStaffMembers.map((s) =>
        s.id === staffId ? { ...s, ...updates } : s
      );
      notifyAll();
    },

    deleteStaffMember: (staffId: string) => {
      globalStaffMembers = globalStaffMembers.filter((s) => s.id !== staffId);
      notifyAll();
    },

    restoreDemoStaff: () => {
      globalStaffMembers = [...DEMO_STAFF_MEMBERS];
      notifyAll();
    },
  };
}
