import { NextResponse } from "next/server";
import { integrationStatuses, integrations } from "@/modules/integration-adapters";
import { llmConfig } from "@/modules/llm";
import { categories } from "@/lib/seed/categories";
import { rules } from "@/lib/seed/rules";
import { policies } from "@/lib/seed/policies";
import { historicalCases } from "@/lib/seed/cases";
import { directoryUsers, specialists } from "@/lib/seed/directory";

export const dynamic = "force-dynamic";
export async function GET() {
  const { primary, fallback, mode } = llmConfig();
  return NextResponse.json({
    integrations: integrationStatuses(),
    llm: { configured: !!primary, mode, provider: primary?.name ?? null, model: primary?.model ?? null, fallback: fallback ? `${fallback.name} / ${fallback.model}` : null },
    knowledge: { categories: categories.length, rules: rules.length, policies: policies.length, policySections: policies.reduce((n, p) => n + p.sections.length, 0), cases: historicalCases.length, users: directoryUsers.length, specialists: specialists.length },
    retrieval: { mode: integrations.kb.retrievalMode, note: "Keyword (BM25) search. Not semantic vector retrieval." },
  });
}
