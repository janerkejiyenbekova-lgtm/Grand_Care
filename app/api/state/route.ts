import { NextResponse } from "next/server";
import { getState, getVersion, PERSISTENT } from "@/lib/server-db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const since = Number(url.searchParams.get("v") || 0);
    const v = await getVersion();
    if (since && since === v) return NextResponse.json({ changed: false, v, persistent: PERSISTENT });
    const state = await getState();
    return NextResponse.json({ changed: true, ...state }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: "state_failed" }, { status: 500 });
  }
}
