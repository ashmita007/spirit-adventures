"use client";
import { isPortalPath } from "@/lib/utils";

/**
 * Site-wide GSAP motion engine.
 *
 * Mark up elements with data attributes and this provider animates them on
 * every page (and re-runs on client navigation):
 *
 *   data-anim="hero"         load timeline; children with data-hero-item animate in order
 *   data-anim="heading"      words rise + unblur as the heading scrolls into view
 *   data-anim="fade-up"      fade + rise on enter
 *   data-anim="stagger"      direct children rise in sequence (cards, grids)
 *   data-anim="scrub-words"  words light up one by one, tied to scroll position
 *   data-anim="clip"         image/video scales up into place as you scroll
 *   data-parallax="0.15"     moves at a different speed than the page (fraction of height)
 *   data-hero-bg             hero background: slow zoom-out + darken while scrolling away
 *   data-count="500"         number counts up on enter (data-count-suffix="+", data-count-decimals="1")
 *   data-magnetic            button gently follows the cursor (mouse only)
 *
 * Everything is skipped when the visitor prefers reduced motion. Content is
 * never hidden by CSS alone, so pages stay readable if JS fails.
 */
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const EASE = "expo.out";

function q<T extends Element = HTMLElement>(sel: string): T[] {
  return Array.from(document.querySelectorAll<T>(sel));
}

/**
 * Split pieces inside a gradient-clipped span (bg-clip-text) can't keep the
 * clipped gradient once they are transformed/blurred, so give each piece a solid
 * colour sampled along the same sky gradient. Visually identical, always paints.
 */
const GRADIENT_STOPS = ["#bae6fd", "#7dd3fc", "#ffffff"];
function solidifyGradient(pieces: Element[]) {
  const groups = new Map<Element, HTMLElement[]>();
  pieces.forEach((el) => {
    const host = el.parentElement?.closest(".bg-clip-text");
    if (!host) return;
    if (!groups.has(host)) groups.set(host, []);
    groups.get(host)!.push(el as HTMLElement);
  });
  const mix = gsap.utils.interpolate(GRADIENT_STOPS);
  groups.forEach((els) => {
    els.forEach((el, i) => {
      el.style.color = mix(els.length > 1 ? i / (els.length - 1) : 0) as string;
      el.style.webkitTextFillColor = "currentColor";
    });
  });
}

