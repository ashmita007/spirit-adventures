import type React from "react";

/** Feeds the pointer position to a card's spotlight layer as CSS variables (mouse only). */
export function trackSpotlight(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/**
 * Classes for the spotlight layer: a soft sky light under the pointer, shown while the
 * parent `.group` is hovered on hover-capable devices. Put it on an aria-hidden span
 * inside a `relative` card that calls `trackSpotlight` on pointer move.
 */
export const SPOTLIGHT =
  "pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 [background:radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,50%),rgba(56,189,248,0.16),transparent_65%)] [@media(hover:hover)]:group-hover:opacity-100";

/** Sticker look for small static labels inside cards: white die-cut edge and a drop shadow. */
export const STICKER_EDGE = "shadow-[0_0_0_2px_#fff,0_6px_12px_-4px_rgba(2,20,40,0.5)]";
