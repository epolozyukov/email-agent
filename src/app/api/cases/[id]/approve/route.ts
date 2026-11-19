import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/modules/store";
import { integrations } from "@/modules/integration-adapters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const c = repo.get(params.id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (c.approval) return NextResponse.json({ approval: c.approval, status: c.status, idempotent: true });
  if (!["Analysed", "Awaiting Information"].includes(c.status)) return NextResponse.json({ error: `Case in status "${c.status}" cannot be approved` }, { status: 409 });
  const draft = c.drafts[c.drafts.length - 1];
  if (!draft || !draft.body.trim()) return NextResponse.json({ error: "A non-empty draft is required before approval" }, { status: 400 });
  const sent = integrations.email.simulateSend(draft); // simulated only, never a real send
  c.approval = { approvedBy: "demo.user@business.com", approvedAt: sent.sentAt, draftVersion: draft.version, simulatedSend: true };
  c.status = "Approved / Response Sent (Simulated)";
  c.statusHistory.push({ status: c.status, at: sent.sentAt });
  repo.save(c);
  return NextResponse.json({ approval: c.approval, status: c.status, messageId: sent.messageId });
}
