"use client";
import { useState } from "react";
import type { RetrievedSource, RiskLevel } from "@/lib/types";
import { AiBadge, Badge, DemoBadge, Pending, RiskBadge, Section } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
type R = Record<string, any>;
const Row = ({ k, children }: { k: string; children: React.ReactNode }) => (<div className="grid grid-cols-[8rem_1fr] gap-2 py-0.5"><dt className="text-slate-500">{k}</dt><dd>{children}</dd></div>);
const List = ({ items, empty = "None" }: { items?: string[]; empty?: string }) => items?.length ? <ul className="list-disc space-y-0.5 pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <span className="text-slate-400">{empty}</span>;

export default function Results({ r, demo }: { r: R; demo: boolean }) {
  const { summary, classification: cl, compliance: co, stakeholder: st, assignment: as, sources, briefing: br } = r;
  const tag = demo ? <DemoBadge /> : <AiBadge />;
  return (
    <div className="space-y-4">
      <p className="rounded-md bg-slate-800 px-3 py-2 text-xs text-slate-100">AI-generated assessment based on fictional demo rules. Not legal advice. Detected risks are <b>potential</b>, not confirmed violations. Human review required.</p>
      <Section title="A · Case Summary">
        {summary ? <dl><Row k="Case ID"><span className="font-mono">{summary.caseId}</span></Row><Row k="Summary">{summary.summary}</Row><Row k="Requester">{summary.requester}</Row><Row k="Department">{st?.department ?? summary.department ?? <span className="text-slate-400">Unknown</span>}</Row><Row k="Direct manager">{st ? (st.found ? (st.manager ? <>{st.manager.name} <span className="text-xs text-slate-500">({st.manager.jobTitle})</span></> : <span className="text-slate-400">None on record</span>) : <span className="text-slate-400">Unknown</span>) : <span className="text-slate-400">Looking up…</span>}</Row><Row k="Date received">{new Date(summary.dateReceived).toLocaleString()}</Row></dl> : <Pending />}
      </Section>
      <Section title="B · Classification" right={cl && tag}>
        {cl ? <div className="space-y-2">
          <dl><Row k="Primary"><b>{cl.primary}</b></Row><Row k="Secondary">{cl.secondary ?? "—"}</Row>
            <Row k="Confidence"><span className="font-medium">{Math.round(cl.confidence * 100)}%</span> <span className="text-xs text-slate-500">(model {Math.round(cl.llmConfidence * 100)}% · retrieval agreement {Math.round(cl.retrievalAgreement * 100)}%)</span></Row></dl>
          {cl.lowConfidence && <p role="alert" className="rounded bg-amber-50 p-2 text-xs text-amber-800 ring-1 ring-amber-200">Low confidence — manual review recommended.</p>}
          <p className="text-slate-700">{cl.explanation}</p>
          {cl.citedSourceIds?.length > 0 && <p className="text-xs text-slate-500">Sources: {cl.citedSourceIds.join(", ")}</p>}
        </div> : <Pending />}
      </Section>
      <Section title="C · Compliance Assessment" right={co && <span className="flex gap-2">{tag}<RiskBadge level={co.overallRisk as RiskLevel} /></span>}>
        {co ? <div className="space-y-3">
          <p className="text-xs text-slate-500">{co.disclaimer}</p>
          <p className="text-slate-700">{co.riskRationale}</p>
          <div><h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Potentially triggered rules</h4>
            {co.triggered.length ? <ul className="space-y-2">{co.triggered.map((t: any) => (
              <li key={t.ruleId} className="rounded border border-slate-200 p-2"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-slate-500">{t.ruleId}</span><b>{t.title}</b><RiskBadge level={t.risk} /></div>
                <p className="mt-1 text-slate-700">{t.explanation}</p><p className="mt-1 text-xs text-slate-500">Source: {t.sourceRef} · cited: {t.citedSourceIds.join(", ")}</p></li>))}</ul> : <span className="text-slate-400">No rules triggered</span>}</div>
          {co.deadlines?.length > 0 && <div><h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Deadlines</h4><ul className="space-y-1">{co.deadlines.map((d: any) => <li key={d.phrase}>“{d.phrase}” → <b>{d.resolvedDate ?? "unresolved"}</b><span className="block text-xs text-slate-500">{d.note}</span></li>)}</ul></div>}
          <div><h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Recommended actions</h4><List items={co.recommendedActions} /></div>
          <div><h4 className="mb-1 text-xs font-semibold uppercase text-slate-500">Missing information</h4><List items={co.missingInformation} /></div>
        </div> : <Pending />}
      </Section>
      <Section title="D · Stakeholder & Specialist Assignment">
        {st ? <div className="space-y-3">
          <dl>{st.found ? <><Row k="Requester">{st.name} — {st.jobTitle}</Row><Row k="Department">{st.department}</Row><Row k="Location">{st.location}</Row><Row k="Manager">{st.manager ? `${st.manager.name} (${st.manager.jobTitle})` : "—"}</Row></> : <Row k="Requester"><span className="text-amber-700">Unknown — {st.email} not found in directory</span></Row>}</dl>
          {as ? <dl className="border-t border-slate-100 pt-2">
            <Row k="Specialist">{as.specialist ? <b>{as.specialist.name} — {as.specialist.title}</b> : <b className="text-amber-700">Triage queue ({as.triageQueue})</b>}</Row>
            <Row k="Team">{as.team}</Row>{as.escalationCc && <Row k="Suggested cc">{as.escalationCc}</Row>}
            <Row k="Rationale">{as.rationale}</Row>
            {as.manualRoutingRequired && <p role="alert" className="mt-1 rounded bg-amber-50 p-2 text-xs text-amber-800 ring-1 ring-amber-200">Manual routing confirmation required.</p>}</dl> : <Pending text="Awaiting routing…" />}
        </div> : <Pending />}
      </Section>
      <Section title="E · RAG Sources" right={<span className="text-xs font-normal text-slate-500">{sources?.length ?? 0} retrieved · keyword (BM25) search, not vector retrieval</span>}>
        {sources ? <Sources sources={sources} /> : <Pending />}
      </Section>
      {br && <Section title="Case Briefing" right={tag}>
        <div className="space-y-2"><p className="font-semibold">{br.headline}</p><p>{br.situation}</p>
          <div><h4 className="text-xs font-semibold uppercase text-slate-500">Key risks (potential)</h4><List items={br.keyRisks} /></div>
          <div><h4 className="text-xs font-semibold uppercase text-slate-500">Next steps</h4><List items={br.recommendedNextSteps} /></div>
          {br.precedent && <p className="text-slate-700"><b>Precedent:</b> {br.precedent}</p>}
          {br.openQuestions?.length > 0 && <div><h4 className="text-xs font-semibold uppercase text-slate-500">Open questions</h4><List items={br.openQuestions} /></div>}</div>
      </Section>}
    </div>
  );
}

