import { NextRequest, NextResponse } from "next/server";
import { EmailSchema, rateLimited, sseResponse } from "@/lib/server-utils";
import { repo } from "@/modules/store";
import type { CaseRecord } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests; please wait a minute." }, { status: 429 });
  const parsed = EmailSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join("; ") }, { status: 400 });
  const now = new Date().toISOString();
  const c: CaseRecord = {
    id: repo.nextId(), status: "New", mode: "demo", createdAt: now, updatedAt: now,
    email: { ...parsed.data, attachmentName: parsed.data.attachmentName || undefined, receivedAt: now },
    events: [], results: {}, drafts: [], statusHistory: [{ status: "New", at: now }],
  };
  repo.save(c);
  return sseResponse(c.id, req.signal);
}
