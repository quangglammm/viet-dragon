import { NextResponse } from "next/server";

// Liveness healthcheck. Always 200 while the process serves requests.
export async function GET() {
  return NextResponse.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
