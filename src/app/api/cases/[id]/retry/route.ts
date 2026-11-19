import { NextRequest, NextResponse } from "next/server";
import { getCase, sseResponse } from "@/lib/server-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const raw = await req.json().catch(() => null);
  const c = getCase(params.id, raw?.snapshot);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (c.status === "Analysing") return NextResponse.json({ error: "Analysis already running" }, { status: 409 });
  if (c.status.startsWith("Approved")) return NextResponse.json({ error: "Approved cases cannot be re-analysed" }, { status: 409 });
  return sseResponse(c.id, req.signal);
}
