import { NextResponse } from "next/server";
import {
  Order,
  Table,
  WaiterCall,
  MenuItem,
  Category,
  ManagerAlert,
  CustomerVoucher,
  SongRequest,
  TableParticipant,
  OrderItem,
  TableGroupSettings,
} from "@/types/restaurant";
import {
  DEMO_RESTAURANT,
  DEMO_TABLES,
  DEMO_MENU_ITEMS,
  DEMO_CATEGORIES,
} from "@/lib/restaurant/mockData";
import { parseJsonWithByteLimit } from "@/lib/security/rateLimit";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";
import { getAdminDb } from "@/lib/firebase/admin";

interface LiveRestaurantState {
  version: number;
  lastUpdated: number;
  orders: Order[];
  tables: Table[];
  waiterCalls: WaiterCall[];
  managerAlerts: ManagerAlert[];
  vouchers: CustomerVoucher[];
  songs: SongRequest[];
  menuItems: MenuItem[];
  categories: Category[];
  tableTransfers: Record<string, { toTableId: string; toTableNumber: string; timestamp: number }>;
  tableParticipants: Record<string, TableParticipant[]>;
  sharedCarts: Record<string, OrderItem[]>;
  tableGroupSettings: Record<string, TableGroupSettings>;
}

const INITIAL_SERVER_STATE: LiveRestaurantState = {
  version: 1,
  lastUpdated: Date.now(),
  orders: [
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
          basePrice: 360,
          finalPrice: 360,
          quantity: 2,
        },
      ],
      subtotal: 720,
      taxAmount: 72,
      serviceCharge: 0,
      totalAmount: 792,
      paymentStatus: "PENDING",
      paymentMethod: "CREDIT_CARD",
      createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  ],
  tables: [...DEMO_TABLES],
  waiterCalls: [],
  managerAlerts: [],
  vouchers: [],
  songs: [],
  menuItems: [...DEMO_MENU_ITEMS],
  categories: [...DEMO_CATEGORIES],
  tableTransfers: {},
  tableParticipants: {},
  sharedCarts: {},
  tableGroupSettings: {},
};

// Global fallback memory state (for local dev / server instances)
const globalForRestaurant = globalThis as unknown as {
  _restaurantLiveState?: LiveRestaurantState;
};

if (!globalForRestaurant._restaurantLiveState) {
  globalForRestaurant._restaurantLiveState = { ...INITIAL_SERVER_STATE };
}

async function getLiveState(): Promise<LiveRestaurantState> {
  try {
    const db = getAdminDb();
    const snap = await db.doc("restaurants/rest_aura_bistro/liveSync/state").get();
    if (snap.exists) {
      const data = snap.data() as LiveRestaurantState;
      if (data && data.orders) {
        globalForRestaurant._restaurantLiveState = {
          ...data,
          tableParticipants: data.tableParticipants || {},
          sharedCarts: data.sharedCarts || {},
          tableGroupSettings: data.tableGroupSettings || {},
        };
        return globalForRestaurant._restaurantLiveState;
      }
    }
  } catch {
    // Admin SDK missing or offline -> use in-memory global
  }
  return globalForRestaurant._restaurantLiveState || INITIAL_SERVER_STATE;
}

async function saveLiveState(state: LiveRestaurantState): Promise<void> {
  globalForRestaurant._restaurantLiveState = state;
  try {
    const db = getAdminDb();
    await db.doc("restaurants/rest_aura_bistro/liveSync/state").set(state, { merge: true });
  } catch {
    // Admin SDK missing or offline -> in-memory preserved
  }
}

