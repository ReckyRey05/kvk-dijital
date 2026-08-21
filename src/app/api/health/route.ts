import { NextResponse } from "next/server";
import { performSystemHealthCheck } from "@/lib/observability/healthCheck";

export async function GET() {
  const health = await performSystemHealthCheck();
  const statusCode = health.status === "HEALTHY" ? 200 : health.status === "DEGRADED" ? 200 : 503;

  return NextResponse.json(health, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
