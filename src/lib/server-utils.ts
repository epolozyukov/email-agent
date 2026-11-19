import { z } from "zod";
import { runAnalysis } from "@/modules/agent-orchestrator";
import type { StepEvent } from "@/lib/types";

export const EmailSchema = z.object({
  from: z.string().trim().email("From must be a valid email address").max(200),
  to: z.string().trim().min(1, "To is required").max(200),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject max 200 characters"),
  body: z.string().trim().min(1, "Body is required").max(10000, "Body max 10,000 characters"),
  attachmentName: z.string().trim().max(200).optional(),
});

const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 12, windowMs = 60_000) {
  const now = Date.now(); const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(key, arr); return arr.length > limit;
}

export function sseResponse(caseId: string, signal: AbortSignal) {
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => { try { controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`)); } catch { /* closed */ } };
      send({ type: "case", caseId });
      const status = await runAnalysis(caseId, (event: StepEvent) => send({ type: "event", event }), signal);
      send({ type: "done", caseId, status });
      try { controller.close(); } catch { /* closed */ }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
}
