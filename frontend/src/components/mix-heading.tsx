import React from "react";
import { cn } from "@/lib/utils";

// Trail under the words: flat, a climb over two peaks to the summit, then flat again.
const TRAIL = "M0 21 H40 L58 8 L70 15 L86 2 L104 18 L118 13 L130 19 H200";

/**
 * The small connecting words inside a big headline: "FIND your next ADVENTURE".
 * Capitals on a mountain trail: once in view the words rise, the trail draws itself under
 * them, a flag pops up on the summit and a hiker walks the trail back and forth.
 * Amber on dark headlines, headline colour on light ones (`data-ground`, set by ScrollFx).
 * Styles in globals.css; reduced motion shows the finished trail, hiker resting on the summit.
 */
export function Small({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      data-sticker-word
      style={style}
      className={cn(
        "sa-trail mx-[0.25em] inline-block align-middle font-display font-black uppercase leading-none tracking-[0.04em] [font-size:max(0.46em,14px)]",
        className
      )}
    >
      <span className="sa-trail-text">{children}</span>
      <svg viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true" focusable="false" className="sa-trail-svg">
        <path className="sa-trail-path" d={TRAIL} pathLength={1} />
        <g className="sa-trail-flag">
          <line x1="86" y1="2" x2="86" y2="-7" />
          <path d="M86 -7 L96 -4.5 L86 -2 Z" />
        </g>
        <circle className="sa-trail-glow" r="7" />
        <circle className="sa-trail-hiker" r="3.6" />
      </svg>
    </span>
  );
}
