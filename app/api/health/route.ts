import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/db";

// Liveness for the Docker healthcheck. Always 200 while the process serves requests:
// public pages fall back to the static seed when the database is down (Phase 4), so a
// database outage must not mark the app unhealthy and trigger restarts.
export async function GET() {
  const dbUp = await pingDatabase();
  return NextResponse.json(
    { status: "ok", db: dbUp ? "ok" : "down" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
