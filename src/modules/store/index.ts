import fs from "node:fs";
import path from "node:path";
import type { CaseRecord } from "@/lib/types";

/** Repository interface so SQLite/Postgres can replace the JSON file later. */
export interface CaseRepository {
  list(): CaseRecord[]; get(id: string): CaseRecord | undefined;
  save(c: CaseRecord): void; clear(): void; nextId(): string;
}
const dir = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
const file = path.join(dir, "cases.json");

class JsonCaseRepository implements CaseRepository {
  private cache: Map<string, CaseRecord> | null = null;
  private load() {
    if (this.cache) return this.cache;
    this.cache = new Map();
    try { for (const c of JSON.parse(fs.readFileSync(file, "utf8")) as CaseRecord[]) this.cache.set(c.id, c); } catch { /* empty */ }
    return this.cache;
  }
  private flush() {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify([...this.load().values()]));
  }
  list() { return [...this.load().values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  get(id: string) { return this.load().get(id); }
  save(c: CaseRecord) { c.updatedAt = new Date().toISOString(); this.load().set(c.id, c); this.flush(); }
  clear() { this.cache = new Map(); this.flush(); }
  // Random suffix: serverless instances do not share a counter, so sequential IDs would collide.
  nextId() {
    for (;;) {
      const id = `CASE-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      if (!this.load().has(id)) return id;
    }
  }
}
const g = globalThis as unknown as { __repo?: CaseRepository };
export const repo: CaseRepository = (g.__repo ??= new JsonCaseRepository());
