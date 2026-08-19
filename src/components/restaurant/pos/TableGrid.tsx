"use client";

import { Table, WaiterCall } from "@/types/restaurant";
import { Users, Clock, Bell, Receipt, CheckCircle, AlertCircle } from "lucide-react";

interface TableGridProps {
  tables: Table[];
  waiterCalls: WaiterCall[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onResolveCall: (callId: string) => void;
}

export default function TableGrid({
  tables,
  waiterCalls,
  selectedTableId,
  onSelectTable,
  onResolveCall,
}: TableGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {tables.map((table) => {
        const isSelected = selectedTableId === table.id;
        const activeCall = waiterCalls.find(
          (c) => c.tableId === table.id && c.status === "ACTIVE"
        );

        // Status styling
        const isBillReq = table.status === "BILL_REQUESTED" || activeCall?.type.startsWith("BILL");
        const isWaiterCalled = table.status === "WAITER_CALLED" || activeCall?.type === "WAITER";
        const isOccupied = table.status === "OCCUPIED" || table.activeBillTotal > 0;

        let statusBorder = "border-white/10 hover:border-white/20";
        let statusBg = "bg-white/[0.02]";
        let statusBadge = { label: "Boş", color: "bg-white/10 text-foreground/60" };

        if (isBillReq) {
          statusBorder = "border-amber-500/60 ring-2 ring-amber-500/30 animate-pulse";
          statusBg = "bg-amber-500/10";
          statusBadge = { label: "Hesap İstendi", color: "bg-amber-500 text-black font-bold" };
        } else if (isWaiterCalled) {
          statusBorder = "border-purple-500/60 ring-2 ring-purple-500/30 animate-pulse";
          statusBg = "bg-purple-500/10";
          statusBadge = { label: "Garson Çağrısı", color: "bg-purple-500 text-white font-bold" };
        } else if (isOccupied) {
          statusBorder = "border-accent/40 bg-accent/[0.04]";
          statusBg = "bg-accent/5";
          statusBadge = { label: "Dolu Masa", color: "bg-accent/20 text-accent font-bold" };
        }

        return (
          <div
            key={table.id}
            onClick={() => onSelectTable(table.id)}
            className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${statusBorder} ${statusBg} ${
              isSelected ? "ring-2 ring-white scale-[1.02] shadow-2xl" : ""
            }`}
          >
            {/* Top Bar: Table Number & Status Badge */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base tracking-tight">
                    {table.tableNumber}
                  </h3>
                  {table.section && (
                    <span className="text-[10px] text-foreground/50 font-medium">
                      ({table.section})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-foreground/50 mt-0.5">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} Kişilik</span>
                </div>
              </div>

              <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>

            {/* Active Waiter Call Notification Banner */}
            {activeCall && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onResolveCall(activeCall.id);
                }}
                className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-between text-purple-200 text-xs hover:bg-purple-500/30 transition-colors"
                title="Talebi Tamamla"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Bell className="w-3.5 h-3.5 text-purple-400 shrink-0 animate-bounce" />
                  <span className="truncate text-[11px] font-semibold">{activeCall.message}</span>
                </div>
                <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 ml-1" />
              </div>
            )}

            {/* Bottom Row: Bill Total & Last Activity */}
            <div className="pt-2 border-t border-white/5 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-foreground/50 block">Masa Adisyonu</span>
                <span className="text-base font-black text-white">
                  {table.activeBillTotal.toLocaleString("tr-TR")}{" "}
                  <span className="text-xs text-accent font-semibold">TL</span>
                </span>
              </div>

              {table.lastOrderTime && (
                <div className="text-[10px] text-foreground/50 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-accent" />
                  <span>{table.lastOrderTime}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
