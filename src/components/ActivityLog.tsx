"use client";
import { useState } from "react";
import { STEPS, type StepEvent } from "@/lib/types";
import { Badge, StatusIcon, statusLabel } from "./ui";

export default function ActivityLog({ events, running, onRetry, onCancel, canRetry, failed }: { events: StepEvent[]; running: boolean; onRetry: () => void; onCancel: () => void; canRetry: boolean; failed: boolean }) {
  const latest = new Map<string, StepEvent>(); events.forEach((e) => latest.set(e.stepId, e));
  const started = events.length > 0;
  const done = STEPS.filter((s) => ["completed", "warning"].includes(latest.get(s.id)?.status ?? "")).length;
  const pct = Math.round((done / STEPS.length) * 100);
  return (
    <div className="card">
      <div className="card-h"><span>Agent Activity</span>
        <span className="flex items-center gap-2">
          {running && <button className="btn-secondary !py-0.5 text-xs" onClick={onCancel}>Cancel</button>}
          {canRetry && <button className="btn-secondary !py-0.5 text-xs" onClick={onRetry}>{failed ? "Retry analysis" : "Re-run analysis"}</button>}
          <span className="text-xs font-normal text-slate-500">{started ? `${done}/${STEPS.length} steps` : "Not started"}</span>
        </span>
      </div>
      <div className="px-4 pt-3"><div className="h-1.5 w-full overflow-hidden rounded bg-slate-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Analysis progress"><div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} /></div></div>
      {!started ? <p className="p-4 text-sm text-slate-400">Load a sample or enter an email, then click Analyse Email to watch the agent work.</p> : (
        <ol className="p-4">{STEPS.map((s, i) => <Row key={s.id} n={i + 1} step={s} ev={latest.get(s.id)} last={i === STEPS.length - 1} />)}</ol>
      )}
    </div>
  );
}

function Row({ n, step, ev, last }: { n: number; step: (typeof STEPS)[number]; ev?: StepEvent; last: boolean }) {
  const [open, setOpen] = useState(false);
  const status = ev?.status ?? "pending";
  const d = ev?.details as Record<string, any> | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any
  const hasDetails = d && Object.keys(d).length > 0;
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!last && <span className="absolute left-3 top-6 h-full w-px bg-slate-200" aria-hidden />}
      <StatusIcon status={status} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{n}. {step.component}</span>
          {ev && <time dateTime={ev.timestamp}>{new Date(ev.timestamp).toLocaleTimeString()}</time>}
          <span className="sr-only">{statusLabel(status)}</span>
          {ev?.provider && <Badge className={ev.provider.mode === "demo" ? "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200" : "bg-slate-50 text-slate-600 ring-slate-200"}>{ev.provider.mode === "demo" ? "demo" : `${ev.provider.name} · ${ev.provider.model}`}</Badge>}
        </div>
        <p className={`text-sm ${status === "failed" ? "text-red-700" : status === "warning" ? "text-amber-800" : status === "pending" ? "text-slate-400" : "text-slate-800"}`}>{ev ? ev.message : step.label}{status === "running" ? "…" : ""}</p>
        {hasDetails && status !== "running" && (<>
          <button className="mt-0.5 text-xs text-indigo-600 hover:underline" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Hide details" : "Show details"}</button>
          {open && <Details d={d!} />}
        </>)}
      </div>
    </li>
  );
}

function Details({ d }: { d: Record<string, any> }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const sources = d.sources as { sourceId: string; sourceType: string; title: string; excerpt: string; relevance: number; score: number }[] | undefined;
  return (
    <div className="mt-1 space-y-2 rounded border border-slate-200 bg-slate-50 p-2 text-xs">
      {d.note && <p className="font-medium text-amber-800">{d.note}</p>}
      {sources ? (sources.length ? sources.map((s) => (
        <div key={s.sourceId} className="rounded bg-white p-2 ring-1 ring-slate-200">
          <div className="flex justify-between gap-2"><span className="font-medium">{s.title}</span><span className="shrink-0 text-slate-500">{s.sourceId} · rel {s.relevance}</span></div>
          <p className="mt-1 text-slate-600">{s.excerpt}</p></div>)) : <p className="text-slate-500">No relevant sources above the relevance threshold.</p>)
        : <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-slate-700">{JSON.stringify(d, null, 2)}</pre>}
    </div>
  );
}
