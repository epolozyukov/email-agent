const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20 };
const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
export interface ResolvedDeadline { phrase: string; resolvedDate: string | null; note: string }

export function addWorkingDays(from: Date, n: number): Date {
  const d = new Date(from); let left = n;
  while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) left--; }
  return d;
}
export function nextWeekday(from: Date, name: string): Date {
  const target = DAYS.indexOf(name.toLowerCase()); const d = new Date(from);
  let diff = (target - d.getDay() + 7) % 7; if (diff === 0) diff = 7;
  d.setDate(d.getDate() + diff); return d;
}
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Deterministic resolver for common relative deadline phrases, relative to the date received. */
export function resolveDeadlines(text: string, received: Date): ResolvedDeadline[] {
  const out: ResolvedDeadline[] = []; const seen = new Set<string>();
  const push = (r: ResolvedDeadline) => { if (!seen.has(r.phrase.toLowerCase())) { seen.add(r.phrase.toLowerCase()); out.push(r); } };
  for (const m of text.matchAll(/\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty)\s+(?:working|business)\s+days?\b/gi)) {
    const n = /^\d/.test(m[1]) ? Number(m[1]) : WORDS[m[1].toLowerCase()];
    push({ phrase: m[0], resolvedDate: iso(addWorkingDays(received, n)), note: `${n} working days counted from date received (${iso(received)}), excluding weekends and ignoring public holidays` });
  }
  for (const m of text.matchAll(/\b(?:by|before|on|until)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi)) {
    push({ phrase: m[0], resolvedDate: iso(nextWeekday(received, m[1])), note: `Next ${m[1]} after date received (${iso(received)}); confirm with sender if a different week is meant` });
  }
  for (const m of text.matchAll(/\b(?:by\s+)?(tomorrow|end of (?:the )?week|asap|immediately)\b/gi)) {
    const t = m[1].toLowerCase();
    push({ phrase: m[0], resolvedDate: t === "tomorrow" ? iso(new Date(received.getTime() + 864e5)) : null, note: t === "tomorrow" ? "Day after date received" : "Ambiguous; clarify the exact date" });
  }
  return out;
}
