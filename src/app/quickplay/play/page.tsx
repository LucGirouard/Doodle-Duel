"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function PlayPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const timerRef = useRef<number | null>(null);

  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const canEdit = timeLeft > 0;

  type Point = { x: number; y: number };
  type Stroke = { color: string; size: number; points: Point[]; erase?: boolean };

  const brushColorRef = useRef(brushColor);
  const brushSizeRef = useRef(brushSize);
  const eraserRef = useRef(isEraser);

  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const redrawRef = useRef<() => void>(() => {});
    // undo history: store full stroke snapshots so undo works after clear
    const undoStackRef = useRef<Stroke[][]>([]);

  useEffect(() => { brushColorRef.current = brushColor }, [brushColor]);
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize]);
  useEffect(() => { eraserRef.current = isEraser }, [isEraser]);

  useEffect(() => {
    if (timeLeft <= 0) {
      isDrawing.current = false;
      currentStrokeRef.current = null;
    }
  }, [timeLeft]);

  useEffect(() => {
    setTimeLeft(90);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          isDrawing.current = false;
          currentStrokeRef.current = null;
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawRef.current();
    };

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDrawing = (e: PointerEvent) => {
      if (timeLeft <= 0) return;
      if (!canEdit) return;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // push current state for undo (snapshot)
        const snapshot = strokesRef.current.map(s => ({ color: s.color, size: s.size, erase: s.erase, points: s.points.slice() }));
        undoStackRef.current.push(snapshot);
        if (undoStackRef.current.length > 100) undoStackRef.current.shift();

        isDrawing.current = true;
        const color = brushColorRef.current;
        const size = brushSizeRef.current;
        const erase = eraserRef.current;
        const p = getPos(e);
        currentStrokeRef.current = { color, size, points: [p], erase };
        ctx.beginPath();
        ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.moveTo(p.x, p.y);
    };

    const draw = (e: PointerEvent) => {
      if (!canEdit || !isDrawing.current || !currentStrokeRef.current || timeLeft <= 0) return;
      const p = getPos(e);
      const stroke = currentStrokeRef.current;
      stroke.points.push(p);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      if (currentStrokeRef.current) {
        strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
        currentStrokeRef.current = null;
      }
      ctx.closePath();
      ctx.globalCompositeOperation = 'source-over';
    };

    const redrawAll = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (const s of strokesRef.current) {
        ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        if (s.points.length === 0) continue;
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (const pt of s.points.slice(1)) ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    redrawRef.current = redrawAll;

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    canvas.addEventListener('pointerdown', startDrawing as any);
    canvas.addEventListener('pointermove', draw as any);
    canvas.addEventListener('pointerup', stopDrawing as any);
    canvas.addEventListener('pointerleave', stopDrawing as any);

    return () => {
      ro.disconnect();
      canvas.removeEventListener('pointerdown', startDrawing as any);
      canvas.removeEventListener('pointermove', draw as any);
      canvas.removeEventListener('pointerup', stopDrawing as any);
      canvas.removeEventListener('pointerleave', stopDrawing as any);
    };
  }, []);

  const clearCanvas = () => {
      if (!canEdit) return;
      // save snapshot so user can undo the clear
      const snapshot = strokesRef.current.map(s => ({ color: s.color, size: s.size, erase: s.erase, points: s.points.slice() }));
      undoStackRef.current.push(snapshot);
      if (undoStackRef.current.length > 100) undoStackRef.current.shift();

      strokesRef.current = [];
      redrawRef.current();
  };

  const undo = () => {
      if (!canEdit) return;
      const last = undoStackRef.current.pop();
      if (last) {
        strokesRef.current = last;
      } else {
        strokesRef.current.pop();
      }
      redrawRef.current();
  };

  const toggleEraser = () => setIsEraser((v) => !v);

    

  return(
    <main className="paper-page">
      <div className="paper-center">
        <section className="paper-shell paper-shell-lg" style={{ maxWidth: "1600px" }}>

          <div className="flex flex-col gap-6">


            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="paper-label">
                  painting room
                </p>

                <h1 className="paper-heading mt-2 text-5xl font-black">
                  Paint time
                </h1>
              </div>

              <div className="flex gap-3">
                <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700">
                  Time left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </div>
                <Link
                  href="/quickplay/create"
                  className="paper-button-secondary px-5"
                >
                  Back to lobby
                </Link>
              </div>
            </div>
            <div className="grid gap-6">


              <div className="paper-card-dashed bg-[#fffef9] p-4 shadow-[0_18px_50px_rgba(80,55,30,0.1)]">

                {/* Toolbar */}

                <div className="mb-4 flex flex-wrap items-center gap-4">

                  {/* Color Picker */}

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-stone-700">
                      Color
                    </label>

                    <input
                      type="color"
                      value={brushColor}
                      disabled={!canEdit}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* Brush Size */}

                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-stone-700">
                      Size
                    </label>

                    <input
                      type="range"
                      min={1}
                      max={40}
                      value={brushSize}
                      disabled={!canEdit}
                      onChange={(e) =>
                        setBrushSize(Number(e.target.value))
                      }
                    />
                  </div>

                  {/* Clear Button */}

                  <button
                    onClick={clearCanvas}
                    disabled={!canEdit}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={undo}
                    disabled={!canEdit}
                    className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Undo
                  </button>

                  <button
                    onClick={toggleEraser}
                    disabled={!canEdit}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${isEraser ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-300'}`}
                  >
                    {isEraser ? 'Eraser (on)' : 'Eraser'}
                  </button>
                </div>

                {/* Canvas */}

                <div className="relative h-[72vh] min-h-[680px] overflow-hidden rounded-[1.5rem] border-2 border-dashed border-stone-300 bg-white">

                  <canvas
                    ref={canvasRef}
                    className="h-full w-full touch-none"
                    style={{ pointerEvents: canEdit ? "auto" : "none" }}
                  />

                  {!canEdit && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-center">
                      <div>
                        <p className="text-2xl font-black text-stone-900">Time is up</p>
                        <p className="mt-2 text-sm text-stone-600">Editing is locked for this round.</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}