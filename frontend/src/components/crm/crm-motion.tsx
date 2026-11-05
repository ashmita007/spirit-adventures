"use client";

/**
 * GSAP motion for the CRM. Transform + opacity only, so it stays at 60fps
 * on office laptops and phones.
 *
 *   [data-crm-reveal]        rises in on page load (in DOM order)
 *   [data-crm-stagger] > *   each child rises in, one after another
 *   table rows (tbody tr)    cascade in whenever the table (re)renders
 *   [role=dialog], drawers   pop / slide in when they open
 *
 * Skipped entirely when the user prefers reduced motion.
 */
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function CrmMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-crm-nav]", { y: -24, opacity: 0, duration: 0.7, ease: "power3.out", clearProps: "transform,opacity" });
    });

    const animated = new WeakSet<Element>();
    let pendingRows: Element[] = [];
    let pendingBlocks: Element[] = [];
    let frame = 0;

    const flush = () => {
      frame = 0;
      const rows = pendingRows.filter((el) => el.isConnected);
      const blocks = pendingBlocks.filter((el) => el.isConnected);
      pendingRows = [];
      pendingBlocks = [];
      if (blocks.length) {
        gsap.fromTo(
          blocks,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: "expo.out", stagger: 0.07, clearProps: "transform,opacity" }
        );
      }
      if (rows.length) {
        gsap.fromTo(
          rows.slice(0, 25),
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.035, clearProps: "transform,opacity" }
        );
      }
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const scan = (root: ParentNode) => {
      root.querySelectorAll?.("[data-crm-reveal]").forEach((el) => {
        if (animated.has(el)) return;
        animated.add(el);
        pendingBlocks.push(el);
      });
      root.querySelectorAll?.("[data-crm-stagger] > *").forEach((el) => {
        if (animated.has(el)) return;
        animated.add(el);
        pendingBlocks.push(el);
      });
      root.querySelectorAll?.("[data-crm-fade]").forEach((el) => {
        if (animated.has(el)) return;
        animated.add(el);
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out", clearProps: "opacity" });
      });
      root.querySelectorAll?.("tbody tr, [data-crm-row]").forEach((el) => {
        if (animated.has(el)) return;
        animated.add(el);
        pendingRows.push(el);
      });
      root.querySelectorAll?.("[data-crm-pop]").forEach((el) => {
        if (animated.has(el)) return;
        animated.add(el);
        gsap.fromTo(
          el,
          { y: 24, scale: 0.97, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.4)", clearProps: "transform,opacity" }
        );
      });
      root.querySelectorAll?.("[data-crm-drawer]").forEach((el) => {
        if (animated.has(el)) return;
        animated.add(el);
        gsap.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: 0.55, ease: "expo.out", clearProps: "transform" });
      });
      queue();
    };

    scan(document);
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const el = n as Element;
          // The node itself may be a row or marked block
          if (el.matches("tbody tr, [data-crm-row], [data-crm-reveal], [data-crm-pop], [data-crm-drawer], [data-crm-fade], [data-crm-stagger] > *")) {
            const wrap = el.parentElement || document;
            scan(wrap);
          } else {
            scan(el);
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      if (frame) cancelAnimationFrame(frame);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
