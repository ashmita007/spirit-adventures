// Display helpers for owner-typed trip text (all caps, emoji-chained day plans).

const SMALL = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to", "via", "with"]);

/** "6D 5N KODAIKANAL & OOTY" -> "6D 5N Kodaikanal & Ooty". Leaves mixed-case text alone. */
export function smartCase(text: string): string {
  if (!text) return text;
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 4 || letters !== letters.toUpperCase()) return text;
  return text
    .toLowerCase()
    .split(/(\s+)/)
    .map((word, i) => {
      if (/^\s+$/.test(word)) return word;
      if (/\d/.test(word)) return word.toUpperCase(); // 6D, 5N, 4X4
      if (i > 0 && SMALL.has(word)) return word;
      return word.replace(/\p{L}/u, (c) => c.toUpperCase());
    })
    .join("");
}

/** "Day 1: Mysore to Ooty" -> "Mysore to Ooty" (the day number is shown separately). */
export function stripDayPrefix(title: string): string {
  return title.replace(/^\s*day\s*\d+\s*[:\-–—.]\s*/i, "").trim() || title;
}

const PICTO = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}][\u{FE0F}\u{200D}\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}]*/gu;

/** Drop decorative emoji at the end of a title. */
export function stripTrailingEmoji(text: string): string {
  return text.replace(new RegExp(`(?:\\s*${PICTO.source})+\\s*$`, "u"), "").trim();
}

/** Remove a leading emoji, e.g. list items that already get a check icon. */
export function stripLeadingEmoji(text: string): string {
  return text.replace(new RegExp(`^\\s*(?:${PICTO.source}\\s*)+`, "u"), "").trim();
}

/**
 * Split "🏛️ Palace 🐘 Forest drive 💦 Falls" into stops. Returns [] when the text is
 * normal prose, so callers fall back to a paragraph.
 */
export function splitStops(text: string, minParts = 3): { icon: string; label: string }[] {
  if (!text || text.includes("\n\n")) return [];
  const parts: { icon: string; label: string }[] = [];
  const re = new RegExp(PICTO.source, "gu");
  let last = 0;
  let icon = "";
  let m: RegExpExecArray | null;
  const push = (label: string) => {
    const clean = label.replace(/\s*[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*$/u, "").replace(/^[\s,;|•-]+|[\s,;|•-]+$/g, "");
    if (clean) parts.push({ icon, label: clean });
  };
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index));
    icon = m[0];
    last = m.index + m[0].length;
  }
  push(text.slice(last));
  return parts.length >= minParts ? parts : [];
}

export type PlanItem =
  | { kind: "group"; label: string }
  | { kind: "step"; icon: string; label: string; excluded: boolean }
  | { kind: "note"; label: string }
  | { kind: "summary"; label: string };

const NOTE_ICONS = new Set(["⚠️", "⚠", "❗", "ℹ️"]);

/**
 * Turn one day's owner-typed description into ordered, readable steps.
 * Emoji-chained text ("🛕 GOLDEN TEMPLE 🌊 CHIKHOLE RESERVOIR") becomes one step
 * per stop; labels ending in ":" become group headings; warning emoji and
 * "(Note: ...)" become notes; long sentences become a closing summary. Plain prose
 * is split into one step per sentence.
 */
export function parseDayPlan(text: string): PlanItem[] {
  const src = (text || "").trim();
  if (!src) return [];

  const startsWithEmoji = new RegExp(`^${PICTO.source}`, "u").test(src);
  const stops = splitStops(src, startsWithEmoji ? 1 : 3);
  if (stops.length === 0) {
    const sentences = splitSentences(src);
    if (sentences.length < 2) return [{ kind: "summary", label: src }];
    return sentences.map((label) => ({ kind: "step", icon: "", label, excluded: false }));
  }

  const items: PlanItem[] = [];
  for (const { icon, label } of stops) {
    const noteMatch = label.match(/^\(?\s*note\s*:\s*(.+?)\)?$/i);
    if (NOTE_ICONS.has(icon) || noteMatch) {
      items.push({ kind: "note", label: (noteMatch ? noteMatch[1] : label).replace(/^\(|\)$/g, "").trim() });
      continue;
    }
    if (/:\s*$/.test(label)) {
      items.push({ kind: "group", label: smartCase(label.replace(/:\s*$/, "").trim()) });
      continue;
    }
    if (label.length > 64 || /!$/.test(label)) {
      items.push({ kind: "summary", label: label.replace(/\s+/g, " ") });
      continue;
    }
    const excluded = /\(\s*excluded\s*\)/i.test(label);
    const clean = label.replace(/\(\s*excluded\s*\)/i, "").replace(/\s{2,}/g, " ").trim();
    items.push({ kind: "step", icon, label: smartCase(clean), excluded });
  }
  return items;
}

const ABBREVIATIONS = /(?:\b(?:approx|appx|min|mins|hr|hrs|km|kms|ft|no|vs|etc|st|mt|dr|mr|mrs|ms)|\b[a-z]\.[a-z]|\d)\.$/i;

/**
 * Split prose into sentences on ". " / "! " / "? " before a capital or digit, but not
 * after abbreviations ("approx.", "a.m.", "5 km.") and without regex lookbehind
 * (unsupported on older Safari).
 */
function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\n+/)) {
    let buf = "";
    const tokens = line.split(/(\s+)/);
    tokens.forEach((tok, i) => {
      buf += tok;
      const next = tokens[i + 2];
      if (/\s+/.test(tok) || !/[.!?]$/.test(tok) || !next || !/^[A-Z0-9]/.test(next)) return;
      if (tok.endsWith(".") && ABBREVIATIONS.test(tok)) return;
      out.push(buf.trim());
      buf = "";
    });
    if (buf.trim()) out.push(buf.trim());
  }
  // Drop a sentence-final full stop, but keep the one that ends "a.m." / "p.m.".
  return out.map((s) => (/\b[a-z]\.[a-z]\.$/i.test(s) ? s : s.replace(/\.$/, ""))).filter(Boolean);
}

/**
 * Owner HQ sometimes types a desk number into a team member's role:
 * "Sales Executive   Contact: 733 709 3116". Split it into a clean title and a
 * dialable number (Indian 10-digit numbers get +91). Title casing is tidied.
 */
export function parseTeamRole(role: string): { title: string; phone?: { display: string; tel: string } } {
  const raw = (role || "").replace(/\s+/g, " ").trim();
  const m = raw.match(/^(.*?)(?:\s*[,|-]?\s*(?:contact|ph|phone|mob|mobile)\s*[:.-]?\s*)([+\d][\d\s-]{6,})$/i);
  const titleRaw = (m ? m[1] : raw).trim();
  const title = titleRaw.replace(/\b([a-z])/g, (c) => c.toUpperCase());
  if (!m) return { title };
  const digits = m[2].replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (local.length !== 10) return { title };
  return { title, phone: { display: `+91 ${local.slice(0, 5)} ${local.slice(5)}`, tel: `+91${local}` } };
}
