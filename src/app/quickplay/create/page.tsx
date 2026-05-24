"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import PageShell from "@/components/page-shell";
import PageCard from "@/components/ui/page-card";
import PageTitle from "@/components/ui/page-title";
import { PrimaryButton, PrimaryLinkButton } from "@/components/ui/primary-button";
import { DAILY_DRAW_SECONDS, ROUTES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

type Point = { x: number; y: number };
type Stroke = { color: string; size: number; points: Point[]; erase?: boolean };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
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

  useEffect(() => { brushColorRef.current = brushColor; }, [brushColor]);
  useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);
  useEffect(() => { eraserRef.current = isEraser; }, [isEraser]);
  useLayoutEffect(() => { canEditRef.current = canEdit; }, [canEdit]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href = `/auth?mode=login&next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      const uid = data.session.user.id;
      setUserId(uid);

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data: existing } = await supabase
        .from("artworks")
        .select("id")
        .eq("user_id", uid)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
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
      const snapshot = strokesRef.current.map((s) => ({
        color: s.color,
        size: s.size,
        erase: s.erase,
        points: s.points.slice(),
      }));
      undoStackRef.current.push(snapshot);
      if (undoStackRef.current.length > 100) undoStackRef.current.shift();

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
      if (!canEditRef.current || !isDrawingRef.current || !currentStrokeRef.current) return;
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
        ctx.globalCompositeOperation = s.erase ? "destination-out" : "source-over";
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
    window.addEventListener("resize", resize);

    canvas.addEventListener("pointerdown", startDrawing);
    canvas.addEventListener("pointermove", draw);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointerleave", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", startDrawing);
      canvas.removeEventListener("pointermove", draw);
      canvas.removeEventListener("pointerup", stopDrawing);
      canvas.removeEventListener("pointerleave", stopDrawing);
      canvas.removeEventListener("pointercancel", stopDrawing);
    };
  }, []);

  const clearCanvas = () => {
    if (!canEdit) return;
    const snapshot = strokesRef.current.map((s) => ({
      color: s.color,
      size: s.size,
      erase: s.erase,
      points: s.points.slice(),
    }));
    undoStackRef.current.push(snapshot);
    if (undoStackRef.current.length > 100) undoStackRef.current.shift();
    strokesRef.current = [];
    redrawRef.current();
  };

  const undo = () => {
    if (!canEdit) return;
    const last = undoStackRef.current.pop();
    if (last) strokesRef.current = last;
    else strokesRef.current.pop();
    redrawRef.current();
  };

  const toggleEraser = () => setIsEraser((v) => !v);

  const submit = async () => {
    if (!canEdit || !userId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
    if (!blob) return;

    const filePath = `${userId}/${todayKey()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("artworks")
      .upload(filePath, blob, { upsert: true, contentType: "image/png" });
    if (uploadError) { alert("Upload failed: " + uploadError.message); return; }

    const { data: urlData } = supabase.storage.from("artworks").getPublicUrl(filePath);

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
    if (insertError) { alert("Save failed: " + insertError.message); return; }

    setSubmitted(true);
  };

  if (loading) return null;

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <PageShell maxWidth="4xl">
      <PageCard className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <PrimaryLinkButton href={ROUTES.quickplay}
          className="mb-5 w-fit border-stone-400 bg-stone-100 px-4 py-2 text-xs text-stone-800 hover:bg-stone-200">
          Back
        </PrimaryLinkButton>
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-stone-500">daily draw</p>
        <PageTitle className="mt-4 text-4xl sm:text-5xl">Draw and submit today&apos;s entry</PageTitle>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
          You have one official 2-minute submission each day. Your drawing enters TinderArt voting.
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

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-stone-300 bg-white/70 p-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">Color</label>
            <input
              type="color"
              value={brushColor}
              disabled={!canEdit}
              onChange={(e) => setBrushColor(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-stone-300 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-600">Size</label>
            <input
              type="range"
              min={1}
              max={40}
              value={brushSize}
              disabled={!canEdit}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span className="text-xs font-semibold text-stone-600 w-6">{brushSize}</span>
          </div>
          <button
            onClick={toggleEraser}
            disabled={!canEdit}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isEraser
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            {isEraser ? "Eraser On" : "Eraser"}
          </button>
          <button
            onClick={undo}
            disabled={!canEdit}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Undo
          </button>
          <button
            onClick={clearCanvas}
            disabled={!canEdit}
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-stone-300 bg-[#fffaf1]">
          <canvas
            ref={canvasRef}
            className="block aspect-square w-full touch-none"
            style={{ pointerEvents: canEdit ? "auto" : "none" }}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <PrimaryButton type="button" onClick={submit} disabled={!canEdit}
            className="w-full disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1">
            Submit daily entry
          </PrimaryButton>
          <PrimaryLinkButton href={ROUTES.tinderArt}
            className="w-full border-stone-400 bg-stone-100 text-stone-800 hover:bg-stone-200 sm:flex-1">
            Go to TinderArt
          </PrimaryLinkButton>
        </div>
      </PageCard>
    </PageShell>
  );
}
