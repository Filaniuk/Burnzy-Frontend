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
  initialBrush?: number; // UI px
  className?: string;
  showToolbar?: boolean;
  maxWidth?: number;
  maxHeight?: number;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

const ThumbnailMaskEditor = forwardRef<ThumbnailMaskEditorHandle, Props>(
  function ThumbnailMaskEditor(
    {
      imageUrl,
      initialBrush = 32,
      className = "",
      showToolbar = true,
      maxWidth,
      maxHeight,
    },
    ref
  ) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const [ready, setReady] = useState(false);
    const [mode, setMode] = useState<Mode>("paint");
    const [brush, setBrush] = useState(initialBrush);
    const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);

    const drawing = useRef(false);
    const last = useRef<{ x: number; y: number } | null>(null);
    const dirty = useRef(false);

    function getOverlayCtx() {
      const c = overlayCanvasRef.current;
      if (!c) return null;
      return c.getContext("2d");
    }

    function getMaskCtx() {
      const c = maskCanvasRef.current;
      if (!c) return null;
      return c.getContext("2d");
    }

    function toCanvasXY(e: PointerEvent | React.PointerEvent) {
      const c = overlayCanvasRef.current;
      if (!c) return null;
      const rect = c.getBoundingClientRect();
      const x = ((e.clientX - rect.left) * c.width) / rect.width;
      const y = ((e.clientY - rect.top) * c.height) / rect.height;
      return { x, y };
    }

    function computeLineWidth(displayBrushPx: number) {
      const c = overlayCanvasRef.current!;
      const rect = c.getBoundingClientRect();
      const scale = c.width / rect.width;
      return Math.max(1, Math.round(displayBrushPx * scale));
    }

    function clearMask() {
      const maskCtx = getMaskCtx();
      const overlayCtx = getOverlayCtx();
      const maskC = maskCanvasRef.current;
      const overlayC = overlayCanvasRef.current;

      if (!maskCtx || !overlayCtx || !maskC || !overlayC) return;

      // Hidden mask: start fully WHITE (keep everything)
      maskCtx.globalCompositeOperation = "source-over";
      maskCtx.fillStyle = "#FFFFFF";
      maskCtx.fillRect(0, 0, maskC.width, maskC.height);

      // Visible overlay: fully TRANSPARENT
      overlayCtx.globalCompositeOperation = "source-over";
      overlayCtx.clearRect(0, 0, overlayC.width, overlayC.height);

      dirty.current = false;
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

    function drawDot(ctx: CanvasRenderingContext2D, x: number, y: number) {
      ctx.beginPath();
      ctx.arc(x, y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function setupOverlayBrush(ctx: CanvasRenderingContext2D, lineWidth: number) {
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (mode === "paint") {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = "rgba(0,245,160,0.35)";
        ctx.fillStyle = "rgba(0,245,160,0.35)";
      } else {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.fillStyle = "rgba(0,0,0,1)";
      }
    }

    function setupMaskBrush(ctx: CanvasRenderingContext2D, lineWidth: number) {
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "source-over";

      if (mode === "paint") {
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#000000";
      } else {
        ctx.strokeStyle = "#FFFFFF";
        ctx.fillStyle = "#FFFFFF";
      }
    }

    async function exportBinaryMask(): Promise<Blob> {
      const c = maskCanvasRef.current;
      const ctx = getMaskCtx();
      if (!c || !ctx) throw new Error("Mask canvas not ready.");

      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const d = imgData.data;

      // Force perfect black/white
      for (let i = 0; i < d.length; i += 4) {
        const v = d[i];
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

    // Initialize canvases to image natural size AND compute displayed size
    useEffect(() => {
      const img = imgRef.current;
      const overlayC = overlayCanvasRef.current;
      const maskC = maskCanvasRef.current;
      if (!img || !overlayC || !maskC) return;

      function init() {
        if (!img || !overlayC || !maskC) return;
        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;
        if (!naturalW || !naturalH) return;

        overlayC.width = naturalW;
        overlayC.height = naturalH;

        maskC.width = naturalW;
        maskC.height = naturalH;

        // Disable smoothing (hard edges)
        const octx = overlayC.getContext("2d");
        const mctx = maskC.getContext("2d");
        if (octx) octx.imageSmoothingEnabled = false;
        if (mctx) mctx.imageSmoothingEnabled = false;

        const maxW = maxWidth ?? naturalW;
        const maxH = maxHeight ?? naturalH;
        const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);

        setDisplaySize({
          width: Math.round(naturalW * scale),
          height: Math.round(naturalH * scale),
        });

        clearMask();
        setReady(true);
      }

      if (img.complete) init();
      else img.onload = init;

      return () => {
        if (img) img.onload = null;
      };
    }, [imageUrl, maxWidth, maxHeight]);

    function onPointerDown(e: React.PointerEvent) {
      const overlayCtx = getOverlayCtx();
      const maskCtx = getMaskCtx();
      const canvas = overlayCanvasRef.current;
      if (!overlayCtx || !maskCtx || !canvas) return;

      canvas.setPointerCapture(e.pointerId);

      drawing.current = true;
      dirty.current = true;

      const p = toCanvasXY(e);
      if (!p) return;

      const lw = computeLineWidth(brush);
      setupOverlayBrush(overlayCtx, lw);
      setupMaskBrush(maskCtx, lw);

      last.current = p;

      drawDot(overlayCtx, p.x, p.y);
      drawDot(maskCtx, p.x, p.y);
    }

    function onPointerMove(e: React.PointerEvent) {
      if (!drawing.current) return;

      const overlayCtx = getOverlayCtx();
      const maskCtx = getMaskCtx();
      if (!overlayCtx || !maskCtx) return;

      const p = toCanvasXY(e);
      if (!p) return;

      const lw = computeLineWidth(brush);
      setupOverlayBrush(overlayCtx, lw);
      setupMaskBrush(maskCtx, lw);

      if (last.current) {
        strokeLine(overlayCtx, last.current, p);
        strokeLine(maskCtx, last.current, p);
      }
      last.current = p;
    }

    function onPointerUp(e?: React.PointerEvent) {
      drawing.current = false;
      last.current = null;

      const canvas = overlayCanvasRef.current;
      if (canvas && e) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    }

    const containerStyle: React.CSSProperties = {
      width: displaySize ? `${displaySize.width}px` : "100%",
      height: displaySize ? `${displaySize.height}px` : "auto",
    };

    const imgStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      display: "block",
    };

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
              Paint (green = edit)
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
              Erase region
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

        <div
          className="relative mx-auto rounded-2xl border border-[#2E2D39] overflow-hidden bg-[#0F0E17]"
          style={containerStyle}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Thumbnail"
            style={imgStyle}
            className="select-none"
            draggable={false}
          />

          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 touch-none"
            style={{ width: "100%", height: "100%" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
          />

          <canvas ref={maskCanvasRef} className="hidden" />
        </div>

      </div>
    );
  }
);

export default ThumbnailMaskEditor;
