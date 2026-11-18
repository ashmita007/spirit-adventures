/**
 * One place for every festival look. The backend picks which one is active
 * (adventures/promotions.py); this file decides how it looks and moves.
 * To add a festival: add it here and to Promotion.FESTIVAL_CHOICES + GREETINGS.
 */
export type FestivalKey = "CHRISTMAS" | "NEWYEAR" | "SANKRANTI" | "UGADI" | "DIWALI";
export type FestiveTheme = FestivalKey | "NONE";
export type EffectKind = "snow" | "fireworks" | "kites" | "petals" | "diwali";
export type EdgeKind = "fairy" | "shimmer" | "toran" | "diyas" | "kitestring";

export interface FestivalLook {
  name: string;
  emoji: string;
  /** Top strip background + text colour (Tailwind classes) */
  strip: string;
  edge: EdgeKind;
  effect: EffectKind;
  /** Badge gradient on offer cards (CSS) */
  accent: string;
  /** Card edge ring (Tailwind) */
  ring: string;
  /** Section stage: base colour and two ambient glows */
  stage: { bg: string; glowA: string; glowB: string };
  kicker: string;
  title: string;
  titleItalic: string;
  italicColor: string;
  /** Particle palette for the canvas effect */
  palette: string[];
}

export const FESTIVALS: Record<FestivalKey, FestivalLook> = {
  CHRISTMAS: {
    name: "Christmas",
    emoji: "🎄",
    strip: "bg-gradient-to-r from-[#7f1d1d] via-[#b91c1c] to-[#14532d] text-white",
    edge: "fairy",
    effect: "snow",
    accent: "linear-gradient(90deg,#dc2626,#16a34a)",
    ring: "ring-1 ring-inset ring-red-300/40",
    stage: { bg: "#07102a", glowA: "bg-red-600/25", glowB: "bg-emerald-500/20" },
    kicker: "🎄 Christmas at Spirit",
    title: "Festive escapes,",
    titleItalic: "wrapped and ready.",
    italicColor: "text-red-200",
    palette: ["#ffffff"],
  },
  NEWYEAR: {
    name: "New Year",
    emoji: "🎉",
    strip: "bg-gradient-to-r from-[#0b1736] via-[#1e1b4b] to-[#0b1736] text-amber-200",
    edge: "shimmer",
    effect: "fireworks",
    accent: "linear-gradient(90deg,#f59e0b,#ec4899)",
    ring: "ring-1 ring-inset ring-amber-200/45",
    stage: { bg: "#07102a", glowA: "bg-amber-400/20", glowB: "bg-fuchsia-500/20" },
    kicker: "🎉 New Year at Spirit",
    title: "Ring in the year",
    titleItalic: "somewhere wild.",
    italicColor: "text-amber-200",
    palette: ["#fde68a", "#fbbf24", "#f472b6", "#a78bfa", "#38bdf8", "#ffffff", "#fb7185"],
  },
  SANKRANTI: {
    name: "Sankranti",
    emoji: "🪁",
    strip: "bg-gradient-to-r from-[#0369a1] via-[#0ea5e9] to-[#f59e0b] text-white",
    edge: "kitestring",
    effect: "kites",
    accent: "linear-gradient(90deg,#f97316,#0ea5e9)",
    ring: "ring-1 ring-inset ring-sky-200/50",
    stage: { bg: "#06243d", glowA: "bg-sky-400/25", glowB: "bg-amber-400/25" },
    kicker: "🪁 Sankranti at Spirit",
    title: "Harvest skies,",
    titleItalic: "higher trails.",
    italicColor: "text-amber-200",
    palette: ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#facc15"],
  },
  UGADI: {
    name: "Ugadi",
    emoji: "🌿",
    strip: "bg-gradient-to-r from-[#14532d] via-[#15803d] to-[#ca8a04] text-[#fef9c3]",
    edge: "toran",
    effect: "petals",
    accent: "linear-gradient(90deg,#ca8a04,#16a34a)",
    ring: "ring-1 ring-inset ring-yellow-200/45",
    stage: { bg: "#0a2016", glowA: "bg-yellow-400/20", glowB: "bg-emerald-500/25" },
    kicker: "🌿 Ugadi at Spirit",
    title: "A new year,",
    titleItalic: "a fresh trail.",
    italicColor: "text-yellow-200",
    palette: ["#f59e0b", "#fbbf24", "#fb923c", "#fef3c7", "#ffffff"],
  },
  DIWALI: {
    name: "Diwali",
    emoji: "🪔",
    strip: "bg-gradient-to-r from-[#4a0d1f] via-[#9a1e3b] to-[#d97706] text-[#fef3c7]",
    edge: "diyas",
    effect: "diwali",
    accent: "linear-gradient(90deg,#f59e0b,#be185d)",
    ring: "ring-1 ring-inset ring-amber-300/50",
    stage: { bg: "#1a0610", glowA: "bg-amber-500/25", glowB: "bg-rose-600/25" },
    kicker: "🪔 Diwali at Spirit",
    title: "Light up your holidays,",
    titleItalic: "the wild way.",
    italicColor: "text-amber-200",
    palette: ["#fde68a", "#fbbf24", "#f59e0b", "#fb7185", "#f472b6", "#ffffff"],
  },
};

export const FESTIVAL_KEYS = Object.keys(FESTIVALS) as FestivalKey[];

export function festivalLook(key?: string | null): FestivalLook | null {
  return key && key in FESTIVALS ? FESTIVALS[key as FestivalKey] : null;
}
