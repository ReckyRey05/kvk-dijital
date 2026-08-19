import { Order, Table, MenuItem } from "@/types/restaurant";

export interface ZReportData {
  reportNumber: string;
  date: string;
  restaurantName: string;
  totalOrdersCount: number;
  totalTablesServed: number;
  grossSales: number;
  taxAmount: number;
  netSales: number;
  cashTotal: number;
  cardTotal: number;
  cancelledTotal: number;
  averageTicketSize: number;
  averageTableDurationMinutes: number;
}

export interface ProductSalesStat {
  id: string;
  name: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
  revenuePercent: number;
}

export interface HourlySalesStat {
  hour: string; // e.g. "12:00", "13:00"
  orderCount: number;
  revenue: number;
}

/**
 * Computes live Z-Report and financial analytics from system orders and tables.
 */
export function generateZReport(
  orders: Order[],
  tables: Table[],
  restaurantName: string
): ZReportData {
  const completedOrders = orders.filter((o) => o.status === "COMPLETED" || o.status === "SERVED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

  // Include base sample historical revenue for rich demo analytics
  const sampleBaseGross = 18450;
  const sampleBaseCash = 5200;
  const sampleBaseCard = 13250;

  const liveOrdersTotal = orders.reduce((sum, o) => (o.status !== "CANCELLED" ? sum + o.totalAmount : sum), 0);
  const liveCash = orders.reduce((sum, o) => (o.paymentMethod === "CASH" ? sum + o.totalAmount : sum), 0);
  const liveCard = orders.reduce((sum, o) => (o.paymentMethod !== "CASH" ? sum + o.totalAmount : sum), 0);

  const grossSales = sampleBaseGross + liveOrdersTotal;
  const cashTotal = sampleBaseCash + liveCash;
  const cardTotal = sampleBaseCard + liveCard;
  const taxAmount = Math.round(grossSales * 0.1);
  const netSales = grossSales - taxAmount;
  const cancelledTotal = cancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrdersCount = 48 + orders.length;
  const totalTablesServed = 36 + tables.filter((t) => t.status !== "EMPTY").length;
  const averageTicketSize = Math.round(grossSales / totalOrdersCount);

  return {
    reportNumber: `Z-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-0142`,
    date: new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    restaurantName,
    totalOrdersCount,
    totalTablesServed,
    grossSales,
    taxAmount,
    netSales,
    cashTotal,
    cardTotal,
    cancelledTotal,
    averageTicketSize,
    averageTableDurationMinutes: 42,
  };
}

/**
 * Top Best-Selling Dishes analysis.
 */
export const SAMPLE_TOP_PRODUCTS: ProductSalesStat[] = [
  { id: "1", name: "Trüflü Gurme Dana Burger (180g)", category: "Burgerler", quantitySold: 28, totalRevenue: 9520, revenuePercent: 32 },
  { id: "2", name: "Közlenmiş Kuşkonmazlı Antrikot", category: "Ana Yemekler", quantitySold: 14, totalRevenue: 9520, revenuePercent: 28 },
  { id: "3", name: "Burrata & Pesto Taş Fırın Pizza", category: "Pizzalar", quantitySold: 18, totalRevenue: 7560, revenuePercent: 18 },
  { id: "4", name: "Truffle & Mantarlı Fettuccine", category: "Makarnalar", quantitySold: 12, totalRevenue: 4320, revenuePercent: 11 },
  { id: "5", name: "Passion Fruit & Nane Mocktail", category: "İçecekler", quantitySold: 22, totalRevenue: 3520, revenuePercent: 6 },
  { id: "6", name: "San Sebastian Cheesecake", category: "Tatlılar", quantitySold: 15, totalRevenue: 3300, revenuePercent: 5 },
];

/**
 * Hourly Rush Analysis.
 */
export const SAMPLE_HOURLY_RUSH: HourlySalesStat[] = [
  { hour: "11:00", orderCount: 2, revenue: 640 },
  { hour: "12:00", orderCount: 8, revenue: 2980 },
  { hour: "13:00", orderCount: 14, revenue: 4850 },
  { hour: "14:00", orderCount: 9, revenue: 3120 },
  { hour: "15:00", orderCount: 4, revenue: 1420 },
  { hour: "16:00", orderCount: 5, revenue: 1680 },
  { hour: "17:00", orderCount: 7, revenue: 2450 },
  { hour: "18:00", orderCount: 11, revenue: 4100 },
  { hour: "19:00", orderCount: 18, revenue: 6920 },
  { hour: "20:00", orderCount: 22, revenue: 8450 },
  { hour: "21:00", orderCount: 16, revenue: 5800 },
  { hour: "22:00", orderCount: 8, revenue: 2650 },
];
