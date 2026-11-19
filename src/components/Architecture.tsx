"use client";
import { STEPS } from "@/lib/types";
import { Badge } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Kind = "code" | "search" | "model" | "person";
const KIND: Record<Kind, { label: string; cls: string; dot: string }> = {
  code: { label: "Code", cls: "bg-slate-100 text-slate-700 ring-slate-300", dot: "bg-slate-500" },
  search: { label: "Search (RAG)", cls: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  model: { label: "LLM", cls: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  person: { label: "Person", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
};
const STEP_KIND: Record<string, Kind[]> = {
  intake: ["code"], extract: ["model"], directory: ["code"], "rag-categories": ["search"], "rag-rules": ["search"], "rag-policies": ["search"],
  reasoning: ["model"], compliance: ["code", "model"], routing: ["code"], briefing: ["model"], draft: ["model"],
};
const PHASES: { name: string; steps: string[]; runs: string; out: string }[] = [
  { name: "Receive", steps: ["intake"], runs: "Code · Outlook adapter", out: "New case" },
  { name: "Understand", steps: ["extract", "directory"], runs: "LLM · Entra ID adapter", out: "Facts, stakeholder" },
  { name: "Retrieve", steps: ["rag-categories", "rag-rules", "rag-policies"], runs: "RAG knowledge base", out: "Cited sources" },
  { name: "Assess", steps: ["reasoning", "compliance", "routing"], runs: "LLM + rule code", out: "Category, risk, owner" },
  { name: "Respond", steps: ["briefing", "draft"], runs: "LLM, then a person", out: "Approved reply" },
];
const KindChip = ({ k }: { k: Kind }) => <Badge className={KIND[k].cls}>{KIND[k].label}</Badge>;

function Card({ title, sub, children, className = "" }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (<section className={`card ${className}`}><div className="card-h"><span>{title}</span>{sub && <span className="text-xs font-normal text-slate-500">{sub}</span>}</div><div className="p-4 text-sm">{children}</div></section>);
}
const Box = ({ t, s, kind }: { t: string; s?: string; kind?: Kind }) => (
  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm"><div className="flex items-center gap-2">{kind && <span className={`h-2 w-2 shrink-0 rounded-full ${KIND[kind].dot}`} />}<span className="font-medium text-slate-800">{t}</span></div>{s && <div className="mt-0.5 text-xs text-slate-500">{s}</div>}</div>
);
const Arrow = ({ label, dir = "→" }: { label?: string; dir?: string }) => (
  <div className="flex flex-row items-center justify-center gap-1 text-slate-400 lg:flex-col"><span className="text-lg leading-none">{dir}</span>{label && <span className="max-w-[7rem] text-center text-[11px] leading-tight text-slate-500">{label}</span>}</div>
);

export default function Architecture({ status }: { status: any }) {
  const k = status?.knowledge; const llm = status?.llm;
  const meta = (id: string) => STEPS.find((s) => s.id === id)!;
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Solution Architecture</h2>
        <p className="mt-1 max-w-4xl text-sm text-slate-600">An email passes through 11 visible steps. Code handles deterministic work, retrieval supplies cited sources, the LLM reasons over them, and a person approves the reply. All Microsoft 365 sources are simulated behind interfaces so Microsoft Graph adapters can replace them later.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">{(Object.keys(KIND) as Kind[]).map((x) => <KindChip key={x} k={x} />)}
          <Badge className="bg-amber-50 text-amber-800 ring-amber-200">Simulated integration</Badge>
          <span className="text-slate-500">LLM: {llm?.configured ? `${llm.provider} · ${llm.model}` : "demo mode (no provider configured)"} · Retrieval: {status?.retrieval?.mode ?? "…"} (BM25 keyword search, not vector)</span></div>
      </div>

      <Card title="1 · End-to-end flow" sub="11 steps, streamed live in the Analysis tab">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {PHASES.map((ph, i) => (
            <div key={ph.name} className="relative flex flex-col rounded-lg border border-slate-200 bg-slate-50/60">
              <div className={`rounded-t-lg px-3 py-2 text-sm font-semibold text-white ${["bg-sky-500", "bg-blue-600", "bg-indigo-600", "bg-violet-600", "bg-purple-700"][i]}`}>{i + 1} · {ph.name}</div>
              <ol className="flex-1 space-y-2 p-3">{ph.steps.map((id) => { const n = STEPS.findIndex((s) => s.id === id) + 1; return (
                <li key={id} className="rounded-md bg-white p-2 ring-1 ring-slate-200"><div className="flex items-start gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">{n}</span><div><div className="font-medium leading-snug text-slate-800">{meta(id).label}</div><div className="mt-1 flex flex-wrap gap-1">{STEP_KIND[id].map((x) => <KindChip key={x} k={x} />)}</div></div></div></li>); })}
                {i === 4 && <li className="rounded-md border border-dashed border-emerald-400 bg-emerald-50 p-2 text-emerald-800"><div className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">✓</span><span className="font-medium">Human gate: edit and approve</span></div><div className="mt-1"><KindChip k="person" /></div></li>}
              </ol>
              <div className="border-t border-slate-200 p-3 text-xs text-slate-600"><div><b>Runs on:</b> {ph.runs}</div><div><b>Output:</b> {ph.out}</div></div>
              {i < 4 && <span className="absolute -right-3 top-3 z-10 hidden text-xl text-slate-400 xl:block" aria-hidden>›</span>}
            </div>))}
        </div>
      </Card>

      <Card title="2 · System components" sub="Modular monolith on Next.js">
        <div className="grid items-stretch gap-3 lg:grid-cols-[0.9fr_auto_2.6fr_auto_0.8fr_auto_1fr]">
          <div className="rounded-lg border border-slate-200 p-3"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Channels</div><div className="space-y-2"><Box t="Case dashboard" s="Input form, activity log, results" /><Box t="Email intake" s="Outlook mailbox (mock)" /><Box t="Case history" s="Replay of stored cases" /></div></div>
          <Arrow label="Email, edits ⇄ events, drafts" dir="⇄" />
          <div className="space-y-3">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-3"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">Agent core</div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"><Box t="Orchestrator" s="11 steps, SSE stream" kind="code" /><Box t="Email analysis" s="Entities, category" kind="model" /><Box t="Compliance engine" s="Rule matching + LLM check" kind="model" /><Box t="Specialist routing" s="Category → owner, escalation" kind="code" /><Box t="Response generator" s="Briefing and draft" kind="model" /><Box t="LLM gateway" s="Retry, JSON repair, logged fallback" kind="model" /></div></div>
            <div className="flex justify-center"><Arrow label="reads / writes" dir="⇅" /></div>
            <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-3"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-700">Data</div>
              <div className="grid gap-2 sm:grid-cols-3"><Box t="RAG knowledge base" s="BM25 keyword index" kind="search" /><Box t="Case store" s="Cases, drafts, approvals" /><Box t="Event log" s="Every step, replayable" /></div></div>
          </div>
          <Arrow label="Mail, people, documents" />
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-violet-50 p-3 text-center"><div className="font-semibold text-indigo-800">Adapter band</div><div className="mt-1 text-xs text-slate-600">Interfaces only. Mocks swap for Graph in one place.</div><div className="mt-2 space-y-1 font-mono text-[11px] text-indigo-700"><div>EmailService</div><div>DirectoryService</div><div>SharePointService</div><div>SpecialistService</div></div></div>
          <Arrow label="Simulated today" />
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3"><div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">Microsoft 365 (mocked)</div><div className="space-y-2"><Box t="Outlook / Exchange" s="Graph Mail later" /><Box t="Entra ID org chart" s="Graph users later" /><Box t="SharePoint" s="Policy documents" /><Box t="Specialist directory" s="Teams / skills source" /></div></div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><span className="font-semibold text-slate-700">External LLM provider:</span><Badge className="bg-violet-50 text-violet-700 ring-violet-200">Groq (default)</Badge><Badge className="bg-slate-50 text-slate-600 ring-slate-200">OpenRouter / xAI (optional fallback)</Badge><Badge className="bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200">Demo mode when no key</Badge><span>Only the email content and retrieved excerpts leave the app, and only to the configured provider.</span></div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="3 · Microsoft 365 integration" sub="Mock today, Graph target">
          <table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="py-1.5 pr-2">Source</th><th className="pr-2">Prototype today</th><th>Production target</th></tr></thead>
            <tbody className="align-top [&_td]:border-b [&_td]:border-slate-100 [&_td]:py-2 [&_td]:pr-2">
              <tr><td className="font-medium">Outlook / Exchange<div className="font-mono text-[11px] font-normal text-indigo-700">EmailService</div></td><td>Receives the email, stores metadata, simulates the send</td><td className="text-indigo-700">Graph Mail: read mailbox, create reply draft</td></tr>
              <tr><td className="font-medium">Entra ID org chart<div className="font-mono text-[11px] font-normal text-indigo-700">DirectoryService</div></td><td>{k?.users ?? 15} fictional users: department, title, manager</td><td className="text-indigo-700">Graph user and manager endpoints, read-only</td></tr>
              <tr><td className="font-medium">SharePoint<div className="font-mono text-[11px] font-normal text-indigo-700">SharePointService</div></td><td>{k?.policies ?? 10} policy documents, split into sections for RAG</td><td className="text-indigo-700">Graph drive or search, re-index on change</td></tr>
              <tr><td className="font-medium">Specialist directory<div className="font-mono text-[11px] font-normal text-indigo-700">SpecialistService</div></td><td>{k?.specialists ?? 5} profiles with expertise and escalation contact</td><td className="text-indigo-700">Team membership or a skills source</td></tr></tbody></table>
          <p className="mt-3 rounded bg-indigo-50 p-2 text-xs text-indigo-900"><b>The orchestrator calls interfaces only.</b> A Graph adapter replaces a mock in one place and the workflow stays unchanged.</p>
        </Card>

        <Card title="4 · RAG knowledge base" sub="Every finding cites a retrieved source">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Categories", k?.categories ?? 10], ["Compliance rules", k?.rules ?? 25], ["Policies", k?.policies ?? 10, `${k?.policySections ?? "~25"} sections`], ["Past cases", k?.cases ?? 20]].map(([l, n, sub]: any) => (
            <div key={l} className="rounded-md border border-sky-200 bg-sky-50/50 p-2 text-center"><div className="text-2xl font-bold text-sky-700">{n}</div><div className="text-xs font-medium text-slate-700">{l}</div>{sub && <div className="text-[11px] text-slate-500">{sub}</div>}</div>))}</div>
          <ol className="mt-3 grid gap-2 sm:grid-cols-5">{[["Index", "Split into sections with ID and type"], ["Search", "BM25 keyword score per source type"], ["Filter", "Top matches above a minimum score"], ["Cite", "Excerpt, ID and score to LLM and UI"], ["Planned", "Vector embeddings, hybrid ranking"]].map(([t, d], i) => (
            <li key={t} className={`rounded-md p-2 text-xs ring-1 ${i === 4 ? "border border-dashed border-slate-300 bg-white text-slate-500 ring-0" : "bg-slate-50 ring-slate-200"}`}><div className="mb-0.5 flex items-center gap-1.5 font-semibold text-slate-800"><span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${i === 4 ? "bg-slate-400" : "bg-sky-600"}`}>{i + 1}</span>{t}</div>{d}</li>))}</ol>
          <p className="mt-3 text-xs text-slate-500">Retrieval is keyword search and is labelled that way in the UI and logs. A vector implementation can replace it behind the same <span className="font-mono">KnowledgeBaseService</span> interface.</p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="5 · Division of work" sub="Who does what">
          <div className="grid gap-2 sm:grid-cols-2">
            {([["code", "Deterministic steps", "Directory lookup, rule keyword matching, deadline resolution, risk = highest triggered rule, specialist routing."], ["search", "Retrieval", "Categories, rules, policy sections and similar cases, each with ID, excerpt and score."], ["model", "Reasoning and writing", "Extraction, classification, confirming candidate rules, briefing, draft. Output validated against a schema."], ["person", "Review and approval", "The specialist edits the draft, approves it and triggers the simulated send."]] as [Kind, string, string][]).map(([kd, t, d]) => (
              <div key={t} className="rounded-md border border-slate-200 p-3"><div className="mb-1 flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${KIND[kd].dot}`} /><b>{t}</b></div><p className="text-xs text-slate-600">{d}</p></div>))}</div>
          <p className="mt-3 text-xs text-slate-600"><b>Assessment order:</b> rule keywords select candidate rules, the LLM confirms or rejects each one and cannot add a rule that was not retrieved, and it may only raise the overall risk, with a stated reason.</p>
        </Card>
        <Card title="6 · Guardrails" sub="Prototype with fictional data">
          <ul className="grid gap-2 text-xs text-slate-700 sm:grid-cols-2">
            {[["Potential-risk wording", "Findings say “potential”. Claims that a violation occurred are rewritten."], ["Cited findings", "Each finding lists rule and policy IDs. Invented IDs are dropped."], ["Human approval", "A person approves the reply. The send is simulated, no real email leaves."], ["Email is untrusted data", "The body sits in a delimited block. Instructions inside it are ignored."], ["Labelled output", "AI and DEMO badges. Provider and model appear in the log."], ["Failure handling", "429 → retry → logged fallback. Invalid JSON gets one repair."]].map(([t, d]) => (
              <li key={t} className="rounded-md bg-slate-50 p-2 ring-1 ring-slate-200"><b className="text-slate-800">{t}</b><br />{d}</li>))}</ul>
          <p className="mt-3 rounded bg-slate-800 p-2 text-xs text-slate-100">AI-generated assessments use fictional demo rules and are not legal advice.</p>
        </Card>
      </div>
    </div>
  );
}