function Sources({ sources }: { sources: RetrievedSource[] }) {
  const types: RetrievedSource["sourceType"][] = ["Category", "Compliance Rule", "Policy", "Historical Case"];
  return <div className="space-y-2">{types.map((t) => {
    const items = sources.filter((s) => s.sourceType === t);
    return <details key={t} className="rounded border border-slate-200" open={t === "Compliance Rule"}>
      <summary className="cursor-pointer select-none px-2 py-1.5 text-sm font-medium">{t}s <Badge className="ml-1 bg-slate-100 text-slate-600 ring-slate-200">{items.length}</Badge></summary>
      <div className="space-y-2 border-t border-slate-100 p-2">{items.length ? items.map((s) => (
        <div key={s.sourceId} className="rounded bg-slate-50 p-2 text-xs"><div className="flex flex-wrap justify-between gap-2"><b className="text-sm">{s.title}</b><span className="font-mono text-slate-500">{s.sourceId}</span></div>
          <p className="mt-1 text-slate-700">{s.excerpt}</p>
          <div className="mt-1 flex items-center gap-2 text-slate-500"><span>Relevance {s.relevance}</span><span className="h-1.5 w-24 overflow-hidden rounded bg-slate-200" aria-hidden><span className="block h-full bg-indigo-500" style={{ width: `${s.relevance * 100}%` }} /></span><span>{s.retrievalMode}</span></div></div>)) : <p className="text-xs text-slate-400">No relevant source found.</p>}</div></details>;
  })}</div>;
}
