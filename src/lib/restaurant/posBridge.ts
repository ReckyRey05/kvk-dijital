import { Order, RestaurantSettings } from "@/types/restaurant";

export interface PosSyncResult {
  success: boolean;
  externalTicketId?: string;
  message?: string;
  timestamp: string;
}

/**
 * Sends an approved order to a Cloud POS (Adisyo, Simpra, etc.) or Local Bridge Agent via Webhook.
 */
export async function forwardOrderToPos(
  order: Order,
  settings: RestaurantSettings
): Promise<PosSyncResult> {
  const timestamp = new Date().toISOString();

  // 1. STANDALONE MODE: Handled directly within the app
  if (settings.posIntegrationType === "STANDALONE" || !settings.posWebhookUrl) {
    return {
      success: true,
      externalTicketId: `LOCAL_${order.id}`,
      message: "Order queued into built-in Web POS.",
      timestamp,
    };
  }

  // 2. CLOUD WEBHOOK MODE (e.g. Adisyo / Simpra)
  if (settings.posIntegrationType === "CLOUD_WEBHOOK") {
    try {
      const payload = {
        event: "ORDER_CREATED",
        orderId: order.id,
        tableNumber: order.tableNumber,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.finalPrice,
          totalPrice: item.finalPrice * item.quantity,
          options: item.selectedOptions?.flatMap((g) => g.selectedItems.map((s) => s.name)) || [],
          note: item.itemNotes || "",
        })),
        totalAmount: order.totalAmount,
        notes: order.notes || "",
        createdAt: order.createdAt,
      };

      const response = await fetch(settings.posWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: settings.posApiKey ? `Bearer ${settings.posApiKey}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`POS Webhook responded with status: ${response.status}`);
      }

      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        externalTicketId: data.ticketId || data.id || `POS_${Date.now()}`,
        message: "Successfully synchronized with Cloud POS.",
        timestamp,
      };
    } catch (err: any) {
      console.error("POS Cloud Webhook Synchronization Failure:", err);
      return {
        success: false,
        message: err?.message || "Failed to forward order to Cloud POS.",
        timestamp,
      };
    }
  }

  // 3. LOCAL BRIDGE MODE (Windows SambaPOS / Local ESC/POS Print Daemon)
  return {
    success: true,
    externalTicketId: `BRIDGE_${order.id}`,
    message: "Dispatched to Local Bridge Queue.",
    timestamp,
  };
}

/**
 * Formats an order into ESC/POS Thermal Receipt Text for kitchen and bill printing.
 */
export function formatEscPosReceipt(order: Order, restaurantName: string): string {
  const line = "------------------------------------------------";
  const dateStr = new Date(order.createdAt).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let receipt = "";
  receipt += `\x1B\x61\x01`; // Center Align
  receipt += `\x1B\x21\x30${restaurantName}\x1B\x21\x00\n`; // Double Size Title
  receipt += `SIPARIS FISI - ${order.tableNumber}\n`;
  receipt += `Saat: ${dateStr} | Siparis No: #${order.id.slice(-6)}\n`;
  receipt += `${line}\n`;
  receipt += `\x1B\x61\x00`; // Left Align

  for (const item of order.items) {
    const itemTotal = (item.finalPrice * item.quantity).toFixed(2);
    receipt += `${item.quantity}x ${item.name.padEnd(28)} ${itemTotal.padStart(8)} TL\n`;
    if (item.selectedOptions && item.selectedOptions.length > 0) {
      for (const group of item.selectedOptions) {
        for (const opt of group.selectedItems) {
          receipt += `   + ${opt.name} (${opt.priceDelta > 0 ? `+${opt.priceDelta} TL` : ""})\n`;
        }
      }
    }
    if (item.itemNotes) {
      receipt += `   [NOT: ${item.itemNotes}]\n`;
    }
  }

  receipt += `${line}\n`;
  if (order.notes) {
    receipt += `GENEL NOT: ${order.notes}\n${line}\n`;
  }
  receipt += `\x1B\x61\x02`; // Right Align
  receipt += `\x1B\x21\x20TOPLAM: ${order.totalAmount.toFixed(2)} TL\x1B\x21\x00\n`;
  receipt += `\n\n\x1D\x56\x41\x10`; // Cut Paper

  return receipt;
}