export default function MotionProvider() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLDivElement>(null);
  const isOwner = isPortalPath(pathname);

  // Native scrolling everywhere: no scroll-jacking, so the wheel/trackpad stays
  // instant. ScrollTrigger reads the real scroll position directly.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  // ---- Per-page animations (rebuilt on every route change) ----
  useGSAP(
    () => {
      if (isOwner) return;
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          finePointer: "(hover: hover) and (pointer: fine)",
        },
        (ctx) => {
          const { motion, finePointer } = ctx.conditions as { motion: boolean; finePointer: boolean };

          // Reading progress bar
          if (progressRef.current) {
            gsap.fromTo(
              progressRef.current,
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: "none",
                scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 },
              }
            );
          }

          if (!motion) {
            // Reduced motion: make sure nothing stays hidden, keep counters as plain numbers
            gsap.set("[data-hero-item]", { opacity: 1 });
            return;
          }

          // 1. Hero load timeline
          q("[data-anim='hero']").forEach((hero) => {
            const tl = gsap.timeline({ defaults: { ease: EASE, duration: 1.1 } });
            const items = Array.from(hero.querySelectorAll<HTMLElement>("[data-hero-item]"));
            items.forEach((item, i) => {
              const at = i === 0 ? 0.15 : "-=0.85";
              if (item.dataset.heroItem === "title") {
                const split = SplitText.create(item, { type: "chars,words", charsClass: "sa-char" });
                solidifyGradient(split.chars);
                gsap.set(item, { opacity: 1 });
                tl.from(
                  split.chars,
                  {
                    yPercent: 110,
                    rotateX: -70,
                    opacity: 0,
                    transformOrigin: "50% 100%",
                    force3D: true,
                    stagger: { each: 0.026, from: "start" },
                    duration: 1.1,
                    clearProps: "transform,opacity",
                  },
                  at
                );
              } else {
                tl.fromTo(item, { opacity: 0, y: 34 }, { opacity: 1, y: 0, force3D: true, clearProps: "transform" }, at);
              }
            });
          });

          // Hero background: cinematic zoom-out + fade as you scroll past
          q("[data-hero-bg]").forEach((bg) => {
            const section = bg.closest("section, [data-anim='hero']") || bg.parentElement!;
            gsap.fromTo(
              bg,
              { scale: 1.12 },
              {
                scale: 1,
                yPercent: 18,
                ease: "none",
                force3D: true,
                scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: 0.6 },
              }
            );
          });
          q("[data-hero-content]").forEach((el) => {
            gsap.to(el, {
              yPercent: -22,
              opacity: 0.15,
              ease: "none",
              scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom top", scrub: 0.6 },
            });
          });

          // 2. Headings: word-by-word rise
          q("[data-anim='heading']").forEach((el) => {
            const split = SplitText.create(el, { type: "words", wordsClass: "sa-word" });
            solidifyGradient(split.words);
            gsap.from(split.words, {
              yPercent: 60,
              opacity: 0,
              rotateX: -35,
              transformOrigin: "50% 100%",
              force3D: true,
              duration: 0.7,
              clearProps: "transform,opacity",
              ease: EASE,
              stagger: 0.045,
              scrollTrigger: { trigger: el, start: "top 95%", once: true },
            });
          });

          // 3. Simple fade-up blocks
          q("[data-anim='fade-up']").forEach((el) => {
            gsap.from(el, {
              y: 28,
              opacity: 0,
              duration: 0.65,
              ease: EASE,
              force3D: true,
              clearProps: "transform,opacity",
              delay: Number(el.dataset.delay || 0),
              scrollTrigger: { trigger: el, start: "top 96%", once: true },
            });
          });

          // 4. Staggered grids / card lists
          q("[data-anim='stagger']").forEach((group) => {
            const kids = Array.from(group.children) as HTMLElement[];
            if (!kids.length) return;
            gsap.set(kids, { opacity: 0, y: 36, scale: 0.98 });
            ScrollTrigger.batch(kids, {
              start: "top 98%",
              once: true,
              interval: 0.05,
              batchMax: 6,
              onEnter: (batch) =>
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.6,
                  ease: EASE,
                  force3D: true,
                  stagger: 0.06,
                  clearProps: "transform",
                }),
            });
          });

          // 5. Scroll-scrubbed word highlight
          q("[data-anim='scrub-words']").forEach((el) => {
            const split = SplitText.create(el, { type: "words", wordsClass: "sa-word" });
            gsap.fromTo(
              split.words,
              { opacity: 0.18 },
              {
                opacity: 1,
                stagger: 0.08,
                ease: "none",
                scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: 0.6 },
              }
            );
          });

          // 6. Clip-path media reveal
          q("[data-anim='clip']").forEach((el) => {
            gsap.fromTo(
              el,
              { scale: 0.88, opacity: 0.6 },
              {
                scale: 1,
                opacity: 1,
                ease: "none",
                force3D: true,
                scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: 0.6 },
              }
            );
          });

          // 7. Parallax layers
          q("[data-parallax]").forEach((el) => {
            const speed = Number(el.dataset.parallax || 0.15);
            gsap.fromTo(
              el,
              { yPercent: -speed * 100 },
              {
                yPercent: speed * 100,
                ease: "none",
                force3D: true,
                scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 },
              }
            );
          });

          // 8. Count-up numbers
          q("[data-count]").forEach((el) => {
            const end = Number(el.dataset.count);
            const decimals = Number(el.dataset.countDecimals || 0);
            const suffix = el.dataset.countSuffix || "";
            const obj = { v: 0 };
            gsap.to(obj, {
              v: end,
              duration: 1.6,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
              onUpdate: () => {
                el.textContent = obj.v.toLocaleString("en-IN", {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                }) + suffix;
              },
            });
          });

          // 9. Magnetic buttons (mouse only)
          if (finePointer) {
            q("[data-magnetic]").forEach((el) => {
              const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
              const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
              const move = (e: PointerEvent) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
                yTo((e.clientY - (r.top + r.height / 2)) * 0.4);
              };
              const leave = () => {
                xTo(0);
                yTo(0);
              };
              el.addEventListener("pointermove", move);
              el.addEventListener("pointerleave", leave);
              ctx.add(() => () => {
                el.removeEventListener("pointermove", move);
                el.removeEventListener("pointerleave", leave);
              });
            });
          }

          // Late-loading images/fonts change layout: recalc trigger positions
          const refresh = () => ScrollTrigger.refresh();
          window.addEventListener("load", refresh);
          document.fonts?.ready.then(refresh);
          const t = setTimeout(refresh, 1200);
          return () => {
            window.removeEventListener("load", refresh);
            clearTimeout(t);
          };
        }
      );

      return () => mm.revert();
    },
    { dependencies: [pathname, isOwner], revertOnUpdate: true }
  );

  if (isOwner) return null;
  return (
    <div
      ref={progressRef}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-brand-sky via-brand-ocean to-brand-sky"
    />
  );
}
