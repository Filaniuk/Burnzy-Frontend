"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { THUMB_FONT_OPTIONS } from "@/app/fonts";

export type TextAlign = "left" | "center" | "right";

export type ThumbnailTextState = {
  text: string;

  // Box center, normalized 0..1 in the displayed image
  x: number;
  y: number;

  // Box width, normalized 0..1 relative to displayed image width (controls wrapping)
  boxW: number;

  // Typography (stored in preview px)
  fontFamily: string;
  fontSize: number; // px
  lineHeight: number; // multiplier (e.g., 1.05..1.5)

  color: string;
  strokeColor: string;
  strokeWidth: number; // px

  shadow: boolean;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;

  bold: boolean;
  italic: boolean;
  uppercase: boolean;

  rotateDeg: number; // -45..45
  align: TextAlign;

  letterSpacing: number; // px
};

export type ThumbnailTextEditorHandle = {
  // Now format-agnostic, but currently returns a PNG blob
  exportCompositedImage: () => Promise<Blob>;
  getState: () => ThumbnailTextState;
  setState: (s: Partial<ThumbnailTextState>) => void;
};

type Props = {
  imageUrl: string;
  className?: string;
  exportQuality?: number; // 0..1 (ignored by PNG but kept for API compatibility)

  // Single source of truth comes from the modal via props
  maxWidth?: number;
  maxHeight?: number;
};

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Measure string width including letter spacing.
 */
function measureWithSpacing(
  ctx: CanvasRenderingContext2D,
  s: string,
  letterSpacingPx: number
) {
  if (!letterSpacingPx) return ctx.measureText(s).width;
  const chars = [...s];
  const base = chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0);
  const spacing = letterSpacingPx * Math.max(0, chars.length - 1);
  return base + spacing;
}

/**
 * Wrap text to maxWidthPx. Preserves manual line breaks.
 * Breaks long words by characters if needed.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidthPx: number,
  letterSpacingPx: number
): string[] {
  const paragraphs = (text || "").split("\n");
  const lines: string[] = [];

  for (const p of paragraphs) {
    const words = p.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const w = measureWithSpacing(ctx, test, letterSpacingPx);

      if (w <= maxWidthPx) {
        current = test;
        continue;
      }

      if (current) {
        lines.push(current);
        current = "";
      }

      if (measureWithSpacing(ctx, word, letterSpacingPx) > maxWidthPx) {
        let chunk = "";
        for (const ch of [...word]) {
          const t = chunk + ch;
          if (measureWithSpacing(ctx, t, letterSpacingPx) <= maxWidthPx) {
            chunk = t;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }

    if (current) lines.push(current);
  }

  return lines;
}

/**
 * Draw a single line with optional letterSpacing.
 */
function drawLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  align: CanvasTextAlign,
  letterSpacingPx: number,
  doStroke: boolean
) {
  ctx.textAlign = align;

  if (!letterSpacingPx) {
    if (doStroke) ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    return;
  }

  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total =
    widths.reduce((a, b) => a + b, 0) + letterSpacingPx * Math.max(0, chars.length - 1);

  let startX = x;
  if (align === "center") startX = x - total / 2;
  if (align === "right") startX = x - total;

  let cursor = startX;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (doStroke) ctx.strokeText(ch, cursor, y);
    ctx.fillText(ch, cursor, y);
    cursor += widths[i] + letterSpacingPx;
  }
}

type DragMode = "none" | "move" | "resize-left" | "resize-right";

