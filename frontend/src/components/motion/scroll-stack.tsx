"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Stacking sections: as each section scrolls up over the one before, the earlier one
 * shrinks back, rounds its corners and dims, so the page reads as a pile of cards.
 * The navy backdrop shows in the gap. Children clip with overflow: clip (not hidden),
 * so sticky content inside them keeps working. Nothing is pinned, so tall sections scroll
 * normally and every word stays readable. Reduced motion: no effect.
 */
export default function ScrollStack({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const node = root.current;
      if (!node) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = Array.from(node.children) as HTMLElement[];
        items.forEach((el, i) => {
          const next = items[i + 1];
          if (!next) return;
          el.style.transformOrigin = "50% 100%";
          gsap
            .timeline({
              scrollTrigger: { trigger: next, start: "top bottom", end: "top 25%", scrub: 0.5 },
            })
            .to(el, { scale: 0.94, borderRadius: 32, opacity: 0.55, ease: "none" }, 0)
            .fromTo(next, { borderTopLeftRadius: 40, borderTopRightRadius: 40 }, { borderTopLeftRadius: 0, borderTopRightRadius: 0, ease: "none" }, 0);
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="bg-brand-navy [&>*]:relative [&>*]:overflow-clip">
      {children}
    </div>
  );
}
