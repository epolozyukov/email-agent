const STOP = new Set("a an and are as at be by for from has have i in is it its of on or our please that the their them there these they this to was we were what which who will with you your can could would should us about need any whether".split(" "));
export function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t)).map(stem);
}
function stem(t: string) {
  if (t.length > 5 && t.endsWith("ing")) return t.slice(0, -3);
  if (t.length > 4 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s") && !t.endsWith("ss")) return t.slice(0, -1);
  return t;
}
export interface Bm25Doc { id: string; text: string; boost?: string }
/** Lexical BM25 index. This is keyword search, NOT semantic vector retrieval. */
export class Bm25Index {
  private tf: Map<string, number>[] = []; private len: number[] = [];
  private df = new Map<string, number>(); private avg = 0;
  constructor(private docs: Bm25Doc[], private k1 = 1.4, private b = 0.75) {
    for (const d of docs) {
      const toks = [...tokenize(d.text), ...tokenize(d.boost ?? ""), ...tokenize(d.boost ?? "")];
      const m = new Map<string, number>();
      toks.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1));
      this.tf.push(m); this.len.push(toks.length);
      m.forEach((_, t) => this.df.set(t, (this.df.get(t) ?? 0) + 1));
    }
    this.avg = this.len.reduce((a, b) => a + b, 0) / Math.max(1, this.len.length);
  }
  search(query: string, k: number): { id: string; score: number }[] {
    const q = [...new Set(tokenize(query))]; const N = this.docs.length;
    const out = this.docs.map((d, i) => {
      let score = 0;
      for (const t of q) {
        const f = this.tf[i].get(t); if (!f) continue;
        const idf = Math.log(1 + (N - (this.df.get(t) ?? 0) + 0.5) / ((this.df.get(t) ?? 0) + 0.5));
        score += idf * ((f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * this.len[i]) / this.avg)));
      }
      return { id: d.id, score };
    });
    return out.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
  }
}
