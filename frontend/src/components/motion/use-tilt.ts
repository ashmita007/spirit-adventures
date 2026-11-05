"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/**
 * 3D tilt + moving light glare that follows the mouse.
 * Mouse/trackpad only; does nothing on touch or with reduced motion.
 * Put an element with [data-tilt-glare] inside the card for the glare.
 */
export function useTilt(ref: RefObject<HTMLElement | null>, max = 7) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ok =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!ok) return;

    const glare = el.querySelector<HTMLElement>("[data-tilt-glare]");
    gsap.set(el, { transformPerspective: 1000, transformStyle: "preserve-3d" });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });

    if (glare) {
      glare.style.background =
        "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.28), transparent 55%)";
      glare.style.transition = "opacity 0.4s ease";
    }

    // Read layout once per hover, update at most once per frame
    let rect: DOMRect | null = null;
    let frame = 0;
    let lastX = 0;
    let lastY = 0;
    const apply = () => {
      frame = 0;
      if (!rect) return;
      const px = (lastX - rect.left) / rect.width;
      const py = (lastY - rect.top) / rect.height;
      ry((px - 0.5) * max * 2);
      rx(-(py - 0.5) * max * 2);
      if (glare) {
        glare.style.setProperty("--gx", `${px * 100}%`);
        glare.style.setProperty("--gy", `${py * 100}%`);
      }
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
      // The card entrance clears transforms, so set perspective again on each hover
      gsap.set(el, { transformPerspective: 1000 });
      el.style.willChange = "transform";
      if (glare) glare.style.opacity = "1";
    };
    const move = (e: PointerEvent) => {
      if (!rect) enter();
      lastX = e.clientX;
      lastY = e.clientY;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const leave = () => {
      rect = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      rx(0);
      ry(0);
      el.style.willChange = "";
      if (glare) glare.style.opacity = "0";
    };
    const onScroll = () => {
      if (rect) rect = el.getBoundingClientRect();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      if (frame) cancelAnimationFrame(frame);
      gsap.killTweensOf(el);
    };
  }, [ref, max]);
}
