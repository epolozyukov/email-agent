# Enterprise Email Intelligence (MVP prototype)

Simulated AI agent that analyses an incoming email step by step: org-directory lookup (mock Entra ID), RAG over seeded categories / compliance rules / policies / historical cases, compliance assessment, specialist routing, case briefing and an editable draft reply. **Fictional data only. Never sends real email. Not legal advice.** See `enterprise_email_intelligence_agent_spec.md`.

## Run

```bash
npm install
cp .env.example .env.local     # optional: add GROQ_API_KEY for real LLM output
npm run dev                    # http://localhost:3000
npm test                       # golden scenarios (demo mode, no network)
```

- **No `GROQ_API_KEY` → DEMO mode.** Retrieval, directory lookup, rule matching and routing still run for real; analysis text is template-based and every panel/draft carries a "DEMO — not LLM generated" badge.
- **With a key → live mode** (Groq default; optional `LLM_FALLBACK_PROVIDER=openrouter|xai`). Fallbacks are recorded in the activity log, never silent. Email content is sent to the configured provider.
- Cases are stored in `.data/cases.json` locally (`/tmp` on Vercel — ephemeral, see spec §10).

## Layout (modular monolith)

| Module | Path |
|---|---|
| Agent pipeline (11 observable steps, SSE) | `src/modules/agent-orchestrator` |
| LLM providers, retry, JSON repair, fallback | `src/modules/llm` |
| RAG (BM25 keyword retrieval) | `src/modules/rag-service` |
| Integration interfaces + mocks (Email, Directory, SharePoint, Specialists) | `src/modules/integration-adapters` |
| Case repository (JSON file; swap for SQLite/Postgres) | `src/modules/store` |
| Seed data | `src/lib/seed` |
| API routes | `src/app/api` |

## Known limitations vs. spec

- **Retrieval is keyword (BM25), not vector/semantic.** It is labelled as such in the UI and logs. The `KnowledgeBaseService` interface allows a Transformers.js / hosted embedding implementation later.
- **Persistence** is a JSON file behind `CaseRepository` (no SQLite/Postgres yet). Not durable on Vercel.
- **Retry re-runs the whole pipeline** (no per-step resume); SSE reconnect/resume is not implemented, but all events are persisted and viewable via Case History.
- Specialist routing is deterministic code (category → team → expertise); the LLM does not propose assignments.
- UI uses plain Tailwind components (no shadcn/ui). English-only, one email per case, single demo user, no auth.
- Public holidays are ignored when resolving "N working days".
