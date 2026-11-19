export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export const RISK_ORDER: RiskLevel[] = ["Low", "Medium", "High", "Critical"];
export const maxRisk = (a: RiskLevel, b: RiskLevel): RiskLevel =>
  RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;

export type StepStatus = "pending" | "running" | "completed" | "warning" | "failed";
export type SourceType = "Category" | "Compliance Rule" | "Policy" | "Historical Case";
export type RetrievalMode = "vector" | "hybrid" | "keyword-fallback";

export interface Category {
  id: string; name: string; description: string; keywords: string[];
  team: string; defaultPriority: RiskLevel;
}
export interface ComplianceRule {
  id: string; title: string; description: string; category: string;
  keywords: string[]; risk: RiskLevel; recommendedAction: string;
  team: string; sourceRef: string;
}
export interface PolicyDoc {
  id: string; title: string; owner: string; version: string; path: string;
  sections: { heading: string; text: string }[];
}
export interface HistoricalCase {
  id: string; subject: string; requestSummary: string; category: string;
  risk: RiskLevel; team: string; resolution: string; responseSummary: string;
  keywords: string[];
}
/** Mirrors the Microsoft Graph `user` resource (plus optional expertise). */
export interface DirectoryUser {
  id: string; displayName: string; mail: string; department: string;
  jobTitle: string; managerId: string | null; officeLocation: string;
  expertise: string[];
}
export interface Specialist {
  id: string; name: string; title: string; team: string; email: string;
  categories: string[]; expertise: string[]; escalationContact: string;
}

export interface RetrievedSource {
  sourceId: string; sourceType: SourceType; title: string; excerpt: string;
  score: number; relevance: number; retrievalMode: RetrievalMode;
}

export interface EmailInput {
  from: string; to: string; subject: string; body: string; attachmentName?: string;
}

export interface ProviderInfo { name: string; model: string; mode: "live" | "demo" }

export interface StepEvent {
  caseId: string; seq: number; stepId: string; component: string;
  message: string; status: StepStatus; timestamp: string;
  details?: unknown;
  partialResult?: { section: string; data: unknown };
  provider?: ProviderInfo;
}

export type CaseStatus =
  | "New" | "Analysing" | "Analysed" | "Awaiting Information"
  | "Approved / Response Sent (Simulated)" | "Analysis Failed" | "Cancelled";

export interface DraftVersion {
  version: number; type: "response" | "clarification"; to: string; subject: string;
  body: string; origin: "ai" | "manual-edit"; mode: "live" | "demo";
  provider?: string; model?: string; createdAt: string;
}
export interface ApprovalRecord {
  approvedBy: string; approvedAt: string; draftVersion: number; simulatedSend: true;
}

export interface CaseRecord {
  id: string; status: CaseStatus; mode: "live" | "demo";
  provider?: string; model?: string; createdAt: string; updatedAt: string;
  email: EmailInput & { receivedAt: string };
  events: StepEvent[];
  results: Record<string, unknown>;
  drafts: DraftVersion[];
  approval?: ApprovalRecord;
  statusHistory: { status: CaseStatus; at: string }[];
}

export const STEPS: { id: string; component: string; label: string }[] = [
  { id: "intake", component: "Email Intake", label: "Incoming email received" },
  { id: "extract", component: "Email Intelligence Agent", label: "Extracting email content and entities" },
  { id: "directory", component: "Org Directory / Entra ID (Mock)", label: "Identifying requester and organisational information" },
  { id: "rag-categories", component: "RAG Knowledge Base", label: "Searching relevant categories" },
  { id: "rag-rules", component: "RAG Knowledge Base", label: "Retrieving compliance rules" },
  { id: "rag-policies", component: "RAG Knowledge Base", label: "Searching policies and historical cases" },
  { id: "reasoning", component: "AI Reasoning", label: "Assessing email against retrieved knowledge" },
  { id: "compliance", component: "Compliance Engine", label: "Evaluating potential compliance risks" },
  { id: "routing", component: "Specialist Routing", label: "Identifying responsible team and specialist" },
  { id: "briefing", component: "AI Response Generator", label: "Preparing case briefing" },
  { id: "draft", component: "AI Response Generator", label: "Generating draft email" },
];

export function applyPartial(c: { results: Record<string, unknown> }, section: string, data: unknown) {
  c.results[section] = data;
}
