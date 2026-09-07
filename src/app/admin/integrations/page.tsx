"use client";

import React, { Suspense } from "react";
import IntegrationLogsViewer from "@/components/teklifimGelsin/IntegrationLogsViewer";

export default function AdminIntegrationsPage() {
  return (
    <div className="space-y-6">
      <Suspense
        fallback={
          <div className="py-20 text-center text-xs text-slate-500">
            Entegrasyon loglari yukleniyor...
          </div>
        }
      >
        <IntegrationLogsViewer />
      </Suspense>
    </div>
  );
}
