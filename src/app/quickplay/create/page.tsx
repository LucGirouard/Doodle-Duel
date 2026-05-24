"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import {
  PrimaryButton,
  PrimaryLinkButton,
} from "@/components/ui/primary-button";
import { DAILY_DRAW_SECONDS, ROUTES } from "@/lib/constants";
import { getDailyTheme } from "@/lib/daily-theme";
import { getLocalDayKey, getLocalDayRange } from "@/lib/day";
import { supabase } from "@/lib/supabase";

type Point = { x: number; y: number };
type Stroke = { color: string; size: number; points: Point[]; erase?: boolean };

function cloneStrokes(strokes: Stroke[]) {
  return strokes.map((s) => ({
    color: s.color,
    size: s.size,
    erase: s.erase,
    points: s.points.slice(),
  }));
}

export default function DailyDrawPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const [brushColor, setBrushColor] = useState("#7c2d12");
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(DAILY_DRAW_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [canUndo, setCanUndo] = useState(false);

  const brushColorRef = useRef(brushColor);
  const brushSizeRef = useRef(brushSize);
  const eraserRef = useRef(isEraser);
  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const redrawRef = useRef<() => void>(() => {});
  const undoStackRef = useRef<Stroke[][]>([]);
  const canEditRef = useRef(true);

  const locked = submitted || secondsLeft === 0;
  const canEdit = !locked;

  useEffect(() => {
    brushColorRef.current = brushColor;
  }, [brushColor]);
  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);
  useEffect(() => {
    eraserRef.current = isEraser;
  }, [isEraser]);
  useEffect(() => {
    canEditRef.current = canEdit;
  }, [canEdit]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = `/auth?mode=login&next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);

      const { startIso, endIso } = getLocalDayRange();

      const { data: existing } = await supabase
        .from("artworks")
        .select("id")
        .eq("user_id", uid)
        .gte("created_at", startIso)
        .lt("created_at", endIso)
        .maybeSingle();

      if (existing) setSubmitted(true);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (loading || submitted) return;
    const id = window.setInterval(() => {
      setSecondsLeft((p) => {
        if (p <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [loading, submitted]);

  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
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
      if (!canEditRef.current) return;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const snapshot = cloneStrokes(strokesRef.current);
      undoStackRef.current.push(snapshot);
      if (undoStackRef.current.length > 100) undoStackRef.current.shift();
      setCanUndo(undoStackRef.current.length > 0);

      isDrawingRef.current = true;
      const color = brushColorRef.current;
      const size = brushSizeRef.current;
      const erase = eraserRef.current;
      const p = getPos(e);
      currentStrokeRef.current = { color, size, points: [p], erase };
      ctx.beginPath();
      ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.moveTo(p.x, p.y);
    };

    const draw = (e: PointerEvent) => {
      if (
        !canEditRef.current ||
        !isDrawingRef.current ||
        !currentStrokeRef.current
      )
        return;
      const p = getPos(e);
      currentStrokeRef.current.points.push(p);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      if (currentStrokeRef.current) {
        strokesRef.current = [...strokesRef.current, currentStrokeRef.current];
        currentStrokeRef.current = null;
      }
      ctx.closePath();
      ctx.globalCompositeOperation = "source-over";
    };

    const redrawAll = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "#fffaf1";
      ctx.fillRect(0, 0, rect.width, rect.height);
      for (const s of strokesRef.current) {
        ctx.globalCompositeOperation = s.erase
          ? "destination-out"
          : "source-over";
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        if (s.points.length === 0) continue;
        ctx.moveTo(s.points[0].x, s.points[0].y);
        for (const pt of s.points.slice(1)) ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    redrawRef.current = redrawAll;
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);

    canvas.addEventListener("pointerdown", startDrawing);
    window.addEventListener("pointermove", draw);
    window.addEventListener("pointerup", stopDrawing);
    window.addEventListener("pointercancel", stopDrawing);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", startDrawing);
      window.removeEventListener("pointermove", draw);
      window.removeEventListener("pointerup", stopDrawing);
      window.removeEventListener("pointercancel", stopDrawing);
    };
  }, [loading]);

  const clearCanvas = () => {
    if (!canEdit) return;
    const snapshot = cloneStrokes(strokesRef.current);
    undoStackRef.current.push(snapshot);
    if (undoStackRef.current.length > 100) undoStackRef.current.shift();
    setCanUndo(undoStackRef.current.length > 0);
    strokesRef.current = [];
    redrawRef.current();
  };

  const undo = () => {
    if (!canEdit) return;
    if (!undoStackRef.current.length) return;
    const last = undoStackRef.current.pop();
    if (!last) return;
    strokesRef.current = last;
    setCanUndo(undoStackRef.current.length > 0);
    redrawRef.current();
  };

  const toggleEraser = () => setIsEraser((v) => !v);
  const toolButtonClass =
    "rounded-full border border-stone-400 bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-800 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50";

  const submit = useCallback(
    async (force = false) => {
      if ((!canEdit && !force) || !userId) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const blob = await new Promise<Blob | null>((res) =>
        canvas.toBlob(res, "image/png"),
      );
      if (!blob) return;

      const filePath = `${userId}/${getLocalDayKey()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(filePath, blob, { upsert: true, contentType: "image/png" });
      if (uploadError) {
        alert("Upload failed: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("artworks")
        .getPublicUrl(filePath);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();

      const { error: insertError } = await supabase.from("artworks").insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        elo: 1000,
        username: profile?.username ?? "Anonymous",
      });
      if (insertError) {
        alert("Save failed: " + insertError.message);
        return;
      }

      setSubmitted(true);
    },
    [canEdit, userId],
  );

  useEffect(() => {
    if (secondsLeft === 0 && !submitted && userId) {
      const id = window.setTimeout(() => {
        void submit(true);
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [secondsLeft, submit, submitted, userId]);

  if (loading) return null;

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const dailyTheme = getDailyTheme();

  return (
    <PageShell maxWidth="4xl">
      <PageCard className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <PrimaryLinkButton
          href={ROUTES.quickplay}
          className="mb-5 w-fit border-stone-400 bg-stone-100 px-4 py-2 text-xs text-stone-800 hover:bg-stone-200"
        >
          Back
        </PrimaryLinkButton>
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">
          daily draw
        </p>
        <PageTitle className="mt-4 text-4xl sm:text-5xl">
          Draw and submit today&apos;s entry
        </PageTitle>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          You have one official 2-minute submission each day. After submitting,
          your drawing enters Rate It voting.
        </p>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-stone-700">
          Today&apos;s theme: {dailyTheme}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-stone-300 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700">
            Time left: {minutes}:{seconds}
          </div>
          {submitted ? (
            <div className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              Today&apos;s submission is locked
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex w-full flex-wrap items-center gap-2 rounded-2xl border border-stone-300 bg-white/75 px-3 py-2 sm:w-auto sm:rounded-full">
            <label className="text-xs font-semibold text-stone-700">
              Color
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                "#7c2d12",
                "#dc2626",
                "#f97316",
                "#16a34a",
                "#2563eb",
                "#7c3aed",
                "#000000",
                "#ffffff",
              ].map((c) => (
                <button
                  key={c}
                  disabled={!canEdit}
                  onClick={() => {
                    setBrushColor(c);
                    setIsEraser(false);
                  }}
                  className="h-5 w-5 rounded-full border-2 transition disabled:cursor-not-allowed disabled:opacity-50 sm:h-6 sm:w-6"
                  style={{
                    backgroundColor: c,
                    borderColor: brushColor === c ? "#92400e" : "#d6d3d1",
                    boxShadow:
                      brushColor === c ? "0 0 0 2px #fef3c7" : undefined,
                  }}
                />
              ))}
              <label
                className="relative h-5 w-5 cursor-pointer rounded-md border-2 border-stone-300 transition sm:h-6 sm:w-6"
                style={{
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
                }}
                title="Custom color"
              >
                <span
                  className="block h-full w-full rounded-[4px]"
                  style={{ backgroundColor: brushColor }}
                />
                <input
                  type="color"
                  value={brushColor}
                  disabled={!canEdit}
                  onChange={(e) => {
                    setBrushColor(e.target.value);
                    setIsEraser(false);
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
              </label>
            </div>
            <label className="text-xs font-semibold text-stone-700 sm:ml-2">
              Size
            </label>
            <input
              type="range"
              min={1}
              max={40}
              value={brushSize}
              disabled={!canEdit}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="h-8 w-24 accent-amber-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-28 md:w-32"
            />
            <span className="w-7 rounded-full bg-stone-100 px-1.5 py-0.5 text-center text-[11px] font-semibold text-stone-700">
              {brushSize}
            </span>
          </div>
          <div className="grid w-full grid-cols-3 gap-2 sm:ml-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2.5">
            <button
              onClick={toggleEraser}
              disabled={!canEdit}
              className={`${toolButtonClass} w-full px-2 py-1.5 text-[11px] sm:w-auto sm:px-3 ${
                isEraser
                  ? "border-stone-900 bg-stone-900 text-white hover:bg-stone-900"
                  : ""
              }`}
            >
              {isEraser ? "Eraser On" : "Eraser"}
            </button>
            <button
              onClick={undo}
              disabled={!canEdit || !canUndo}
              className={`${toolButtonClass} w-full px-2 py-1.5 text-[11px] sm:w-auto sm:px-3`}
            >
              Undo
            </button>
            <button
              onClick={clearCanvas}
              disabled={!canEdit}
              className={`${toolButtonClass} w-full px-2 py-1.5 text-[11px] sm:w-auto sm:px-3`}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-300 bg-[#fffaf1]">
          <canvas
            ref={canvasRef}
            className="block h-[clamp(360px,62dvh,760px)] w-full touch-none"
            style={{
              pointerEvents: "auto",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton
            type="button"
            onClick={() => void submit()}
            disabled={!canEdit}
            className="w-full disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
          >
            Submit daily entry
          </PrimaryButton>
          <PrimaryLinkButton
            href={ROUTES.rateIt}
            className="w-full border-stone-400 bg-stone-100 text-stone-800 hover:bg-stone-200 sm:flex-1"
          >
            Go to Rate It
          </PrimaryLinkButton>
        </div>
      </PageCard>
    </PageShell>
  );
}