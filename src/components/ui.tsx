"use client";
import type { RiskLevel, StepStatus } from "@/lib/types";

export const RISK_STYLE: Record<RiskLevel, string> = {
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200", Medium: "bg-amber-50 text-amber-800 ring-amber-200",
  High: "bg-orange-50 text-orange-800 ring-orange-300", Critical: "bg-red-50 text-red-700 ring-red-300",
};
export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}>{children}</span>;
}
export const RiskBadge = ({ level }: { level: RiskLevel }) => <Badge className={RISK_STYLE[level]}>{level} risk</Badge>;
export const DemoBadge = () => <Badge className="bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-300">DEMO — not LLM generated</Badge>;
export const AiBadge = () => <Badge className="bg-indigo-50 text-indigo-700 ring-indigo-200">AI-generated</Badge>;

const ICON: Record<StepStatus, { sym: string; cls: string; label: string }> = {
  pending: { sym: "○", cls: "text-slate-400 border-slate-300", label: "Pending" },
  running: { sym: "◌", cls: "text-indigo-600 border-indigo-400 animate-pulse", label: "Running" },
  completed: { sym: "✓", cls: "text-emerald-700 border-emerald-500 bg-emerald-50", label: "Completed" },
  warning: { sym: "!", cls: "text-amber-700 border-amber-500 bg-amber-50", label: "Warning" },
  failed: { sym: "✕", cls: "text-red-700 border-red-500 bg-red-50", label: "Failed" },
};
export function StatusIcon({ status }: { status: StepStatus }) {
  const i = ICON[status];
  return <span role="img" aria-label={i.label} title={i.label} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${i.cls}`}>{i.sym}</span>;
}
export const statusLabel = (s: StepStatus) => ICON[s].label;
export function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (<section className="card"><div className="card-h"><span>{title}</span>{right}</div><div className="p-4 text-sm">{children}</div></section>);
}
export function Pending({ text = "Waiting for analysis…" }: { text?: string }) { return <p className="text-slate-400">{text}</p>; }
