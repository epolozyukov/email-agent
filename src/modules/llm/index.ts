import type { ZodType, ZodTypeDef } from "zod";
import type { ProviderInfo } from "@/lib/types";

export interface LLMRequest<T> {
  task: string; system: string; prompt: string; schema: ZodType<T, ZodTypeDef, unknown>;
  /** Used only when no provider is configured (demo mode). Built from real retrieval/directory results. */
  demo: () => unknown;
}
export interface LLMResult<T> { data: T; provider: ProviderInfo; notes: string[] }

interface ProviderConfig { name: "groq" | "openrouter" | "xai"; apiKey: string; baseUrl: string; model: string }

/** Reads an env var tolerant of pasted quotes, trailing whitespace/newlines and inline "# comments". */
export function env(name: string): string {
  return (process.env[name] ?? "").split(/\s+#/)[0].trim().replace(/^["']|["']$/g, "").trim();
}

function cfg(name: string): ProviderConfig | null {
  const E = new Proxy({} as Record<string, string>, { get: (_t, k: string) => env(k) });
  if (name === "groq") return E.GROQ_API_KEY ? { name, apiKey: E.GROQ_API_KEY, baseUrl: E.GROQ_BASE_URL || "https://api.groq.com/openai/v1", model: E.GROQ_MODEL || "llama-3.3-70b-versatile" } : null;
  if (name === "openrouter") return E.OPENROUTER_API_KEY ? { name, apiKey: E.OPENROUTER_API_KEY, baseUrl: E.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1", model: E.OPENROUTER_MODEL || "openrouter/free" } : null;
  if (name === "xai") return E.XAI_API_KEY && E.XAI_MODEL ? { name, apiKey: E.XAI_API_KEY, baseUrl: E.XAI_BASE_URL || "https://api.x.ai/v1", model: E.XAI_MODEL } : null;
  return null;
}
export function llmConfig() {
  const primary = cfg((env("LLM_PROVIDER") || "groq").toLowerCase());
  const fallback = env("LLM_FALLBACK_PROVIDER") ? cfg(env("LLM_FALLBACK_PROVIDER").toLowerCase()) : null;
  return { primary, fallback, mode: (primary ? "live" : "demo") as "live" | "demo" };
}
export function providerInfo(): ProviderInfo {
  const { primary } = llmConfig();
  return primary ? { name: primary.name, model: primary.model, mode: "live" } : { name: "demo", model: "template-based (no LLM)", mode: "demo" };
}

class ProviderError extends Error { constructor(msg: string, public status?: number, public retryable = false) { super(msg); } }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callOnce(p: ProviderConfig, messages: { role: string; content: string }[]): Promise<string> {
  const timeout = Number(env("LLM_TIMEOUT_MS")) || 30000;
  const body: Record<string, unknown> = { model: p.model, messages, temperature: 0.2, max_tokens: 2000 };
  if (p.name !== "openrouter") body.response_format = { type: "json_object" };
  // gpt-oss models spend tokens on hidden reasoning; keep it low to save free-tier tokens and latency.
  if (p.name === "groq" && /gpt-oss/.test(p.model)) body.reasoning_effort = "low";
  let res: Response;
  try {
    res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
      body: JSON.stringify(body), signal: AbortSignal.timeout(timeout),
    });
  } catch (e) { throw new ProviderError(`${p.name} request failed: ${(e as Error).message}`, undefined, true); }
  if (!res.ok) {
    const text = (await res.text()).slice(0, 400);
    // Prefer the Retry-After header; Groq also states "try again in 1.755s" / "in 2m3.5s" in the message.
    const m = text.match(/try again in (?:(\d+)m)?(\d+(?:\.\d+)?)s/i);
    const retryAfter = Number(res.headers.get("retry-after")) || (m ? Number(m[1] ?? 0) * 60 + Number(m[2]) + 0.5 : 0);
    const err = new ProviderError(`${p.name} HTTP ${res.status}: ${text}`, res.status, res.status === 429 || res.status >= 500);
    (err as ProviderError & { retryAfter?: number }).retryAfter = retryAfter;
    throw err;
  }
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new ProviderError(`${p.name} returned no content`, res.status, true);
  return content;
}

async function callWithRetry(p: ProviderConfig, messages: { role: string; content: string }[], notes: string[]) {
  for (let attempt = 0; ; attempt++) {
    try { return await callOnce(p, messages); }
    catch (e) {
      const err = e as ProviderError & { retryAfter?: number };
      if (!err.retryable || attempt >= 4) throw err;
      const wait = Math.min(20000, (err.retryAfter ? err.retryAfter * 1000 : 1000 * 2 ** attempt));
      if (err.retryAfter && err.retryAfter * 1000 > 20000) throw err; // too long to wait inside a request
      notes.push(`${p.name}: ${err.status === 429 ? "rate limited (429)" : "transient error"}, retrying in ${Math.round(wait / 100) / 10}s`);
      await sleep(wait);
    }
  }
}

export function extractJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
  try { return JSON.parse(t); } catch { /* fall through */ }
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s >= 0 && e > s) return JSON.parse(t.slice(s, e + 1));
  throw new Error("No JSON object found");
}

async function structured<T>(p: ProviderConfig, req: LLMRequest<T>, notes: string[]): Promise<T> {
  const messages = [{ role: "system", content: req.system }, { role: "user", content: req.prompt }];
  const raw = await callWithRetry(p, messages, notes);
  const attempt = (r: string) => { const parsed = req.schema.safeParse(extractJson(r)); if (!parsed.success) throw new Error(parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")); return parsed.data; };
  try { return attempt(raw); }
  catch (e) {
    notes.push(`${req.task}: invalid structured output (${(e as Error).message.slice(0, 160)}); attempting one repair`);
    const repaired = await callWithRetry(p, [...messages, { role: "assistant", content: raw }, { role: "user", content: `Your previous JSON failed validation: ${(e as Error).message}. Return ONLY corrected valid JSON matching the required schema.` }], notes);
    return attempt(repaired);
  }
}

/** Runs a structured task on primary provider, then optional fallback (never silent), or demo when unconfigured. */
export async function runStructured<T>(req: LLMRequest<T>): Promise<LLMResult<T>> {
  const { primary, fallback } = llmConfig();
  const notes: string[] = [];
  if (!primary) {
    const parsed = req.schema.parse(req.demo());
    return { data: parsed, provider: providerInfo(), notes: ["DEMO mode: output is template-based, not LLM generated"] };
  }
  try {
    return { data: await structured(primary, req, notes), provider: { name: primary.name, model: primary.model, mode: "live" }, notes };
  } catch (e) {
    if (!fallback) throw e;
    notes.push(`WARNING: ${primary.name} failed (${(e as Error).message.slice(0, 140)}). Falling back to ${fallback.name} / ${fallback.model}`);
    return { data: await structured(fallback, req, notes), provider: { name: fallback.name, model: fallback.model, mode: "live" }, notes };
  }
}
