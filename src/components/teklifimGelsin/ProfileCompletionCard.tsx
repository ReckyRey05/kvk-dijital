"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Edit3, ArrowRight } from "lucide-react";
import { TeklifimProfile } from "@/types/teklifimGelsin";
import { computeProfileCompletion } from "@/lib/teklifimGelsin/teklifimUtils";

interface ProfileCompletionCardProps {
  profile: Partial<TeklifimProfile>;
  onEdit: () => void;
}

export default function ProfileCompletionCard({
  profile,
  onEdit,
}: ProfileCompletionCardProps) {
  const { percentage, missingFields } = computeProfileCompletion(profile);

  if (percentage >= 100) return null;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#0E131F] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Profil Gücü
            </span>
            <span className="px-2 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
              %{percentage} Tamamlandı
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {missingFields.length > 0 ? (
              <>
                <span className="text-slate-400">Eksik Bilgiler: </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {missingFields.slice(0, 3).join(", ")}
                  {missingFields.length > 3 ? ` ve ${missingFields.length - 3} alan daha` : ""}
                </span>
              </>
            ) : (
              "Profiliniz mükemmel doldurulmuş."
            )}
          </p>
        </div>

        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Profili Tamamla</span>
        </button>
      </div>

      {/* PROGRESS TRACK */}
      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
