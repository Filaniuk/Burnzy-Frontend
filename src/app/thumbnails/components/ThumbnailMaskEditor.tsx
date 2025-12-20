"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type Mode = "paint" | "erase";

export type ThumbnailMaskEditorHandle = {
  exportMask: () => Promise<Blob>;
  clear: () => void;
  setMode: (m: Mode) => void;
  getMode: () => Mode;
  isDirty: () => boolean;
};

type Props = {
  imageUrl: string;
  initialBrush?: number; // px (UI)
  className?: string;

  /**
   * If true, the editor toolbar (paint/erase/brush/clear) is shown.
   * In your modal this should be true.
   */
  showToolbar?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

const ThumbnailMaskEditor = forwardRef<ThumbnailMaskEditorHandle, Props>(
  function ThumbnailMaskEditor(
    { imageUrl, initialBrush = 32, className = "", showToolbar = true },
    ref
  ) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [ready, setReady] = useState(false);
    const [mode, setMode] = useState<Mode>("paint");
    const [brush, setBrush] = useState(initialBrush);

    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const dirty = useRef(false);

    function getCtx() {
      const c = canvasRef.current;
      if (!c) return null;
      return c.getContext("2d");
    }

    function toCanvasXY(e: PointerEvent | React.PointerEvent) {
      const c = canvasRef.current;
      if (!c) return null;
      const rect = c.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * c.width) / rect.width;
      const y = ((e.clientY - rect.top) * c.height) / rect.height;
      return { x, y };
    }

    function strokeLine(
      ctx: CanvasRenderingContext2D,
      a: { x: number; y: number },
      b: { x: number; y: number }
    ) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    function setBrushStyle(ctx: CanvasRenderingContext2D, displayBrushPx: number) {
      const c = canvasRef.current!;
      const rect = c.getBoundingClientRect();
      const scale = c.width / rect.width;
      const lineWidth = Math.max(1, Math.round(displayBrushPx * scale));

      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = mode === "paint" ? "#000000" : "#FFFFFF";
    }

    function clearMask() {
      const ctx = getCtx();
      const c = canvasRef.current;
      if (!ctx || !c) return;

      // White background = preserve everything by default
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, c.width, c.height);

      dirty.current = false;
    }

    async function exportBinaryMask(): Promise<Blob> {
      const c = canvasRef.current;
      const ctx = getCtx();
      if (!c || !ctx) throw new Error("Mask canvas is not ready.");

      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const d = imgData.data;

      // Threshold to strict {0,255} to remove antialias gray pixels.
      for (let i = 0; i < d.length; i += 4) {
        const v = d[i]; // R channel
        const out = v < 128 ? 0 : 255;
        d[i] = out;
        d[i + 1] = out;
        d[i + 2] = out;
        d[i + 3] = 255;
      }

      ctx.putImageData(imgData, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        c.toBlob((b) => {
          if (!b) return reject(new Error("Failed to export mask PNG."));
          resolve(b);
        }, "image/png");
      });

      return blob;
    }

    useImperativeHandle(ref, () => ({
      exportMask: exportBinaryMask,
      clear: clearMask,
      setMode: (m: Mode) => setMode(m),
      getMode: () => mode,
      isDirty: () => dirty.current,
    }));

    // Initialize canvas to match the image’s natural dimensions
    useEffect(() => {
      const img = imgRef.current;
      const c = canvasRef.current;
      if (!img || !c) return;

      function init() {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        if (!w || !h) return;

        c.width = w;
        c.height = h;

        clearMask();
        setReady(true);
      }

      if (img.complete) init();
      else img.onload = init;

      return () => {
        if (img) img.onload = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageUrl]);

    function onPointerDown(e: React.PointerEvent) {
      const ctx = getCtx();
      if (!ctx) return;

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

      drawing.current = true;
      dirty.current = true;

      const p = toCanvasXY(e);
      if (!p) return;

      setBrushStyle(ctx, brush);
      last.current = p;

      // draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fillStyle = mode === "paint" ? "#000000" : "#FFFFFF";
      ctx.fill();
    }

    function onPointerMove(e: React.PointerEvent) {
      if (!drawing.current) return;
      const ctx = getCtx();
      if (!ctx) return;

      const p = toCanvasXY(e);
      if (!p) return;

      setBrushStyle(ctx, brush);
      if (last.current) strokeLine(ctx, last.current, p);
      last.current = p;
    }

    function onPointerUp() {
      drawing.current = false;
      last.current = null;
    }

    return (
      <div className={["w-full", className].join(" ")}>
        {showToolbar ? (
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => setMode("paint")}
              className={[
                "px-3 py-2 rounded-xl border text-sm",
                mode === "paint"
                  ? "border-[#00F5A0] text-[#00F5A0] bg-[#00F5A0]/10"
                  : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17]",
              ].join(" ")}
            >
              Paint (black = edit)
            </button>

            <button
              type="button"
              onClick={() => setMode("erase")}
              className={[
                "px-3 py-2 rounded-xl border text-sm",
                mode === "erase"
                  ? "border-[#6C63FF] text-[#6C63FF] bg-[#6C63FF]/10"
                  : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17]",
              ].join(" ")}
            >
              Erase (white = keep)
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Brush</span>
              <input
                type="range"
                min={6}
                max={120}
                value={brush}
                onChange={(e) =>
                  setBrush(clamp(parseInt(e.target.value, 10), 6, 120))
                }
              />
              <span className="text-xs text-neutral-200 w-10">{brush}px</span>
            </div>

            <button
              type="button"
              onClick={clearMask}
              className="px-3 py-2 rounded-xl border border-[#2E2D39] text-sm text-neutral-200 hover:border-[#00F5A0]/70"
            >
              Clear mask
            </button>

            {!ready ? (
              <span className="text-xs text-neutral-500">Loading…</span>
            ) : null}
          </div>
        ) : null}

        <div className="relative w-full rounded-2xl border border-[#2E2D39] overflow-hidden bg-[#0F0E17]">
          {/* Base image */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Thumbnail"
            className="w-full h-auto block select-none"
            draggable={false}
          />

          {/* Overlay canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
          />
        </div>
      </div>
    );
  }
);

export default ThumbnailMaskEditor;
