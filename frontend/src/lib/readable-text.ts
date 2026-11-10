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
export function splitStops(text: string): { icon: string; label: string }[] {
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
  return parts.length >= 3 ? parts : [];
}
