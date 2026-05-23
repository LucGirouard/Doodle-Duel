"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
type AmbientKind =
  | "cat"
  | "tree"
  | "fish"
  | "leaf"
  | "mushroom"
  | "bird"
  | "flower"
  | "sun"
  | "cloud"
  | "heart"
  | "star"
  | "house";
type AmbientPlacement = { x: number; y: number; size: number; at: number };
const MAX_AMBIENT_DOODLES = 15;
const AMBIENT_VISIBLE_MS = 60000;

export default function DoodleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<Point | null>(null);
  const lastRef = useRef<Point | null>(null);
  const drawingRef = useRef(false);
  const coarsePointerRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const ambientIntervalRef = useRef<number | null>(null);
  const ambientTimeoutsRef = useRef<number[]>([]);
  const ambientPlacementsRef = useRef<AmbientPlacement[]>([]);
  const hueRef = useRef(0);
  const fadeFramesRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      coarsePointerRef.current = window.matchMedia("(pointer: coarse)").matches;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    resize();

    const drawDoodle = (
      from: Point,
      to: Point,
      width: number,
      alpha: number,
    ) => {
      hueRef.current = (hueRef.current + 2.4) % 360;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `hsla(${hueRef.current}, 94%, 50%, ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      ctx.quadraticCurveTo(mx + Math.sin(to.x * 0.02) * 3, my, to.x, to.y);
      ctx.stroke();

      ctx.strokeStyle = `hsla(${(hueRef.current + 42) % 360}, 100%, 72%, ${alpha * 0.7})`;
      ctx.lineWidth = width * 2.1;
      ctx.stroke();
      fadeFramesRef.current = 24;
    };

    const drawAmbientShape = (
      x: number,
      y: number,
      size: number,
      kind: AmbientKind,
      alpha: number,
    ) => {
      hueRef.current = (hueRef.current + 7) % 360;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = `hsla(${hueRef.current}, 70%, 48%, ${alpha})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath();

      if (kind === "cat") {
        ctx.moveTo(x - size * 0.38, y - size * 0.18);
        ctx.lineTo(x - size * 0.2, y - size * 0.48);
        ctx.lineTo(x - size * 0.02, y - size * 0.18);
        ctx.lineTo(x + size * 0.18, y - size * 0.48);
        ctx.lineTo(x + size * 0.38, y - size * 0.18);
        ctx.arc(x, y, size * 0.37, Math.PI * 0.04, Math.PI * 0.96);
        ctx.moveTo(x - size * 0.1, y + size * 0.08);
        ctx.lineTo(x - size * 0.1, y + size * 0.08);
        ctx.moveTo(x + size * 0.1, y + size * 0.08);
        ctx.lineTo(x + size * 0.1, y + size * 0.08);
        ctx.moveTo(x - size * 0.04, y + size * 0.2);
        ctx.lineTo(x + size * 0.04, y + size * 0.2);
        ctx.moveTo(x - size * 0.22, y + size * 0.14);
        ctx.lineTo(x - size * 0.44, y + size * 0.08);
        ctx.moveTo(x - size * 0.22, y + size * 0.2);
        ctx.lineTo(x - size * 0.44, y + size * 0.2);
        ctx.moveTo(x + size * 0.22, y + size * 0.14);
        ctx.lineTo(x + size * 0.44, y + size * 0.08);
        ctx.moveTo(x + size * 0.22, y + size * 0.2);
        ctx.lineTo(x + size * 0.44, y + size * 0.2);
      } else if (kind === "tree") {
        ctx.moveTo(x, y - size * 0.42);
        ctx.lineTo(x - size * 0.3, y);
        ctx.lineTo(x + size * 0.3, y);
        ctx.closePath();
        ctx.moveTo(x, y - size * 0.2);
        ctx.lineTo(x - size * 0.24, y + size * 0.18);
        ctx.lineTo(x + size * 0.24, y + size * 0.18);
        ctx.closePath();
        ctx.moveTo(x, y + size * 0.18);
        ctx.lineTo(x, y + size * 0.42);
        ctx.moveTo(x - size * 0.12, y + size * 0.3);
        ctx.lineTo(x + size * 0.12, y + size * 0.3);
        ctx.moveTo(x - size * 0.22, y + size * 0.12);
        ctx.lineTo(x + size * 0.22, y + size * 0.12);
      } else if (kind === "fish") {
        ctx.ellipse(x, y, size * 0.36, size * 0.2, 0, 0, Math.PI * 2);
        ctx.moveTo(x - size * 0.36, y);
        ctx.lineTo(x - size * 0.58, y - size * 0.16);
        ctx.lineTo(x - size * 0.58, y + size * 0.16);
        ctx.closePath();
        ctx.moveTo(x + size * 0.18, y - size * 0.04);
        ctx.lineTo(x + size * 0.18, y - size * 0.04);
        ctx.moveTo(x - size * 0.12, y);
        ctx.lineTo(x + size * 0.04, y);
        ctx.moveTo(x - size * 0.04, y - size * 0.12);
        ctx.lineTo(x + size * 0.16, y - size * 0.12);
        ctx.moveTo(x - size * 0.04, y + size * 0.12);
        ctx.lineTo(x + size * 0.16, y + size * 0.12);
      } else if (kind === "leaf") {
        ctx.moveTo(x, y - size * 0.44);
        ctx.quadraticCurveTo(
          x + size * 0.35,
          y - size * 0.05,
          x,
          y + size * 0.44,
        );
        ctx.quadraticCurveTo(
          x - size * 0.35,
          y - size * 0.05,
          x,
          y - size * 0.44,
        );
        ctx.moveTo(x, y - size * 0.28);
        ctx.lineTo(x, y + size * 0.28);
        ctx.moveTo(x, y + size * 0.1);
        ctx.quadraticCurveTo(
          x + size * 0.16,
          y - size * 0.02,
          x + size * 0.22,
          y - size * 0.2,
        );
      } else if (kind === "mushroom") {
        ctx.arc(x, y - size * 0.05, size * 0.34, Math.PI, Math.PI * 2);
        ctx.moveTo(x - size * 0.14, y - size * 0.05);
        ctx.lineTo(x - size * 0.14, y + size * 0.34);
        ctx.lineTo(x + size * 0.14, y + size * 0.34);
        ctx.lineTo(x + size * 0.14, y - size * 0.05);
        ctx.moveTo(x - size * 0.08, y - size * 0.2);
        ctx.lineTo(x - size * 0.08, y - size * 0.2);
        ctx.moveTo(x + size * 0.1, y - size * 0.14);
        ctx.lineTo(x + size * 0.1, y - size * 0.14);
      } else if (kind === "bird") {
        ctx.moveTo(x - size * 0.42, y);
        ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.24, x, y);
        ctx.quadraticCurveTo(
          x + size * 0.2,
          y - size * 0.24,
          x + size * 0.42,
          y,
        );
      } else if (kind === "sun") {
        ctx.arc(x, y, size * 0.18, 0, Math.PI * 2);
        for (let i = 0; i < 8; i += 1) {
          const a = (Math.PI * 2 * i) / 8;
          const r1 = size * 0.28;
          const r2 = size * 0.42;
          ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
          ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
        }
      } else if (kind === "cloud") {
        ctx.arc(x - size * 0.16, y, size * 0.13, 0, Math.PI * 2);
        ctx.arc(x, y - size * 0.08, size * 0.17, 0, Math.PI * 2);
        ctx.arc(x + size * 0.2, y, size * 0.14, 0, Math.PI * 2);
        ctx.moveTo(x - size * 0.3, y + size * 0.12);
        ctx.lineTo(x + size * 0.34, y + size * 0.12);
      } else if (kind === "heart") {
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(
          x - size * 0.44,
          y + size * 0.02,
          x - size * 0.38,
          y - size * 0.34,
          x,
          y - size * 0.12,
        );
        ctx.bezierCurveTo(
          x + size * 0.38,
          y - size * 0.34,
          x + size * 0.44,
          y + size * 0.02,
          x,
          y + size * 0.3,
        );
      } else if (kind === "star") {
        const pts = 5;
        for (let i = 0; i <= pts * 2; i += 1) {
          const a = (Math.PI * i) / pts - Math.PI / 2;
          const r = i % 2 === 0 ? size * 0.34 : size * 0.14;
          const px = x + Math.cos(a) * r;
          const py = y + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      } else if (kind === "house") {
        ctx.moveTo(x - size * 0.34, y + size * 0.24);
        ctx.lineTo(x - size * 0.34, y - size * 0.04);
        ctx.lineTo(x, y - size * 0.32);
        ctx.lineTo(x + size * 0.34, y - size * 0.04);
        ctx.lineTo(x + size * 0.34, y + size * 0.24);
        ctx.closePath();
        ctx.moveTo(x - size * 0.1, y + size * 0.24);
        ctx.lineTo(x - size * 0.1, y + size * 0.04);
        ctx.lineTo(x + size * 0.1, y + size * 0.04);
        ctx.lineTo(x + size * 0.1, y + size * 0.24);
        ctx.closePath();
      } else {
        ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
        ctx.moveTo(x - size * 0.34, y);
        ctx.lineTo(x + size * 0.34, y);
        ctx.moveTo(x, y - size * 0.34);
        ctx.lineTo(x, y + size * 0.34);
        ctx.moveTo(x - size * 0.24, y - size * 0.24);
        ctx.lineTo(x + size * 0.24, y + size * 0.24);
        ctx.moveTo(x + size * 0.24, y - size * 0.24);
        ctx.lineTo(x - size * 0.24, y + size * 0.24);
      }

      ctx.stroke();
      ctx.strokeStyle = `hsla(${(hueRef.current + 20) % 360}, 84%, 62%, ${alpha * 0.45})`;
      ctx.lineWidth = 4.2;
      ctx.stroke();
    };

    const drawAmbientDoodle = () => {
      if (drawingRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const safe = 54;
      const now = Date.now();
      ambientPlacementsRef.current = ambientPlacementsRef.current.filter(
        (p) => now - p.at < AMBIENT_VISIBLE_MS,
      );
      if (ambientPlacementsRef.current.length >= MAX_AMBIENT_DOODLES) return;
      const card = document.querySelector(".glass-card") as HTMLElement | null;
      const cardRect = card?.getBoundingClientRect();
      const cardPad = 12;
      const cardLeft = cardRect ? cardRect.left - cardPad : w * 0.3;
      const cardRight = cardRect ? cardRect.right + cardPad : w * 0.7;
      const cardTop = cardRect ? cardRect.top - cardPad : h * 0.2;
      const cardBottom = cardRect ? cardRect.bottom + cardPad : h * 0.8;
      const kinds: AmbientKind[] = [
        "cat",
        "tree",
        "fish",
        "leaf",
        "mushroom",
        "bird",
        "flower",
        "sun",
        "cloud",
        "heart",
        "star",
        "house",
      ];

      for (let spawn = 0; spawn < 1; spawn += 1) {
        if (ambientPlacementsRef.current.length >= MAX_AMBIENT_DOODLES) break;
        let x = safe + Math.random() * Math.max(1, w - safe * 2);
        let y = safe + Math.random() * Math.max(1, h - safe * 2);
        let size = 52 + Math.random() * 26;
        let tries = 0;

        while (tries < 40) {
          const insideCard =
            x > cardLeft && x < cardRight && y > cardTop && y < cardBottom;
          const touchingOther = ambientPlacementsRef.current.some((p) => {
            const dx = p.x - x;
            const dy = p.y - y;
            const distance = Math.hypot(dx, dy);
            const minSpacing = (p.size + size) * 1.2;
            return distance < minSpacing;
          });
          if (!insideCard && !touchingOther) break;

          x = safe + Math.random() * Math.max(1, w - safe * 2);
          y = safe + Math.random() * Math.max(1, h - safe * 2);
          size = 52 + Math.random() * 26;
          tries += 1;
        }

        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const phaseAlphas = [0.12, 0.22, 0.34, 0.42];
        phaseAlphas.forEach((phase, i) => {
          const id = window.setTimeout(
            () => drawAmbientShape(x, y, size, kind, phase),
            i * 130 + spawn * 55,
          );
          ambientTimeoutsRef.current.push(id);
        });
        ambientPlacementsRef.current.push({ x, y, size, at: now });
      }

      fadeFramesRef.current = Math.max(fadeFramesRef.current, 960);
    };

    const loop = () => {
      const pointer = pointerRef.current;
      const last = lastRef.current;

      const canHoverDoodle = !coarsePointerRef.current || drawingRef.current;
      if (pointer && last && canHoverDoodle) {
        drawDoodle(
          last,
          pointer,
          drawingRef.current ? (coarsePointerRef.current ? 4 : 4.8) : 2.4,
          drawingRef.current ? 0.9 : 0.68,
        );
        lastRef.current = pointer;
      } else if (pointer) {
        lastRef.current = pointer;
      }

      if (fadeFramesRef.current > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "rgba(0, 0, 0, 0.0035)";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalCompositeOperation = "source-over";
        fadeFramesRef.current -= 1;
      }
      rafRef.current = window.requestAnimationFrame(loop);
    };

    const setPointer = (x: number, y: number) => {
      pointerRef.current = { x, y };
    };

    const onPointerMove = (event: PointerEvent) => {
      setPointer(event.clientX, event.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      drawingRef.current = true;
      setPointer(event.clientX, event.clientY);
      lastRef.current = pointerRef.current;
    };

    const onPointerUp = () => {
      drawingRef.current = false;
      lastRef.current = pointerRef.current;
    };

    const onLeave = () => {
      pointerRef.current = null;
      lastRef.current = null;
      drawingRef.current = false;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("blur", onLeave);

    rafRef.current = window.requestAnimationFrame(loop);
    ambientIntervalRef.current = window.setInterval(drawAmbientDoodle, 600);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (ambientIntervalRef.current) {
        window.clearInterval(ambientIntervalRef.current);
      }
      ambientTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      ambientTimeoutsRef.current = [];
      ambientPlacementsRef.current = [];
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10"
    />
  );
}
