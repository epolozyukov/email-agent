import { Bm25Index } from "./bm25";
import type { KnowledgeBaseService, SharePointService } from "../integration-adapters/interfaces";
import type { RetrievedSource, SourceType } from "@/lib/types";
import { categories } from "@/lib/seed/categories";
import { rules } from "@/lib/seed/rules";
import { historicalCases } from "@/lib/seed/cases";

/** Minimum raw BM25 score; below this we report "no relevant source" instead of padding. */
export const MIN_SCORE = 1.2;
const relevance = (s: number) => Math.round((s / (s + 4)) * 100) / 100;
const trim = (t: string, n = 360) => (t.length > n ? t.slice(0, n).trimEnd() + "…" : t);

interface Chunk { id: string; type: SourceType; title: string; text: string }

export class Bm25KnowledgeBase implements KnowledgeBaseService {
  readonly retrievalMode = "keyword-fallback" as const;
  private chunks = new Map<string, Chunk>();
  private indexes = new Map<SourceType, Bm25Index>();

  constructor(sharePoint: SharePointService) {
    const add = (c: Chunk, boost: string) => { this.chunks.set(c.id, c); (this.pending.get(c.type) ?? this.pending.set(c.type, []).get(c.type)!).push({ id: c.id, text: `${c.title} ${c.text}`, boost }); };
    // "Other" is a catch-all fallback, not a retrievable topic; the classifier may still choose it.
    categories.filter((c) => c.name !== "Other").forEach((c) => add({ id: c.id, type: "Category", title: c.name, text: c.description }, c.keywords.join(" ")));
    rules.forEach((r) => add({ id: r.id, type: "Compliance Rule", title: r.title, text: `${r.description} Recommended: ${r.recommendedAction}` }, r.keywords.join(" ")));
    sharePoint.listDocuments().forEach((d) => d.sections.forEach((s, i) =>
      add({ id: `${d.id}#${i + 1}`, type: "Policy", title: `${d.title} › ${s.heading}`, text: s.text }, "")));
    historicalCases.forEach((h) => add({ id: h.id, type: "Historical Case", title: h.subject, text: `${h.requestSummary} Resolution: ${h.resolution}` }, h.keywords.join(" ")));
    this.pending.forEach((docs, type) => this.indexes.set(type, new Bm25Index(docs)));
  }
  private pending = new Map<SourceType, { id: string; text: string; boost: string }[]>();

  search(type: SourceType, query: string, k: number): RetrievedSource[] {
    const idx = this.indexes.get(type); if (!idx) return [];
    return idx.search(query, k).filter((r) => r.score >= MIN_SCORE).map((r) => this.toSource(r.id, r.score));
  }
  getById(sourceId: string) { return this.chunks.has(sourceId) ? this.toSource(sourceId, 0) : null; }
  private toSource(id: string, score: number): RetrievedSource {
    const c = this.chunks.get(id)!;
    return { sourceId: id, sourceType: c.type, title: c.title, excerpt: trim(c.text), score: Math.round(score * 100) / 100, relevance: relevance(score), retrievalMode: this.retrievalMode };
  }
}
