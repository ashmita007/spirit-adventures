"use client";

import { useEffect, useRef } from "react";
import type { EffectKind } from "@/lib/festivals";

interface Flake { x: number; y: number; r: number; vy: number; sway: number; phase: number; depth: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; size: number }
interface Kite { x: number; y: number; s: number; vx: number; phase: number; a: string; b: string; tilt: number }
interface Petal { x: number; y: number; w: number; h: number; vy: number; rot: number; vr: number; flip: number; phase: number; color: string }
interface Lantern { x: number; y: number; r: number; vy: number; phase: number }

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

/**
 * Canvas effects matched to the festival (lib/festivals.ts):
 *  snow      Christmas: three depths of snow in a soft wind
 *  fireworks New Year: bursts with drag, gravity and fading trails
 *  kites     Sankranti: kites with swaying tails drifting across the sky
 *  petals    Ugadi: marigold and jasmine petals fluttering down
 *  diwali    Diwali: glowing sky lanterns rising + warm fireworks
 * Light on phones (fewer particles, DPR ≤ 2), paused in hidden tabs, never drawn
 * for reduced-motion visitors, pointer-events none so taps always go through.
 */
export default function FestiveEffects({ kind, palette }: { kind: EffectKind; palette: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, running = true, last = performance.now(), nextBurst = 700;
    const small = () => window.innerWidth < 640;
    const colors = palette.length ? palette : ["#ffffff"];
    const flakes: Flake[] = [];
    const sparks: Spark[] = [];
    const kites: Kite[] = [];
    const petals: Petal[] = [];
    const lanterns: Lantern[] = [];

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
      const depth = Math.random() < 0.5 ? 0 : Math.random() < 0.7 ? 1 : 2;
      return { x: rand(0, w), y: anywhere ? rand(0, h) : -10, r: [1.1, 2, 3.2][depth] * rand(0.75, 1.25),
        vy: [18, 32, 55][depth] * rand(0.8, 1.2), sway: [8, 14, 22][depth], phase: rand(0, 6.28), depth };
    };
    const makeKite = (anywhere: boolean): Kite => {
      const s = small() ? rand(14, 24) : rand(18, 34);
      const dir = Math.random() < 0.5 ? 1 : -1;
      return { x: anywhere ? rand(0, w) : dir > 0 ? -60 : w + 60, y: rand(h * 0.08, h * 0.45), s,
        vx: dir * rand(10, 26), phase: rand(0, 6.28), a: pick(colors), b: pick(colors), tilt: rand(-0.25, 0.25) };
    };
    const makePetal = (anywhere: boolean): Petal => ({
      x: rand(0, w), y: anywhere ? rand(0, h) : -20, w: rand(5, 9), h: rand(9, 15), vy: rand(28, 60),
      rot: rand(0, 6.28), vr: rand(-1.5, 1.5), flip: rand(0, 6.28), phase: rand(0, 6.28), color: pick(colors),
    });
    const makeLantern = (anywhere: boolean): Lantern => ({
      x: rand(0, w), y: anywhere ? rand(h * 0.2, h) : h + 30, r: small() ? rand(5, 9) : rand(6, 12),
      vy: rand(14, 30), phase: rand(0, 6.28),
    });

    const burst = (warm = false) => {
      const x = w * rand(0.15, 0.85);
      const y = h * rand(0.1, 0.38);
      const c1 = pick(colors), c2 = pick(colors);
      const count = small() ? 34 : 60;
      const speed = (small() ? 120 : 170) * (warm ? 0.9 : 1);
      for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count + rand(0, 0.12);
        const v = speed * rand(0.55, 1);
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rand(1.1, 1.8),
          color: i % 3 ? c1 : c2, size: rand(1.4, 2.6) });
      }
    };

    const seed = () => {
      flakes.length = kites.length = petals.length = lanterns.length = 0;
      const m = small() ? 0.45 : 1;
      if (kind === "snow") for (let i = 0; i < 110 * m; i++) flakes.push(makeFlake(true));
      if (kind === "kites") for (let i = 0; i < (small() ? 4 : 7); i++) kites.push(makeKite(true));
      if (kind === "petals") for (let i = 0; i < 46 * m; i++) petals.push(makePetal(true));
      if (kind === "diwali") for (let i = 0; i < 18 * m + 4; i++) lanterns.push(makeLantern(true));
    };

    const drawSparks = (dt: number) => {
      ctx.globalCompositeOperation = "lighter";
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.max) { sparks.splice(i, 1); continue; }
        s.vx *= 1 - 1.6 * dt;
        s.vy = s.vy * (1 - 1.6 * dt) + 70 * dt;
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
        if (fade > 0.6 && Math.random() < 0.08) { ctx.fillStyle = "#fff"; ctx.fillRect(s.x, s.y, 1.5, 1.5); }
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const drawKite = (k: Kite, t: number) => {
      const bob = Math.sin(t * 1.3 + k.phase) * 6;
      const sway = Math.sin(t * 0.9 + k.phase) * 0.18 + k.tilt;
      ctx.save();
      ctx.translate(k.x, k.y + bob);
      ctx.rotate(sway);
      const s = k.s;
      // tail
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, s * 1.4);
      for (let i = 1; i <= 12; i++) ctx.lineTo(Math.sin(t * 3 + k.phase + i * 0.6) * (3 + i * 0.6), s * 1.4 + i * s * 0.22);
      ctx.stroke();
      for (let i = 3; i <= 12; i += 3) {
        const bx = Math.sin(t * 3 + k.phase + i * 0.6) * (3 + i * 0.6), by = s * 1.4 + i * s * 0.22;
        ctx.fillStyle = i % 2 ? k.a : k.b;
        ctx.beginPath(); ctx.moveTo(bx - 4, by - 3); ctx.lineTo(bx + 4, by + 3); ctx.lineTo(bx + 4, by - 3); ctx.lineTo(bx - 4, by + 3); ctx.closePath(); ctx.fill();
      }
      // body: two-tone diamond (slightly see-through so headlines stay readable)
      ctx.globalAlpha = 0.78;
      ctx.fillStyle = k.a;
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.8, 0); ctx.lineTo(0, s * 1.4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = k.b;
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(-s * 0.8, 0); ctx.lineTo(0, s * 1.4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s * 1.4); ctx.moveTo(-s * 0.8, 0); ctx.quadraticCurveTo(0, -s * 0.25, s * 0.8, 0); ctx.stroke();
      ctx.restore();
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      const t = now / 1000;
      last = now;
      ctx.clearRect(0, 0, w, h);

      if (kind === "snow") {
        const wind = Math.sin(now / 4000) * 12;
        ctx.fillStyle = "#ffffff";
        for (const f of flakes) {
          f.phase += dt * (0.8 + f.depth * 0.3);
          f.y += f.vy * dt;
          f.x += (Math.sin(f.phase) * f.sway + wind * (f.depth + 1) * 0.5) * dt;
          if (f.y > h + 10) Object.assign(f, makeFlake(false));
          if (f.x > w + 10) f.x = -10;
          if (f.x < -10) f.x = w + 10;
          ctx.globalAlpha = [0.35, 0.6, 0.9][f.depth];
          ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
        }
      }

      if (kind === "fireworks" || kind === "diwali") {
        nextBurst -= dt * 1000;
        if (nextBurst <= 0) {
          burst(kind === "diwali");
          if (Math.random() < 0.35) window.setTimeout(() => burst(kind === "diwali"), 220);
          nextBurst = (small() ? 2600 : 1900) * (kind === "diwali" ? 1.3 : 1) + rand(0, 1600);
        }
      }

      if (kind === "diwali") {
        for (const l of lanterns) {
          l.y -= l.vy * dt;
          l.x += Math.sin(t * 0.8 + l.phase) * 8 * dt;
          if (l.y < -30) Object.assign(l, makeLantern(false));
          const flicker = 0.75 + Math.sin(t * 9 + l.phase) * 0.12 + Math.random() * 0.08;
          const fadeTop = Math.min(1, l.y / (h * 0.25));
          const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 3.2);
          g.addColorStop(0, `rgba(255,214,120,${0.95 * flicker * fadeTop})`);
          g.addColorStop(0.35, `rgba(251,146,60,${0.55 * flicker * fadeTop})`);
          g.addColorStop(1, "rgba(251,146,60,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,237,180,${flicker * fadeTop})`;
          ctx.beginPath(); ctx.ellipse(l.x, l.y, l.r * 0.55, l.r * 0.75, 0, 0, Math.PI * 2); ctx.fill();
        }
      }

      if (kind === "fireworks" || kind === "diwali") drawSparks(dt);

      if (kind === "kites") {
        for (const k of kites) {
          k.x += k.vx * dt;
          if ((k.vx > 0 && k.x > w + 80) || (k.vx < 0 && k.x < -80)) Object.assign(k, makeKite(false));
          drawKite(k, t);
        }
      }

      if (kind === "petals") {
        for (const p of petals) {
          p.phase += dt;
          p.y += p.vy * dt;
          p.x += Math.sin(p.phase * 1.4) * 22 * dt;
          p.rot += p.vr * dt;
          p.flip += dt * 3;
          if (p.y > h + 20) Object.assign(p, makePetal(false));
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.scale(Math.cos(p.flip), 1); // 3D flutter
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = "#fff";
          ctx.beginPath(); ctx.ellipse(-p.w * 0.12, -p.h * 0.1, p.w * 0.16, p.h * 0.3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      running = !document.hidden;
      if (running) { last = performance.now(); raf = requestAnimationFrame(frame); }
      else cancelAnimationFrame(raf);
    };
    const onResize = () => { resize(); seed(); };

    resize();
    seed();
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kind, palette]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45]" />;
}
