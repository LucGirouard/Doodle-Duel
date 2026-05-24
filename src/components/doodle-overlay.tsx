"use client";

import { useEffect, useRef } from "react";

type Point = { x: number; y: number };
const EDGE_SCROLL_GUTTER_PX = 56;

export default function DoodleOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<Point | null>(null);
  const lastRef = useRef<Point | null>(null);
  const drawingRef = useRef(false);
  const coarsePointerRef = useRef(false);
  const rafRef = useRef<number | null>(null);
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
      if (coarsePointerRef.current && !drawingRef.current) return;
      if (coarsePointerRef.current && drawingRef.current && event.pointerType === "touch") {
        event.preventDefault();
      }
      setPointer(event.clientX, event.clientY);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (event.pointerType === "touch") {
        const vw = window.innerWidth;
        const inEdgeGutter =
          event.clientX <= EDGE_SCROLL_GUTTER_PX ||
          event.clientX >= vw - EDGE_SCROLL_GUTTER_PX;

        if (inEdgeGutter) {
          drawingRef.current = false;
          pointerRef.current = null;
          lastRef.current = null;
          return;
        }
      }

      drawingRef.current = true;
      if (event.pointerType === "touch" && event.target instanceof Element) {
        event.preventDefault();
        if ("setPointerCapture" in event.target) {
          (event.target as Element & { setPointerCapture: (id: number) => void }).setPointerCapture(event.pointerId);
        }
      }
      setPointer(event.clientX, event.clientY);
      lastRef.current = pointerRef.current;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch" && event.target instanceof Element) {
        if ("releasePointerCapture" in event.target) {
          (event.target as Element & { releasePointerCapture: (id: number) => void }).releasePointerCapture(event.pointerId);
        }
      }
      drawingRef.current = false;
      lastRef.current = pointerRef.current;
    };

    const onLeave = () => {
      pointerRef.current = null;
      lastRef.current = null;
      drawingRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!drawingRef.current) return;
      if (event.touches.length <= 1) {
        event.preventDefault();
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("blur", onLeave);

    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 touch-none"
    />
  );
}