const ThumbnailTextEditor = forwardRef<ThumbnailTextEditorHandle, Props>(
  function ThumbnailTextEditor(
    { imageUrl, className = "", exportQuality = 1, maxWidth, maxHeight },
    ref
  ) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [ready, setReady] = useState(false);
    const [dragMode, setDragMode] = useState<DragMode>("none");
    const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
    const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
    const [displayScale, setDisplayScale] = useState(1);


    const [state, _setState] = useState<ThumbnailTextState>(() => ({
      text: "YOUR TEXT",
      x: 0.5,
      y: 0.18,
      boxW: 0.72,

      fontFamily: THUMB_FONT_OPTIONS[0]?.value || "system-ui",
      fontSize: 36,
      lineHeight: 1.08,

      color: "#FFFFFF",
      strokeColor: "#000000",
      strokeWidth: 0,

      shadow: true,
      shadowBlur: 18,
      shadowOffsetX: 0,
      shadowOffsetY: 8,

      bold: false,
      italic: false,
      uppercase: false,

      rotateDeg: 0,
      align: "center",

      letterSpacing: 0,
    }));

    function setState(p: Partial<ThumbnailTextState>) {
      _setState((s) => ({ ...s, ...p }));
    }

    useImperativeHandle(ref, () => ({
      exportCompositedImage: async () => {
        const img = imgRef.current;
        if (!img) throw new Error("Image not ready");

        const naturalW = img.naturalWidth || imageSize?.width || img.width;
        const naturalH = img.naturalHeight || imageSize?.height || img.height;

        const canvas = document.createElement("canvas");
        canvas.width = naturalW;
        canvas.height = naturalH;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not available");

        // Base image
        ctx.drawImage(img, 0, 0, naturalW, naturalH);

        // Text in IMAGE space (no viewport scale)
        const text = state.uppercase ? (state.text || "").toUpperCase() : (state.text || "");
        const fontSize = Math.max(8, state.fontSize); // now interpreted as image px
        const lineHeightPx = Math.max(8, fontSize * clamp(state.lineHeight, 1.0, 1.6));
        const fontStyle = `${state.italic ? "italic " : ""
          }${state.bold ? "800 " : "500 "}${fontSize}px ${state.fontFamily}`;

        ctx.font = fontStyle;
        ctx.textBaseline = "top";

        if (state.shadow) {
          ctx.shadowColor = "rgba(0,0,0,0.55)";
          ctx.shadowBlur = state.shadowBlur;       // already in image px (you can scale if you prefer)
          ctx.shadowOffsetX = state.shadowOffsetX;
          ctx.shadowOffsetY = state.shadowOffsetY;
        } else {
          ctx.shadowColor = "rgba(0,0,0,0)";
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }

        ctx.fillStyle = state.color;

        const doStroke = state.strokeWidth > 0;
        if (doStroke) {
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeStyle = state.strokeColor;
          ctx.lineWidth = Math.max(1, state.strokeWidth);
        }

        const letterSpacingPx = Math.max(0, state.letterSpacing);

        const cx = state.x * naturalW;
        const cy = state.y * naturalH;
        const boxW = clamp(state.boxW, 0.12, 0.98) * naturalW;

        const padding = 10;
        const maxLineW = Math.max(10, boxW - padding * 2);
        const lines = wrapText(ctx, text, maxLineW, letterSpacingPx);
        const boxH = lines.length * lineHeightPx + padding * 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(degToRad(state.rotateDeg));

        const align: CanvasTextAlign = state.align;
        const leftX = -boxW / 2 + padding;
        const centerX = 0;
        const rightX = boxW / 2 - padding;

        const lineX =
          align === "left" ? leftX : align === "right" ? rightX : centerX;

        let y = -boxH / 2 + padding;

        for (const line of lines) {
          drawLine(ctx, line, lineX, y, align, letterSpacingPx, doStroke);
          y += lineHeightPx;
        }

        ctx.restore();

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (!b) return reject(new Error("Failed to export image"));
              resolve(b);
            },
            "image/png",
            exportQuality
          );
        });

        return blob;
      },

      getState: () => state,
      setState,
    }));


    // Ready when image loaded
    useEffect(() => {
      const img = imgRef.current;
      if (!img) return;

      const onLoad = () => {
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;

        const maxW = maxWidth ?? naturalW;
        const maxH = maxHeight ?? naturalH;
        const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);

        setImageSize({ width: naturalW, height: naturalH });
        setDisplaySize({
          width: Math.round(naturalW * scale),
          height: Math.round(naturalH * scale),
        });
        setDisplayScale(scale);
        setReady(true);
      };

      if (img.complete) onLoad();
      else img.addEventListener("load", onLoad);

      return () => {
        img.removeEventListener("load", onLoad);
      };
    }, [imageUrl, maxWidth, maxHeight]);


    useEffect(() => {
      function updateScale() {
        if (!imageSize || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (!rect.width) return;
        setDisplayScale(rect.width / imageSize.width);
      }

      updateScale();
      window.addEventListener("resize", updateScale);
      return () => window.removeEventListener("resize", updateScale);
    }, [imageSize])

    function getContainerRect() {
      const el = containerRef.current;
      if (!el) return null;
      return el.getBoundingClientRect();
    }

    function onMovePointerDown(e: React.PointerEvent) {
      const rect = getContainerRect();
      if (!rect) return;

      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

      const cx = state.x * rect.width;
      const cy = state.y * rect.height;

      dragOffset.current = {
        dx: e.clientX - (rect.left + cx),
        dy: e.clientY - (rect.top + cy),
      };

      setDragMode("move");
    }

    function onResizePointerDown(mode: "resize-left" | "resize-right") {
      return (e: React.PointerEvent) => {
        const rect = getContainerRect();
        if (!rect) return;

        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setDragMode(mode);
        dragOffset.current = null;
        e.stopPropagation();
      };
    }

    function onPointerMove(e: React.PointerEvent) {
      const rect = getContainerRect();
      if (!rect) return;

      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      if (dragMode === "move") {
        const off = dragOffset.current || { dx: 0, dy: 0 };
        const nx = clamp((px - off.dx) / rect.width, 0, 1);
        const ny = clamp((py - off.dy) / rect.height, 0, 1);
        setState({ x: nx, y: ny });
        return;
      }

      if (dragMode === "resize-left" || dragMode === "resize-right") {
        const centerX = state.x * rect.width;
        const boxWpx = clamp(state.boxW, 0.12, 0.98) * rect.width;

        const left = centerX - boxWpx / 2;
        const right = centerX + boxWpx / 2;

        const minW = 0.12 * rect.width;
        const maxW = 0.98 * rect.width;

        if (dragMode === "resize-left") {
          const newLeft = clamp(px, 0, right - minW);
          const newW = clamp(right - newLeft, minW, maxW);
          const newCenter = newLeft + newW / 2;

          setState({
            boxW: newW / rect.width,
            x: clamp(newCenter / rect.width, 0, 1),
          });
        } else {
          const newRight = clamp(px, left + minW, rect.width);
          const newW = clamp(newRight - left, minW, maxW);
          const newCenter = left + newW / 2;

          setState({
            boxW: newW / rect.width,
            x: clamp(newCenter / rect.width, 0, 1),
          });
        }
      }
    }

    function onPointerUp() {
      setDragMode("none");
      dragOffset.current = null;
    }

    const previewText = useMemo(() => {
      const t = state.uppercase
        ? (state.text || "").toUpperCase()
        : (state.text || "");
      return t || " ";
    }, [state.text, state.uppercase]);

    const boxStyle: React.CSSProperties = useMemo(() => {
      const wPct = clamp(state.boxW, 0.12, 0.98) * 100;
      return {
        left: `${state.x * 100}%`,
        top: `${state.y * 100}%`,
        width: `${wPct}%`,
        transform: `translate(-50%, -50%) rotate(${state.rotateDeg}deg)`,
      };
    }, [state.x, state.y, state.boxW, state.rotateDeg]);

    const textStyle: React.CSSProperties = useMemo(() => {
      const fontSizePx = state.fontSize * displayScale;
      const strokeWidthPx = state.strokeWidth * displayScale;
      const letterSpacingPx = state.letterSpacing * displayScale;

      return {
        fontFamily: state.fontFamily,
        fontSize: `${fontSizePx}px`,
        fontWeight: state.bold ? 800 : 500,
        fontStyle: state.italic ? "italic" : "normal",
        color: state.color,
        textAlign: state.align as any,
        textTransform: state.uppercase ? "uppercase" : "none",
        WebkitTextStroke:
          strokeWidthPx > 0
            ? `${strokeWidthPx}px ${state.strokeColor}`
            : "0px transparent",
        textShadow: state.shadow ? "0 10px 22px rgba(0,0,0,0.55)" : "none",
        letterSpacing: `${letterSpacingPx}px`,
        lineHeight: state.lineHeight,
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        userSelect: "none",
      };
    }, [state, displayScale]);


    // Container behaves like the modal preview wrapper:
    // width is the modal body width, but never exceeds maxWidth.
    const containerStyle: React.CSSProperties = useMemo(() => {
      if (displaySize) {
        return {
          width: `${displaySize.width}px`,
          height: `${displaySize.height}px`,
        };
      }
      // Fallback before image load
      return {
        width: "100%",
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
      };
    }, [displaySize, maxWidth]);


    // Image uses the same rules as the plain preview.
    const imgStyle: React.CSSProperties = useMemo(
      () => ({
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
      }),
      []
    );

    return (
      <div className={["w-full", className].join(" ")}>
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Text</span>
            <textarea
              value={state.text}
              onChange={(e) => setState({ text: e.target.value })}
              rows={2}
              className="w-[340px] max-w-full rounded-xl bg-[#0F0E17] border border-[#2E2D39] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60"
              placeholder="Type your text…"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Font</span>
            <select
              value={state.fontFamily}
              onChange={(e) => setState({ fontFamily: e.target.value })}
              className="rounded-xl bg-[#0F0E17] border border-[#2E2D39] px-3 py-2 text-sm text-white"
            >
              {THUMB_FONT_OPTIONS.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Size</span>
            <input
              type="range"
              min={14}
              max={180}
              value={state.fontSize}
              onChange={(e) =>
                setState({
                  fontSize: clamp(parseInt(e.target.value, 10), 14, 180),
                })
              }
            />
            <span className="text-xs text-neutral-200 w-10">
              {state.fontSize}px
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Line</span>
            <input
              type="range"
              min={1.0}
              max={1.6}
              step={0.02}
              value={state.lineHeight}
              onChange={(e) =>
                setState({
                  lineHeight: clamp(parseFloat(e.target.value), 1.0, 1.6),
                })
              }
            />
            <span className="text-xs text-neutral-200 w-12">
              {state.lineHeight.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setState({ bold: !state.bold })}
            className={[
              "px-3 py-2 rounded-xl border text-sm",
              state.bold
                ? "border-[#00F5A0] text-[#00F5A0] bg-[#00F5A0]/10"
                : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17]",
            ].join(" ")}
          >
            Bold
          </button>

          <button
            type="button"
            onClick={() => setState({ italic: !state.italic })}
            className={[
              "px-3 py-2 rounded-xl border text-sm",
              state.italic
                ? "border-[#6C63FF] text-[#6C63FF] bg-[#6C63FF]/10"
                : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17]",
            ].join(" ")}
          >
            Italic
          </button>

          <button
            type="button"
            onClick={() => setState({ uppercase: !state.uppercase })}
            className={[
              "px-3 py-2 rounded-xl border text-sm",
              state.uppercase
                ? "border-[#00F5A0] text-[#00F5A0] bg-[#00F5A0]/10"
                : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17]",
            ].join(" ")}
          >
            Upper
          </button>

          {!ready ? (
            <span className="text-xs text-neutral-500">Loading…</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Color</span>
            <input
              type="color"
              value={state.color}
              onChange={(e) => setState({ color: e.target.value })}
              className="h-9 w-12 rounded-xl border border-[#2E2D39] bg-[#0F0E17]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Outline</span>
            <input
              type="range"
              min={0}
              max={18}
              value={state.strokeWidth}
              onChange={(e) =>
                setState({
                  strokeWidth: clamp(parseInt(e.target.value, 10), 0, 18),
                })
              }
            />
            <span className="text-xs text-neutral-200 w-10">
              {state.strokeWidth}px
            </span>
            <input
              type="color"
              value={state.strokeColor}
              onChange={(e) => setState({ strokeColor: e.target.value })}
              className="h-9 w-12 rounded-xl border border-[#2E2D39] bg-[#0F0E17]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Rotate</span>
            <input
              type="range"
              min={-45}
              max={45}
              value={state.rotateDeg}
              onChange={(e) =>
                setState({
                  rotateDeg: clamp(parseInt(e.target.value, 10), -45, 45),
                })
              }
            />
            <span className="text-xs text-neutral-200 w-10">
              {state.rotateDeg}°
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Spacing</span>
            <input
              type="range"
              min={0}
              max={18}
              value={state.letterSpacing}
              onChange={(e) =>
                setState({
                  letterSpacing: clamp(parseInt(e.target.value, 10), 0, 18),
                })
              }
            />
            <span className="text-xs text-neutral-200 w-10">
              {state.letterSpacing}px
            </span>
          </div>

          <button
            type="button"
            onClick={() => setState({ shadow: !state.shadow })}
            className={[
              "px-3 py-2 rounded-xl border text-sm",
              state.shadow
                ? "border-[#6C63FF] text-[#6C63FF] bg-[#6C63FF]/10"
                : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17]",
            ].join(" ")}
          >
            Shadow
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Align</span>
            <select
              value={state.align}
              onChange={(e) => setState({ align: e.target.value as TextAlign })}
              className="rounded-xl bg-[#0F0E17] border border-[#2E2D39] px-3 py-2 text-sm text-white"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="relative mx-auto rounded-2xl border border-[#2E2D39] overflow-hidden bg-[#0F0E17]"
          style={containerStyle}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* Base image */}
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Thumbnail"
            style={imgStyle}
            className="select-none"
            draggable={false}
            crossOrigin="anonymous"
          />

          {/* Resizable text box overlay */}
          <div
            className="absolute"
            style={boxStyle}
            onPointerDown={onMovePointerDown}
            title="Drag to move. Use side handles to resize width (wrap control)."
          >
            <div className="relative rounded-xl border border-[#00F5A0]/70 bg-black/10 px-3 py-2">
              <div style={textStyle}>{previewText}</div>

              <div
                onPointerDown={onResizePointerDown("resize-left")}
                className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full border border-[#00F5A0] bg-[#0F0E17] shadow"
                style={{ cursor: "ew-resize" }}
                title="Resize width"
              />
              <div
                onPointerDown={onResizePointerDown("resize-right")}
                className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full border border-[#00F5A0] bg-[#0F0E17] shadow"
                style={{ cursor: "ew-resize" }}
                title="Resize width"
              />
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-400">
          Drag the box to position it. Resize the side handles to control line wrapping
          (wide = one line, narrow = multiple lines). The image follows the same width /
          height rules as the preview and is only scaled down to fit.
        </p>
      </div>
    );
  }
);

export default ThumbnailTextEditor;
