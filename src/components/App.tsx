"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CaseRecord, EmailInput, StepEvent } from "@/lib/types";
import Header from "./Header";
import EmailForm from "./EmailForm";
import ActivityLog from "./ActivityLog";
import Results from "./Results";
import DraftPanel from "./DraftPanel";
import History from "./History";
import Architecture from "./Architecture";
import { Badge, DemoBadge } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function App() {
  const [status, setStatus] = useState<any>(null);
  const [c, setC] = useState<CaseRecord | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [formReset, setFormReset] = useState(0);
  const [tab, setTab] = useState<"analysis" | "architecture">("analysis");
  const abort = useRef<AbortController | null>(null);

  useEffect(() => { fetch("/api/status").then((r) => r.json()).then(setStatus).catch(() => setStatus(null)); }, []);

  const stream = useCallback(async (url: string, init: RequestInit, base: CaseRecord | null) => {
    setError(null); setRunning(true);
    const ac = new AbortController(); abort.current = ac;
    let caseId = base?.id ?? "";
    try {
      const res = await fetch(url, { ...init, signal: ac.signal });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); throw new Error(j.error ?? `Request failed (${res.status})`); }
      const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = "";
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
          if (!chunk.startsWith("data: ")) continue;
          const msg = JSON.parse(chunk.slice(6));
          if (msg.type === "case") { caseId = msg.caseId; }
          if (msg.type === "event") {
            const ev: StepEvent = msg.event;
            setC((prev) => {
              const p = prev && prev.id === ev.caseId ? prev : { ...(base ?? ({} as CaseRecord)), id: ev.caseId, events: [], results: {}, drafts: [], status: "Analysing" } as CaseRecord;
              const results = { ...p.results }; if (ev.partialResult) results[ev.partialResult.section] = ev.partialResult.data;
              return { ...p, events: [...p.events, ev], results, status: "Analysing", mode: ev.provider?.mode === "demo" ? "demo" : p.mode };
            });
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setRunning(false); abort.current = null;
      if (caseId) { try { const r = await fetch(`/api/cases/${caseId}`); if (r.ok) setC(await r.json()); } catch { /* ignore */ } }
    }
  }, []);

  const analyse = (email: EmailInput) => {
    setC({ id: "", status: "New", mode: status?.llm?.mode ?? "demo", events: [], results: {}, drafts: [], email: { ...email, receivedAt: new Date().toISOString() } } as unknown as CaseRecord);
    return stream("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(email) }, null);
  };
  const retry = () => c && stream(`/api/cases/${c.id}/retry`, { method: "POST" }, { ...c, events: [], results: {}, drafts: [] });
  const cancel = () => { abort.current?.abort(); };
  const reset = () => { setTab("analysis"); abort.current?.abort(); setC(null); setError(null); setFormReset((n) => n + 1); };
  const open = async (id: string) => { setShowHistory(false); setTab("analysis"); const r = await fetch(`/api/cases/${id}`); if (r.ok) { setC(await r.json()); setError(null); } };

  const live = status?.llm?.configured ?? false;
  const demo = c ? c.mode === "demo" : !live;
  const finished = !!c && !running && c.status !== "New" && c.status !== "Analysing";
  const failed = c?.status === "Analysis Failed";
  const canRetry = !!c?.id && !running && (failed || c?.status === "Cancelled" || c?.status === "Analysed" || c?.status === "Awaiting Information") && !c?.approval;

  return (
    <div className="min-h-screen">
      <Header status={status} onNew={reset} onHistory={() => setShowHistory(true)} />
      <nav className="border-b border-slate-200 bg-white" aria-label="Views"><div className="mx-auto flex max-w-[1500px] gap-1 px-4" role="tablist">
        {([["analysis", "Email Analysis"], ["architecture", "Solution Architecture"]] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}{id === "analysis" && running && <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-indigo-500" aria-label="Analysis running" />}</button>))}
      </div></nav>
      {tab === "architecture" && <main className="mx-auto max-w-[1500px] p-4"><Architecture status={status} /></main>}
      <main className={`mx-auto grid max-w-[1500px] gap-4 p-4 lg:grid-cols-2 ${tab === "analysis" ? "" : "hidden"}`}>
        <div className="space-y-4">
          <EmailForm onSubmit={analyse} disabled={running} live={live} reset={formReset} />
          {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{error}</p>}
          <ActivityLog events={c?.events ?? []} running={running} onRetry={retry} onCancel={cancel} canRetry={canRetry} failed={failed} />
        </div>
        <div className="space-y-4">
          {c && c.id && <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-mono font-semibold">{c.id}</span><Badge className="bg-indigo-50 text-indigo-700 ring-indigo-200">{c.status}</Badge>{demo ? <DemoBadge /> : c.provider && <Badge className="bg-slate-50 text-slate-600 ring-slate-200">{c.provider} · {c.model}</Badge>}</div>}
          {failed && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">Analysis failed at one step (see the activity log). Partial results are shown below. Use “Retry analysis”.</p>}
          {c?.status === "Cancelled" && <p className="rounded-md bg-slate-100 p-3 text-sm text-slate-600">Analysis cancelled.</p>}
          {c ? <Results r={c.results as any} demo={demo} /> : <div className="card p-8 text-center text-sm text-slate-500">Results will appear here as the agent works.<br />Try one of the three sample emails.</div>}
          {c && c.id && (finished || c.drafts.length > 0) && <DraftPanel c={c} onChange={setC} />}
        </div>
      </main>
      {showHistory && <History onClose={() => setShowHistory(false)} onOpen={open} />}
    </div>
  );
}
