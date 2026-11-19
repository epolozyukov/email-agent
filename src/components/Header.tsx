"use client";
import { useEffect, useState } from "react";
import { Badge } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Header({ onNew, onHistory, status }: { onNew: () => void; onHistory: () => void; status: any }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  const llm = status?.llm;
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-2.5">
        <h1 className="text-base font-semibold tracking-tight">Enterprise Email Intelligence</h1>
        <Badge className="bg-amber-50 text-amber-800 ring-amber-200">Prototype · Simulated Integrations</Badge>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button className="btn-secondary" aria-expanded={open} onClick={() => setOpen(!open)}><span className={`h-2 w-2 rounded-full ${llm?.configured ? "bg-emerald-500" : "bg-fuchsia-500"}`} />Integration Status</button>
            {open && <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg">
              <ul className="space-y-1.5">{status?.integrations.map((i: any) => <li key={i.name} className="flex items-center justify-between gap-2"><span>{i.name}</span><Badge className="bg-sky-50 text-sky-700 ring-sky-200">{i.status} · simulated</Badge></li>)}
                <li className="flex items-center justify-between gap-2"><span>LLM Provider</span>{llm?.configured ? <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">Connected · {llm.provider}</Badge> : <Badge className="bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-300">Not configured → demo mode</Badge>}</li></ul>
              {llm?.configured && <p className="mt-2 text-xs text-slate-500">Model: {llm.model}{llm.fallback ? ` · fallback: ${llm.fallback}` : ""}</p>}
              {!llm?.configured && <p className="mt-2 text-xs text-slate-600">Set <code>GROQ_API_KEY</code> in <code>.env.local</code> and restart to use a real model (see <code>.env.example</code>).</p>}
              <p className="mt-2 text-xs text-slate-500">Retrieval: {status?.retrieval.note}</p>
              <p className="mt-1 text-xs text-slate-500">Simulated integrations are not real connections. No real email is ever sent.</p>
            </div>}
          </div>
          <button className="btn-secondary" onClick={onHistory}>Case History</button>
          <button className="btn-primary" onClick={onNew}>New Analysis</button>
        </div>
      </div>
    </header>
  );
}
