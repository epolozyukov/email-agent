"use client";
import { useEffect, useState } from "react";
import type { CaseRecord, DraftVersion } from "@/lib/types";
import { AiBadge, DemoBadge, Section } from "./ui";

export default function DraftPanel({ c, onChange }: { c: CaseRecord; onChange: (c: CaseRecord) => void }) {
  const last = c.drafts[c.drafts.length - 1];
  const [to, setTo] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState("");
  const [dirty, setDirty] = useState(false); const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [showHist, setShowHist] = useState(false);
  const approved = !!c.approval;
  const canEdit = !approved && ["Analysed", "Awaiting Information"].includes(c.status);

  useEffect(() => { if (last) { setTo(last.to); setSubject(last.subject); setBody(last.body); setDirty(false); } }, [last?.version, c.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!last) return <Section title="Draft Email"><p className="text-slate-400">Draft will appear when analysis completes.</p></Section>;

  async function api(path: string, payload?: unknown) {
    const res = await fetch(`/api/cases/${c.id}/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: payload ? JSON.stringify(payload) : undefined });
    const j = await res.json(); if (!res.ok) throw new Error(j.error ?? "Request failed"); return j;
  }
  async function refresh() { const r = await fetch(`/api/cases/${c.id}`); onChange(await r.json()); }
  const run = (name: string, fn: () => Promise<void>) => async () => { setBusy(name); setMsg(null); try { await fn(); } catch (e) { setMsg({ kind: "err", text: (e as Error).message }); } finally { setBusy(null); } };

  const regenerate = run("regen", async () => {
    if (dirty && !confirm("You have unsaved edits. Regenerating will replace them (saved versions stay in history). Continue?")) return;
    await api("drafts", { action: "generate", type: last.type }); await refresh(); setMsg({ kind: "ok", text: "New draft version generated." });
  });
  const clarify = run("clar", async () => {
    if (dirty && !confirm("Unsaved edits will be replaced. Continue?")) return;
    await api("drafts", { action: "generate", type: "clarification" }); await refresh(); setMsg({ kind: "ok", text: "Clarification draft generated. Case status: Awaiting Information." });
  });
  const save = run("save", async () => { await api("drafts", { action: "save", type: last.type, to, subject, body }); await refresh(); setMsg({ kind: "ok", text: "Edits saved as a new version." }); });
  const approve = run("approve", async () => {
    if (dirty) await api("drafts", { action: "save", type: last.type, to, subject, body });
    await api("approve"); await refresh(); setMsg({ kind: "ok", text: "Approved. Response sent (SIMULATED) — no real email was sent." });
  });
  const copy = run("copy", async () => { await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${body}`); setMsg({ kind: "ok", text: "Draft copied to clipboard." }); });

  const demo = last.mode === "demo";
  return (
    <Section title={`Draft Email — ${last.type === "clarification" ? "Clarification request" : "Response"}`} right={<span className="flex items-center gap-2">{demo ? <DemoBadge /> : <AiBadge />}<span className="text-xs font-normal text-slate-500">v{last.version} · {last.origin === "manual-edit" ? "edited by user" : last.provider}</span></span>}>
      <div className="space-y-2">
        {approved && <p role="status" className="rounded bg-emerald-50 p-2 text-emerald-800 ring-1 ring-emerald-200">✓ Approved / Response Sent (Simulated) by {c.approval!.approvedBy} on {new Date(c.approval!.approvedAt).toLocaleString()} (draft v{c.approval!.draftVersion}). No real email was sent.</p>}
        {c.status === "Awaiting Information" && <p className="rounded bg-sky-50 p-2 text-xs text-sky-800 ring-1 ring-sky-200">Case status: Awaiting Information</p>}
        <label className="block text-xs font-medium text-slate-600">To<input className="input mt-1" value={to} disabled={!canEdit} onChange={(e) => { setTo(e.target.value); setDirty(true); }} /></label>
        <label className="block text-xs font-medium text-slate-600">Subject<input className="input mt-1" value={subject} disabled={!canEdit} onChange={(e) => { setSubject(e.target.value); setDirty(true); }} /></label>
        <label className="block text-xs font-medium text-slate-600">Body (editable)<textarea className="input mt-1 h-64 font-mono text-[13px]" value={body} disabled={!canEdit} onChange={(e) => { setBody(e.target.value); setDirty(true); }} /></label>
        <p className="text-xs text-slate-500">AI-generated draft — human review required before approval.</p>
        {msg && <p role={msg.kind === "err" ? "alert" : "status"} className={`rounded p-2 text-xs ${msg.kind === "err" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{msg.text}</p>}
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={regenerate} disabled={!canEdit || !!busy}>{busy === "regen" ? "Regenerating…" : "Regenerate Draft"}</button>
          <button className="btn-secondary" onClick={clarify} disabled={!canEdit || !!busy}>{busy === "clar" ? "Generating…" : "Request More Information"}</button>
          <button className="btn-secondary" onClick={copy} disabled={!!busy}>Copy Draft</button>
          {canEdit && dirty && <button className="btn-secondary" onClick={save} disabled={!!busy}>Save edits</button>}
          <button className="btn-success ml-auto" onClick={approve} disabled={!canEdit || !!busy || !body.trim()}>{busy === "approve" ? "Approving…" : "Approve & Simulate Send"}</button>
        </div>
        {c.drafts.length > 1 && <div><button className="text-xs text-indigo-600 hover:underline" onClick={() => setShowHist(!showHist)}>{showHist ? "Hide" : "Show"} draft history ({c.drafts.length})</button>
          {showHist && <ul className="mt-1 space-y-1 text-xs">{[...c.drafts].reverse().map((d: DraftVersion) => <li key={d.version} className="rounded bg-slate-50 p-1.5"><b>v{d.version}</b> · {d.type} · {d.origin === "ai" ? (d.mode === "demo" ? "demo" : `AI (${d.provider})`) : "manual edit"} · {new Date(d.createdAt).toLocaleTimeString()}<button className="ml-2 text-indigo-600 hover:underline disabled:text-slate-400" disabled={!canEdit} onClick={() => { setTo(d.to); setSubject(d.subject); setBody(d.body); setDirty(true); }}>load into editor</button></li>)}</ul>}</div>}
      </div>
    </Section>
  );
}
