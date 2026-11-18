"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { SiteThemeInfo } from "@/lib/api";
import { isPortalPath } from "@/lib/utils";

const DISMISS_KEY = "sa_festive_banner_closed";
const STRIP_H = "36px";

const LOOK = {
  CHRISTMAS: {
    strip: "bg-gradient-to-r from-[#7f1d1d] via-[#b91c1c] to-[#14532d] text-white",
    icon: "🎄",
    pieces: ["❄", "❅", "❆"],
    colors: ["#ffffff", "#e0f2fe", "#ffffff"],
  },
  NEWYEAR: {
    strip: "bg-gradient-to-r from-[#0b1736] via-[#1e1b4b] to-[#0b1736] text-amber-200",
    icon: "🎉",
    pieces: ["✦", "●", "■", "✧"],
    colors: ["#fbbf24", "#f472b6", "#38bdf8", "#a3e635"],
  },
} as const;

/**
 * Festive look set from Owner HQ → Events & Offers → Website theme:
 * a top strip with the owner's message and light snowfall (Christmas) or confetti (New Year).
 */
export default function FestiveTheme({ theme }: { theme: SiteThemeInfo }) {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  const [calm, setCalm] = useState(true);
  const active = theme.active === "CHRISTMAS" || theme.active === "NEWYEAR" ? theme.active : null;
  const portal = isPortalPath(pathname);

  useEffect(() => {
    try {
      setClosed(window.sessionStorage.getItem(DISMISS_KEY) === theme.banner_text);
    } catch {
      /* storage blocked */
    }
    setCalm(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, [theme.banner_text]);

  const showStrip = Boolean(active && !portal && !closed && theme.banner_text);

  useEffect(() => {
    const root = document.documentElement;
    if (active && !portal) root.dataset.festive = active.toLowerCase();
    else delete root.dataset.festive;
    root.style.setProperty("--festive-h", showStrip ? STRIP_H : "0px");
    return () => {
      delete root.dataset.festive;
      root.style.setProperty("--festive-h", "0px");
    };
  }, [active, portal, showStrip]);

  const pieces = useMemo(() => {
    if (!active) return [];
    const look = LOOK[active];
    return Array.from({ length: 22 }, (_, i) => ({
      left: (i * 37) % 100,
      delay: (i * 0.73) % 9,
      duration: 9 + ((i * 1.7) % 7),
      size: 8 + ((i * 5) % 9),
      char: look.pieces[i % look.pieces.length],
      color: look.colors[i % look.colors.length],
      drift: i % 2 ? 30 : -30,
    }));
  }, [active]);

  if (!active || portal) return null;
  const look = LOOK[active];

  const close = () => {
    setClosed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, theme.banner_text);
    } catch {
      /* storage blocked */
    }
  };

  return (
    <>
      {showStrip && (
        <div className={`fixed inset-x-0 top-0 z-[55] flex h-9 items-center justify-center px-10 text-center text-[12px] font-semibold sm:text-sm ${look.strip}`}>
          <Link href={theme.banner_link || "/offers"} className="truncate hover:underline">
            <span aria-hidden="true" className="mr-1.5">{look.icon}</span>
            {theme.banner_text}
            <span aria-hidden="true" className="ml-1.5">→</span>
          </Link>
          <button onClick={close} aria-label="Close festive banner" className="absolute right-2 rounded-full p-1 opacity-80 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {theme.snow && !calm && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] overflow-hidden">
          {pieces.map((p, i) => (
            <span
              key={i}
              className="sa-festive-piece absolute -top-6 select-none"
              style={{
                left: `${p.left}%`,
                fontSize: p.size,
                color: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                ["--drift" as string]: `${p.drift}px`,
                opacity: active === "CHRISTMAS" ? 0.85 : 0.75,
              }}
            >
              {p.char}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
