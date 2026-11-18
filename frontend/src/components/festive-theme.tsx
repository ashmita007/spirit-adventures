"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { SiteThemeInfo } from "@/lib/api";
import { isPortalPath } from "@/lib/utils";
import FestiveEffects from "@/components/festive-effects";
import { FESTIVALS, type FestivalKey, type EdgeKind } from "@/lib/festivals";

const EDGE_CLASS: Record<EdgeKind, string> = {
  fairy: "sa-edge-fairy absolute inset-x-0 -bottom-[5px] h-2.5",
  diyas: "sa-edge-diyas absolute inset-x-0 -bottom-[7px] h-3.5",
  toran: "sa-edge-toran absolute inset-x-0 -bottom-[9px] h-3",
  kitestring: "sa-edge-kites absolute inset-x-0 -bottom-[6px] h-3",
  shimmer: "sa-shimmer absolute inset-0",
};

const DISMISS_KEY = "sa_festive_banner_closed";
const STRIP_H = "36px";

/**
 * Festive look set from Owner HQ → Events & Offers → Website theme:
 * a top strip in the festival's colours with its own edge decoration (fairy lights, diyas,
 * mango-leaf thoranam, kite string, shimmer) and a matching canvas effect (lib/festivals.ts).
 */
export default function FestiveTheme({ theme }: { theme: SiteThemeInfo }) {
  const pathname = usePathname();
  const [closed, setClosed] = useState(false);
  const [calm, setCalm] = useState(true);
  const active = theme.active in FESTIVALS ? (theme.active as FestivalKey) : null;
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

  if (!active || portal) return null;
  const look = FESTIVALS[active];

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
        <div className={`fixed inset-x-0 top-0 z-[55] flex h-9 items-center overflow-visible justify-center px-10 text-center text-[12px] font-semibold sm:text-sm ${look.strip}`}>
          <span aria-hidden="true" className={`pointer-events-none ${EDGE_CLASS[look.edge]}`} />
          <Link href={theme.banner_link || "/offers"} className="relative truncate hover:underline">
            <span aria-hidden="true" className="mr-1.5">{look.emoji}</span>
            {theme.banner_text}
            <span aria-hidden="true" className="ml-1.5">→</span>
          </Link>
          <button onClick={close} aria-label="Close festive banner" className="absolute right-2 rounded-full p-1 opacity-80 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {theme.snow && !calm && <FestiveEffects kind={look.effect} palette={look.palette} />}
    </>
  );
}
