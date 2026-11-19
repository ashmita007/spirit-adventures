"use client";

import React from "react";

/**
 * Wraps a tappable card or button: a press throws a small burst of festive pieces from
 * the press point (snow for Christmas, sparks for Diwali, confetti otherwise) and the
 * click carries on to the link as usual. Pieces are short-lived DOM nodes animated with
 * the Web Animations API. Reduced motion: no burst.
 */
const PIECES: Record<string, string[]> = {
  CHRISTMAS: ["❄", "❅", "✦", "❄"],
  DIWALI: ["✦", "✧", "✺", "✦"],
  DEFAULT: ["●", "■", "▲", "●"],
};
const COLOURS = ["#fcd34d", "#38bdf8", "#fb7185", "#ffffff", "#34d399"];

function burst(x: number, y: number, festival?: string) {
  const set = PIECES[festival || ""] || PIECES.DEFAULT;
  for (let n = 0; n < 18; n++) {
    const el = document.createElement("span");
    el.textContent = set[n % set.length];
    el.setAttribute("aria-hidden", "true");
    Object.assign(el.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      zIndex: "9999",
      pointerEvents: "none",
      fontSize: `${10 + Math.random() * 10}px`,
      color: COLOURS[n % COLOURS.length],
      textShadow: "0 1px 2px rgba(0,0,0,.35)",
    });
    document.body.appendChild(el);
    const angle = (Math.PI * 2 * n) / 18 + Math.random() * 0.4;
    const dist = 60 + Math.random() * 70;
    const anim = el.animate(
      [
        { transform: "translate(-50%,-50%) scale(0.4) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist + 40}px)) scale(1) rotate(${Math.random() * 360}deg)`,
          opacity: 0,
        },
      ],
      { duration: 900 + Math.random() * 300, easing: "cubic-bezier(.16,1,.3,1)" }
    );
    anim.onfinish = () => el.remove();
  }
}

export default function Celebrate({
  festival,
  className,
  children,
}: {
  festival?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={className}
      onClickCapture={(e) => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = e.currentTarget.getBoundingClientRect();
        burst(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, festival);
      }}
    >
      {children}
    </div>
  );
}
