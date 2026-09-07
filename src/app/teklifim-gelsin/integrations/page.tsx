"use client";

import React, { Suspense } from "react";
import IntegrationsSettingsPanel from "@/components/teklifimGelsin/IntegrationsSettingsPanel";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <Suspense
          fallback={
            <div className="py-20 text-center text-xs text-slate-500">
              Entegrasyon paneli yukleniyor...
            </div>
          }
        >
          <IntegrationsSettingsPanel />
        </Suspense>
      </div>
    </div>
  );
}
