import { NextResponse } from "next/server";
import { repo } from "@/modules/store";

export const dynamic = "force-dynamic";
export async function GET() {
  const list = repo.list().map((c) => {
    const r = c.results as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    return { id: c.id, subject: c.email.subject, status: c.status, mode: c.mode, category: r.classification?.primary ?? null, risk: r.compliance?.overallRisk ?? null, receivedAt: c.email.receivedAt };
  });
  return NextResponse.json({ cases: list });
}
export async function DELETE() { repo.clear(); return NextResponse.json({ ok: true }); }
