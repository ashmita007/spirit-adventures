"use client";

import { useEffect, useRef } from "react";

type Mode = "CHRISTMAS" | "NEWYEAR";

interface Flake { x: number; y: number; r: number; vy: number; sway: number; phase: number; depth: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }

const FIREWORK_COLORS = ["#fde68a", "#fbbf24", "#f472b6", "#a78bfa", "#38bdf8", "#ffffff", "#fb7185"];

/**
 * Canvas effects that match the festival:
 *  - Christmas: three depths of snow drifting in a soft wind.
 *  - New Year: firework bursts (gravity, fading trails) plus a few gold sparkles.
 * Light on phones (fewer particles, DPR capped at 2), paused when the tab is hidden,
 * never drawn for reduced-motion visitors. Pointer-events none, so it never blocks taps.
 */
export default function FestiveEffects({ mode }: { mode: Mode }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, running = true, last = performance.now(), nextBurst = 600;
    const small = () => window.innerWidth < 640;
    const flakes: Flake[] = [];
    const sparks: Spark[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const makeFlake = (anywhere: boolean): Flake => {
      const depth = Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2; // 0 far, 2 near
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : -10,
        r: [1.1, 2, 3.2][depth] * (0.75 + Math.random() * 0.5),
        vy: [18, 32, 55][depth] * (0.8 + Math.random() * 0.4),
        sway: [8, 14, 22][depth],
        phase: Math.random() * Math.PI * 2,
        depth,
      };
    };

    const burst = () => {
      const x = w * (0.15 + Math.random() * 0.7);
      const y = h * (0.12 + Math.random() * 0.3);
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      const alt = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      const count = small() ? 34 : 60;
      const speed = small() ? 120 : 170;
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + Math.random() * 0.12;
        const v = speed * (0.55 + Math.random() * 0.45);
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 1.1 + Math.random() * 0.7,
          color: i % 3 ? color : alt, size: 1.4 + Math.random() * 1.2 });
      }
    };

    const seed = () => {
      flakes.length = 0;
      if (mode === "CHRISTMAS") {
        const n = small() ? 45 : 110;
        for (let i = 0; i < n; i++) flakes.push(makeFlake(true));
      }
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);

      if (mode === "CHRISTMAS") {
        const wind = Math.sin(now / 4000) * 12;
        for (const f of flakes) {
          f.phase += dt * (0.8 + f.depth * 0.3);
          f.y += f.vy * dt;
          f.x += (Math.sin(f.phase) * f.sway + wind * (f.depth + 1) * 0.5) * dt;
          if (f.y > h + 10) Object.assign(f, makeFlake(false));
          if (f.x > w + 10) f.x = -10;
          if (f.x < -10) f.x = w + 10;
          ctx.globalAlpha = [0.35, 0.6, 0.9][f.depth];
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        nextBurst -= dt * 1000;
        if (nextBurst <= 0) {
          burst();
          if (Math.random() < 0.35) window.setTimeout(burst, 220);
          nextBurst = (small() ? 2600 : 1900) + Math.random() * 1600;
        }
        ctx.globalCompositeOperation = "lighter";
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.life += dt;
          if (s.life >= s.max) { sparks.splice(i, 1); continue; }
          s.vx *= 1 - 1.6 * dt;
          s.vy = s.vy * (1 - 1.6 * dt) + 70 * dt; // drag + gravity
          const px = s.x, py = s.y;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const fade = 1 - s.life / s.max;
          ctx.globalAlpha = fade;
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.size * fade + 0.3;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(s.x, s.y);
          ctx.stroke();
          if (fade > 0.6 && Math.random() < 0.08) { // twinkle
            ctx.fillStyle = "#fff";
            ctx.fillRect(s.x, s.y, 1.5, 1.5);
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
      else cancelAnimationFrame(raf);
    };

    resize();
    seed();
    raf = requestAnimationFrame(frame);
    const onResize = () => { resize(); seed(); };
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mode]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45]" />;
}
