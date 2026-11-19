"use client";
import { useEffect, useState } from "react";
import { Badge, RISK_STYLE } from "./ui";
import type { RiskLevel } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function History({ onClose, onOpen }: { onClose: () => void; onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [q, setQ] = useState(""); const [risk, setRisk] = useState("");
  const local = (): any[] => { try { return (JSON.parse(localStorage.getItem("eei.cases") ?? "[]") as any[]).map((c) => ({ id: c.id, subject: c.email?.subject, status: c.status, mode: c.mode, category: c.results?.classification?.primary ?? null, risk: c.results?.compliance?.overallRisk ?? null, receivedAt: c.email?.receivedAt })); } catch { return []; } };
  const load = () => fetch("/api/cases").then((r) => r.json()).catch(() => ({ cases: [] })).then((j) => { const server = j.cases ?? []; const ids = new Set(server.map((x: any) => x.id)); setRows([...server, ...local().filter((x) => !ids.has(x.id))].sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)))); });
  useEffect(() => { load(); }, []);
  const shown = (rows ?? []).filter((r) => (!risk || r.risk === risk) && (!q || `${r.status} ${r.subject} ${r.id}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-slate-900/30" onClick={onClose}>
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Case history">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Case History</h2><button className="btn-secondary" onClick={onClose}>Close</button></div>
        <div className="mb-3 flex gap-2"><input className="input" placeholder="Search id, subject or status" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input !w-32" value={risk} onChange={(e) => setRisk(e.target.value)} aria-label="Filter by risk"><option value="">All risks</option>{["Low", "Medium", "High", "Critical"].map((r) => <option key={r}>{r}</option>)}</select></div>
        {rows === null ? <p className="text-slate-400">Loading…</p> : shown.length === 0 ? <p className="text-slate-400">No cases.</p> : (
          <ul className="space-y-2">{shown.map((r) => (
            <li key={r.id}><button className="w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50" onClick={() => onOpen(r.id)}>
              <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-slate-500">{r.id}</span><span className="text-xs text-slate-500">{new Date(r.receivedAt).toLocaleString()}</span></div>
              <p className="font-medium">{r.subject}</p>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs">{r.category && <Badge className="bg-slate-50 text-slate-700 ring-slate-200">{r.category}</Badge>}{r.risk && <Badge className={RISK_STYLE[r.risk as RiskLevel]}>{r.risk}</Badge>}<Badge className="bg-indigo-50 text-indigo-700 ring-indigo-200">{r.status}</Badge>{r.mode === "demo" && <Badge className="bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200">demo</Badge>}</div></button></li>))}</ul>)}
        {rows && rows.length > 0 && <button className="btn-secondary mt-4 !text-red-700" onClick={async () => { if (confirm("Delete all locally stored cases?")) { await fetch("/api/cases", { method: "DELETE" }); try { localStorage.removeItem("eei.cases"); } catch { /* ignore */ } load(); } }}>Delete all local cases</button>}
      </aside>
    </div>
  );
}
