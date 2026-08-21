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
} from "@/types/restaurant";
import {
  DEMO_RESTAURANT,
  DEMO_TABLES,
  DEMO_MENU_ITEMS,
  DEMO_CATEGORIES,
} from "@/lib/restaurant/mockData";
import { parseJsonWithByteLimit } from "@/lib/security/rateLimit";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

// Server-Authoritative Live State across all physical devices & clients
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
};

// Global singleton state in Node.js server instance
let serverState: LiveRestaurantState = { ...INITIAL_SERVER_STATE };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientVersion = parseInt(searchParams.get("version") || "0", 10);

    // If client is already up to date, return 304 or light payload
    if (clientVersion === serverState.version) {
      return NextResponse.json({
        upToDate: true,
        version: serverState.version,
      });
    }

    return NextResponse.json({
      upToDate: false,
      version: serverState.version,
      lastUpdated: serverState.lastUpdated,
      orders: serverState.orders,
      tables: serverState.tables,
      waiterCalls: serverState.waiterCalls,
      managerAlerts: serverState.managerAlerts,
      vouchers: serverState.vouchers,
      songs: serverState.songs,
      menuItems: serverState.menuItems,
      tableTransfers: serverState.tableTransfers,
    });
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

    serverState.version += 1;
    serverState.lastUpdated = Date.now();

    switch (action) {
      case "CREATE_ORDER": {
        const newOrder: Order = payload.order;
        if (newOrder) {
          // Check if already exists to prevent duplicates
          const existingIdx = serverState.orders.findIndex((o) => o.id === newOrder.id);
          if (existingIdx >= 0) {
            serverState.orders[existingIdx] = newOrder;
          } else {
            serverState.orders = [newOrder, ...serverState.orders];
          }

          // Update table status
          serverState.tables = serverState.tables.map((t) =>
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
        const { orderId } = payload;
        serverState.orders = serverState.orders.map((ord) =>
          ord.id === orderId
            ? { ...ord, status: "PREPARING", updatedAt: new Date().toISOString() }
            : ord
        );
        break;
      }

      case "UPDATE_ORDER_STATUS": {
        const { orderId, status } = payload;
        serverState.orders = serverState.orders.map((ord) =>
          ord.id === orderId
            ? { ...ord, status, updatedAt: new Date().toISOString() }
            : ord
        );
        break;
      }

      case "CALL_WAITER": {
        const newCall: WaiterCall = payload.call;
        if (newCall) {
          serverState.waiterCalls = [newCall, ...serverState.waiterCalls];
          serverState.tables = serverState.tables.map((t) =>
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
        const { callId } = payload;
        const call = serverState.waiterCalls.find((c) => c.id === callId);
        serverState.waiterCalls = serverState.waiterCalls.map((c) =>
          c.id === callId ? { ...c, status: "RESOLVED", resolvedAt: new Date().toISOString() } : c
        );
        if (call) {
          serverState.tables = serverState.tables.map((t) =>
            t.id === call.tableId
              ? { ...t, status: t.activeBillTotal > 0 ? "OCCUPIED" : "EMPTY" }
              : t
          );
        }
        break;
      }

      case "CLOSE_TABLE_BILL": {
        const { tableId } = payload;
        serverState.orders = serverState.orders.map((ord) =>
          ord.tableId === tableId && ord.status !== "CANCELLED"
            ? { ...ord, status: "COMPLETED", paymentStatus: "PAID_CASHIER", completedAt: new Date().toISOString() }
            : ord
        );
        serverState.tables = serverState.tables.map((t) =>
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
        serverState.waiterCalls = serverState.waiterCalls.map((c) =>
          c.tableId === tableId ? { ...c, status: "RESOLVED", resolvedAt: new Date().toISOString() } : c
        );
        delete serverState.tableTransfers[tableId];
        break;
      }

      case "TRANSFER_TABLE": {
        const { fromTableId, toTableId } = payload;
        const fromTable = serverState.tables.find((t) => t.id === fromTableId);
        const toTable = serverState.tables.find((t) => t.id === toTableId);
        if (fromTable && toTable) {
          serverState.orders = serverState.orders.map((ord) =>
            ord.tableId === fromTableId && ord.status !== "COMPLETED" && ord.status !== "CANCELLED"
              ? { ...ord, tableId: toTableId, tableNumber: toTable.tableNumber }
              : ord
          );
          serverState.waiterCalls = serverState.waiterCalls.map((c) =>
            c.tableId === fromTableId && c.status === "ACTIVE"
              ? { ...c, tableId: toTableId, tableNumber: toTable.tableNumber }
              : c
          );
          serverState.tableTransfers[fromTableId] = {
            toTableId,
            toTableNumber: toTable.tableNumber,
            timestamp: Date.now(),
          };
          serverState.tables = serverState.tables.map((t) => {
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

      case "RESET_DEMO": {
        serverState = { ...INITIAL_SERVER_STATE, version: serverState.version + 1, lastUpdated: Date.now() };
        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      success: true,
      version: serverState.version,
      lastUpdated: serverState.lastUpdated,
      orders: serverState.orders,
      tables: serverState.tables,
      waiterCalls: serverState.waiterCalls,
      managerAlerts: serverState.managerAlerts,
    });
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantSyncPOST", error);
  }
}
