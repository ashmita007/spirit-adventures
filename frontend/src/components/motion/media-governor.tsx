"use client";

/**
 * Keeps scrolling smooth by only running what the visitor can see:
 *  - autoplay videos play only while on screen (paused otherwise)
 *  - infinite marquees / CSS loops pause while off screen
 *
 * Works on every page, including content added after navigation.
 */
import { useEffect } from "react";

const LOOP_SELECTOR = ".animate-marquee-left, .animate-marquee-right, .animate-marquee, [data-loop]";

export default function MediaGovernor() {
  useEffect(() => {
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (el instanceof HTMLVideoElement) {
            if (e.isIntersecting) {
              if (el.autoplay || el.dataset.autoplay === "1") {
                el.play().catch(() => undefined);
              }
            } else if (!el.paused) {
              el.dataset.autoplay = "1";
              el.pause();
            }
          } else {
            el.style.animationPlayState = e.isIntersecting ? "running" : "paused";
          }
        }
      },
      { rootMargin: "200px 0px" }
    );

    const scan = (root: ParentNode) => {
      root.querySelectorAll?.(`video, ${LOOP_SELECTOR}`).forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    };

    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const el = n as Element;
          if (el.matches(`video, ${LOOP_SELECTOR}`)) {
            if (!seen.has(el)) {
              seen.add(el);
              io.observe(el);
            }
          }
          scan(el);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
