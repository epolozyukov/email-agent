import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { repo } from "@/modules/store";
import { generateDraftInternal } from "@/modules/agent-orchestrator";
import type { DraftVersion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("generate"), type: z.enum(["response", "clarification"]) }),
  z.object({ action: z.literal("save"), type: z.enum(["response", "clarification"]), to: z.string().min(1), subject: z.string().min(1), body: z.string().min(1) }),
]);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const c = repo.get(params.id);
  if (!c) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  if (c.status.startsWith("Approved")) return NextResponse.json({ error: "Case already approved" }, { status: 409 });
  if (!["Analysed", "Awaiting Information"].includes(c.status)) return NextResponse.json({ error: `Cannot change drafts while case is "${c.status}"` }, { status: 409 });
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues.map((i) => i.message).join("; ") }, { status: 400 });

  if (p.data.action === "save") {
    const last = c.drafts[c.drafts.length - 1];
    const d: DraftVersion = { version: c.drafts.length + 1, type: p.data.type, to: p.data.to, subject: p.data.subject, body: p.data.body, origin: "manual-edit", mode: last?.mode ?? c.mode, provider: last?.provider, model: last?.model, createdAt: new Date().toISOString() };
    c.drafts.push(d); repo.save(c);
    return NextResponse.json({ draft: d });
  }
  try {
    const { draft, notes } = await generateDraftInternal(c, p.data.type);
    if (p.data.type === "clarification" && c.status !== "Awaiting Information") { c.status = "Awaiting Information"; c.statusHistory.push({ status: c.status, at: new Date().toISOString() }); }
    else if (p.data.type === "response" && c.status === "Awaiting Information") { c.status = "Analysed"; c.statusHistory.push({ status: c.status, at: new Date().toISOString() }); }
    repo.save(c);
    return NextResponse.json({ draft, notes, status: c.status });
  } catch (e) {
    return NextResponse.json({ error: `Draft generation failed: ${(e as Error).message}` }, { status: 502 });
  }
}
