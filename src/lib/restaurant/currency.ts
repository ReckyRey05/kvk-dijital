import { MenuCurrency } from "@/types/restaurant";

export const CURRENCY_RATES: Record<MenuCurrency, { rate: number; symbol: string; prefix: boolean }> = {
  TRY: { rate: 1.0, symbol: "TL", prefix: false },
  USD: { rate: 1 / 35.2, symbol: "$", prefix: true },
  EUR: { rate: 1 / 38.5, symbol: "€", prefix: true },
  GBP: { rate: 1 / 45.0, symbol: "£", prefix: true },
};

export function formatPrice(priceInTRY: number, currency: MenuCurrency = "TRY"): string {
  const conf = CURRENCY_RATES[currency] || CURRENCY_RATES.TRY;
  const converted = priceInTRY * conf.rate;

  if (currency === "TRY") {
    return `${Math.round(converted).toLocaleString("tr-TR")} TL`;
  }

  const formatted = converted.toFixed(2);
  return conf.prefix ? `${conf.symbol}${formatted}` : `${formatted} ${conf.symbol}`;
}
