"use client";
import { useState } from "react";
import type { EmailInput } from "@/lib/types";
import { SAMPLES } from "@/lib/samples";

const EMPTY: EmailInput = { from: "", to: "compliance.desk@business.com", subject: "", body: "", attachmentName: "" };
const PII = /(\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b)|(\b(?:\d[ -]?){13,16}\b)|(\+?\d[\d\s().-]{8,}\d)/;

export default function EmailForm({ onSubmit, disabled, live, reset }: { onSubmit: (e: EmailInput) => void; disabled: boolean; live: boolean; reset: number }) {
  const [f, setF] = useState<EmailInput>(EMPTY);
  const [err, setErr] = useState<string[]>([]);
  const [lastReset, setLastReset] = useState(reset);
  if (reset !== lastReset) { setLastReset(reset); setF(EMPTY); setErr([]); }
  const set = (k: keyof EmailInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const pii = live && PII.test(`${f.subject} ${f.body}`);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errors: string[] = [];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.from.trim())) errors.push("From must be a valid email address");
    if (!f.to.trim()) errors.push("To is required");
    if (!f.subject.trim()) errors.push("Subject is required");
    if (f.subject.length > 200) errors.push("Subject max 200 characters");
    if (!f.body.trim()) errors.push("Body is required");
    if (f.body.length > 10000) errors.push("Body max 10,000 characters");
    setErr(errors);
    if (!errors.length) onSubmit({ ...f, attachmentName: f.attachmentName?.trim() || undefined });
  }
  return (
    <form onSubmit={submit} className="card" noValidate>
      <div className="card-h"><span>Incoming Email</span>
        <div className="flex flex-wrap gap-1.5">{SAMPLES.map((s) => (
          <button key={s.label} type="button" disabled={disabled} className="rounded border border-slate-300 px-2 py-0.5 text-xs font-normal text-slate-600 hover:bg-slate-50 disabled:opacity-50" onClick={() => { setF({ ...s.email, attachmentName: "" }); setErr([]); }}>{s.label}</button>))}
        </div>
      </div>
      <div className="grid gap-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-600">From<input className="input mt-1" value={f.from} onChange={set("from")} placeholder="name@business.com" disabled={disabled} /></label>
          <label className="text-xs font-medium text-slate-600">To (mailbox)<input className="input mt-1" value={f.to} onChange={set("to")} disabled={disabled} /></label>
        </div>
        <label className="text-xs font-medium text-slate-600">Subject<input className="input mt-1" value={f.subject} onChange={set("subject")} maxLength={250} disabled={disabled} /></label>
        <label className="text-xs font-medium text-slate-600">Email body<textarea className="input mt-1 h-40 resize-y" value={f.body} onChange={set("body")} disabled={disabled} /></label>
        <label className="text-xs font-medium text-slate-600">Attachment name (simulation only — file is not analysed)<input className="input mt-1" value={f.attachmentName} onChange={set("attachmentName")} placeholder="e.g. agreement_v3.pdf" disabled={disabled} /></label>
        {live ? <p className="rounded bg-amber-50 p-2 text-xs text-amber-800 ring-1 ring-amber-200">Email content is sent to the configured hosted LLM provider. Use fictional demo data only.</p> : <p className="rounded bg-fuchsia-50 p-2 text-xs text-fuchsia-800 ring-1 ring-fuchsia-200">Demo mode: no LLM provider configured. Retrieval and directory lookup are real; the analysis text is template-based.</p>}
        {pii && <p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-700 ring-1 ring-red-200">This text looks like it may contain a phone/card/ID number. Do not submit real personal data.</p>}
        {err.length > 0 && <ul role="alert" className="list-disc rounded bg-red-50 p-2 pl-6 text-xs text-red-700">{err.map((x) => <li key={x}>{x}</li>)}</ul>}
        <div className="flex justify-end"><button className="btn-primary" disabled={disabled}>{disabled ? "Analysing…" : "Analyse Email"}</button></div>
      </div>
    </form>
  );
}
