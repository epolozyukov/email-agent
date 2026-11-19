import { NextResponse } from "next/server";
import { integrationStatuses, integrations } from "@/modules/integration-adapters";
import { llmConfig, env } from "@/modules/llm";
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
    llm: {
      // Diagnostics: which variables the server sees (never their values).
      seen: { LLM_PROVIDER: env("LLM_PROVIDER") || "(unset, defaults to groq)", GROQ_API_KEY: env("GROQ_API_KEY") ? "set" : "missing", GROQ_MODEL: env("GROQ_MODEL") ? "set" : "missing (default used)", VERCEL_ENV: process.env.VERCEL_ENV ?? "local" },
      configured: !!primary, mode, provider: primary?.name ?? null, model: primary?.model ?? null, fallback: fallback ? `${fallback.name} / ${fallback.model}` : null },
    knowledge: { categories: categories.length, rules: rules.length, policies: policies.length, policySections: policies.reduce((n, p) => n + p.sections.length, 0), cases: historicalCases.length, users: directoryUsers.length, specialists: specialists.length },
    retrieval: { mode: integrations.kb.retrievalMode, note: "Keyword (BM25) search. Not semantic vector retrieval." },
  });
}