export async function GET() {
  try {
    const state = await getLiveState();

    return NextResponse.json(
      {
        success: true,
        version: state.version,
        lastUpdated: state.lastUpdated,
        orders: state.orders,
        tables: state.tables,
        waiterCalls: state.waiterCalls,
        managerAlerts: state.managerAlerts,
        vouchers: state.vouchers,
        songs: state.songs,
        menuItems: state.menuItems,
        tableTransfers: state.tableTransfers || {},
        tableParticipants: state.tableParticipants || {},
        sharedCarts: state.sharedCarts || {},
        tableGroupSettings: state.tableGroupSettings || {},
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantSyncGET", error);
  }
}

export async function POST(req: Request) {
  try {
    const parseResult = await parseJsonWithByteLimit(req, 2 * 1024 * 1024);
    if (!parseResult.ok) return parseResult.errorResponse;

    const body = parseResult.data || {};
    const { action, payload } = body;

    const state = await getLiveState();
    state.version = (state.version || 0) + 1;
    state.lastUpdated = Date.now();

    state.tableParticipants = state.tableParticipants || {};
    state.sharedCarts = state.sharedCarts || {};
    state.tableGroupSettings = state.tableGroupSettings || {};

    switch (action) {
      case "CONFIGURE_GROUP_DINING": {
        const { tableId, allowGroup } = payload || {};
        if (tableId) {
          state.tableGroupSettings[tableId] = {
            allowGroup: Boolean(allowGroup),
            configured: true,
          };
        }
        break;
      }

      case "REGISTER_PARTICIPANT": {
        const { tableId, participant } = payload || {};
        if (tableId && participant) {
          const currentList = state.tableParticipants[tableId] || [];
          const exists = currentList.find((p) => p.id === participant.id);
          const groupSettings = state.tableGroupSettings[tableId];

          if (!exists) {
            const isFirst = currentList.length === 0;
            const isGroupBlocked = groupSettings?.configured && !groupSettings.allowGroup;

            const newP: TableParticipant = {
              ...participant,
              isHost: isFirst || participant.isHost,
              status: isFirst ? "APPROVED" : isGroupBlocked ? "REJECTED" : "PENDING_APPROVAL",
            };
            state.tableParticipants[tableId] = [...currentList, newP];
          } else {
            state.tableParticipants[tableId] = currentList.map((p) =>
              p.id === participant.id ? { ...p, ...participant, status: p.status || participant.status || "APPROVED" } : p
            );
          }
        }
        break;
      }

      case "APPROVE_PARTICIPANT": {
        const { tableId, participantId, approved } = payload || {};
        if (tableId && participantId && state.tableParticipants[tableId]) {
          state.tableParticipants[tableId] = state.tableParticipants[tableId].map((p) =>
            p.id === participantId
              ? { ...p, status: approved ? "APPROVED" : "REJECTED" }
              : p
          );
        }
        break;
      }

      case "CREATE_ORDER": {
        const newOrder: Order = payload?.order;
        if (newOrder) {
          const existingIdx = state.orders.findIndex((o) => o.id === newOrder.id);
          if (existingIdx >= 0) {
            state.orders[existingIdx] = newOrder;
          } else {
            state.orders = [newOrder, ...state.orders];
          }

          state.tables = state.tables.map((t) =>
            t.id === newOrder.tableId
              ? {
                  ...t,
                  status: t.status === "EMPTY" ? "OCCUPIED" : t.status,
                  activeOrderId: newOrder.id,
                  activeBillTotal: (t.activeBillTotal || 0) + newOrder.totalAmount,
                  lastOrderTime: "Az önce",
                }
              : t
          );
        }
        break;
      }

      case "CONFIRM_ORDER": {
        const { orderId } = payload || {};
        state.orders = state.orders.map((ord) =>
          ord.id === orderId
            ? { ...ord, status: "PREPARING", confirmedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : ord
        );
        break;
      }

      case "UPDATE_ORDER_STATUS": {
        const { orderId, status } = payload || {};
        state.orders = state.orders.map((ord) =>
          ord.id === orderId
            ? {
                ...ord,
                status,
                readyAt: status === "READY" ? new Date().toISOString() : ord.readyAt,
                servedAt: status === "SERVED" ? new Date().toISOString() : ord.servedAt,
                updatedAt: new Date().toISOString(),
              }
            : ord
        );
        break;
      }

      case "UPDATE_PARTICIPANT_NAME": {
        const { tableId, participantId, newName } = payload || {};
        if (tableId && participantId && state.tableParticipants[tableId]) {
          state.tableParticipants[tableId] = state.tableParticipants[tableId].map((p) =>
            p.id === participantId ? { ...p, name: (newName || p.name).trim() } : p
          );
        }
        break;
      }

      case "TRANSFER_HOST_ROLE": {
        const { tableId, targetParticipantId } = payload || {};
        if (tableId && targetParticipantId && state.tableParticipants[tableId]) {
          state.tableParticipants[tableId] = state.tableParticipants[tableId].map((p) => ({
            ...p,
            isHost: p.id === targetParticipantId,
          }));
        }
        break;
      }

      case "ADD_TO_SHARED_CART": {
        const { tableId, item } = payload || {};
        if (tableId && item) {
          const currentCart = state.sharedCarts[tableId] || [];
          state.sharedCarts[tableId] = [...currentCart, item];
        }
        break;
      }

      case "UPDATE_SHARED_CART_QTY": {
        const { tableId, index, newQty } = payload || {};
        if (tableId && state.sharedCarts[tableId]) {
          state.sharedCarts[tableId] = state.sharedCarts[tableId].map((it, idx) =>
            idx === index ? { ...it, quantity: newQty } : it
          );
        }
        break;
      }

      case "REMOVE_FROM_SHARED_CART": {
        const { tableId, index } = payload || {};
        if (tableId && state.sharedCarts[tableId]) {
          state.sharedCarts[tableId] = state.sharedCarts[tableId].filter((_, idx) => idx !== index);
        }
        break;
      }

      case "CLEAR_SHARED_CART": {
        const { tableId } = payload || {};
        if (tableId) {
          state.sharedCarts[tableId] = [];
        }
        break;
      }

      case "CALL_WAITER": {
        const newCall: WaiterCall = payload?.call;
        if (newCall) {
          state.waiterCalls = [newCall, ...state.waiterCalls.filter((c) => c.tableId !== newCall.tableId || c.status !== "ACTIVE")];
          state.tables = state.tables.map((t) =>
            t.id === newCall.tableId
              ? {
                  ...t,
                  status: newCall.type.startsWith("BILL") ? "BILL_REQUESTED" : "WAITER_CALLED",
                  lastCallType: newCall.type,
                  lastCallTime: "Az önce",
                }
              : t
          );
        }
        break;
      }

      case "RESOLVE_CALL": {
        const { callId } = payload || {};
        const call = state.waiterCalls.find((c) => c.id === callId);
        state.waiterCalls = state.waiterCalls.map((c) =>
          c.id === callId ? { ...c, status: "RESOLVED", resolvedAt: new Date().toISOString() } : c
        );
        if (call) {
          state.tables = state.tables.map((t) =>
            t.id === call.tableId
              ? { ...t, status: t.activeBillTotal > 0 ? "OCCUPIED" : "EMPTY" }
              : t
          );
        }
        break;
      }

      case "CLOSE_TABLE_BILL": {
        const { tableId } = payload || {};
        state.orders = state.orders.map((ord) =>
          ord.tableId === tableId && ord.status !== "CANCELLED"
            ? { ...ord, status: "COMPLETED", paymentStatus: "PAID_CASHIER", completedAt: new Date().toISOString() }
            : ord
        );
        state.tables = state.tables.map((t) =>
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
        state.waiterCalls = state.waiterCalls.map((c) =>
          c.tableId === tableId ? { ...c, status: "RESOLVED", resolvedAt: new Date().toISOString() } : c
        );
        if (state.tableTransfers) {
          delete state.tableTransfers[tableId];
        }
        state.sharedCarts[tableId] = [];
        delete state.tableParticipants[tableId];
        delete state.tableGroupSettings[tableId];
        break;
      }

      case "TRANSFER_TABLE": {
        const { fromTableId, toTableId } = payload || {};
        const fromTable = state.tables.find((t) => t.id === fromTableId);
        const toTable = state.tables.find((t) => t.id === toTableId);
        if (fromTable && toTable) {
          state.orders = state.orders.map((ord) =>
            ord.tableId === fromTableId && ord.status !== "COMPLETED" && ord.status !== "CANCELLED"
              ? { ...ord, tableId: toTableId, tableNumber: toTable.tableNumber }
              : ord
          );
          state.waiterCalls = state.waiterCalls.map((c) =>
            c.tableId === fromTableId && c.status === "ACTIVE"
              ? { ...c, tableId: toTableId, tableNumber: toTable.tableNumber }
              : c
          );
          state.tableTransfers = state.tableTransfers || {};
          state.tableTransfers[fromTableId] = {
            toTableId,
            toTableNumber: toTable.tableNumber,
            timestamp: Date.now(),
          };

          if (state.tableParticipants[fromTableId]) {
            state.tableParticipants[toTableId] = [
              ...(state.tableParticipants[toTableId] || []),
              ...state.tableParticipants[fromTableId],
            ];
            delete state.tableParticipants[fromTableId];
          }

          if (state.sharedCarts[fromTableId]) {
            state.sharedCarts[toTableId] = [
              ...(state.sharedCarts[toTableId] || []),
              ...state.sharedCarts[fromTableId],
            ];
            delete state.sharedCarts[fromTableId];
          }

          if (state.tableGroupSettings[fromTableId]) {
            state.tableGroupSettings[toTableId] = state.tableGroupSettings[fromTableId];
            delete state.tableGroupSettings[fromTableId];
          }

          state.tables = state.tables.map((t) => {
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
        }
        break;
      }

      default:
        break;
    }

    await saveLiveState(state);

    return NextResponse.json(
      {
        success: true,
        version: state.version,
        lastUpdated: state.lastUpdated,
        orders: state.orders,
        tables: state.tables,
        waiterCalls: state.waiterCalls,
        managerAlerts: state.managerAlerts,
        tableParticipants: state.tableParticipants,
        sharedCarts: state.sharedCarts,
        tableGroupSettings: state.tableGroupSettings,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantSyncPOST", error);
  }
}
