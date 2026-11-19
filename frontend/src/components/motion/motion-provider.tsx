"use client";
import { isPortalPath } from "@/lib/utils";

/**
 * Site-wide GSAP motion engine.
 *
 * Mark up elements with data attributes and this provider animates them on
 * every page (and re-runs on client navigation):
 *
 *   data-hero-item           hero pieces: CSS entrance from first paint (globals.css), staggered by --hi
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
          phone: "(max-width: 767px)",
        },
        (ctx) => {
          const { motion, finePointer, phone } = ctx.conditions as { motion: boolean; finePointer: boolean; phone: boolean };
          // Phones: shorter, flatter moves (no 3D tilts or scale), started as soon as an
          // element peeks in, so content is readable the moment a thumb scroll stops.
          const DUR = phone ? 0.45 : 0.65;

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

          if (!motion) return; // Reduced motion: counters stay plain numbers

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
              yPercent: phone ? 40 : 60,
              opacity: 0,
              rotateX: phone ? 0 : -35,
              transformOrigin: "50% 100%",
              force3D: true,
              duration: phone ? 0.5 : 0.7,
              clearProps: "transform,opacity",
              ease: EASE,
              stagger: phone ? 0.03 : 0.045,
              scrollTrigger: { trigger: el, start: phone ? "top bottom" : "top 95%", once: true },
            });
          });

          // 3. Simple fade-up blocks
          // Tailwind `transition` classes also animate opacity/transform. Left on, the
          // browser eases toward every GSAP frame and the reveal lags and looks washed
          // out, worst on phones. So CSS transitions are paused while GSAP animates.
          const noCss = { transition: "none" };
          q("[data-anim='fade-up']").forEach((el) => {
            gsap.set(el, noCss);
            gsap.from(el, {
              y: phone ? 16 : 28,
              opacity: 0,
              duration: DUR,
              ease: EASE,
              force3D: true,
              clearProps: "transform,opacity,transition",
              delay: phone ? 0 : Number(el.dataset.delay || 0),
              scrollTrigger: { trigger: el, start: phone ? "top bottom" : "top 96%", once: true },
            });
          });

          // 4. Staggered grids / card lists
          q("[data-anim='stagger']").forEach((group) => {
            const kids = Array.from(group.children) as HTMLElement[];
            if (!kids.length) return;
            gsap.set(kids, { ...noCss, opacity: 0, y: phone ? 18 : 36, scale: phone ? 1 : 0.98 });
            ScrollTrigger.batch(kids, {
              start: phone ? "top bottom" : "top 98%",
              once: true,
              interval: 0.05,
              batchMax: 6,
              onEnter: (batch) =>
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: DUR,
                  ease: EASE,
                  force3D: true,
                  stagger: phone ? 0.05 : 0.06,
                  clearProps: "transform,transition",
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
              { scale: phone ? 0.94 : 0.88, opacity: phone ? 1 : 0.6 },
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
