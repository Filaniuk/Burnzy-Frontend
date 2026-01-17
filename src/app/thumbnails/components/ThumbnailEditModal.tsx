"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud } from "lucide-react";
import type { GeneratedThumbnail } from "@/types/thumbnail";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import ThumbnailMaskEditor, { ThumbnailMaskEditorHandle } from "./ThumbnailMaskEditor";
import ThumbnailTextEditor, { ThumbnailTextEditorHandle } from "./ThumbnailTextEditor";
import { thumbnailFileUrl } from "@/lib/thumbnails";
import ThumbnailTextEditorS3Wrapped from "./ThumbnailTextEditorS3Wrapped";
import SkeletonThumb from "./SkeletonThumb";

type Mode = null | "modify" | "swap_face" | "add_text";

type Props = {
  open: boolean;
  item: GeneratedThumbnail | null;
  onClose: () => void;

  onModify: (item: GeneratedThumbnail, args: { mask: Blob; prompt: string }) => Promise<void> | void;
  onSwapFace: (
    item: GeneratedThumbnail,
    args: { mask: Blob; faceImage: File; prompt: string }
  ) => Promise<void> | void;

  onAddText: (
    item: GeneratedThumbnail,
    args: { image: Blob; payload: Record<string, any> }
  ) => Promise<void> | void;

  modifyLoading?: boolean;
  swapLoading?: boolean;
  addTextLoading?: boolean;
};

function useViewportImageBox(paddingY = 220, marginX = 32) {
  const [box, setBox] = useState({ maxWidth: 0, maxHeight: 0 });

  useEffect(() => {
    function update() {
      if (typeof window === "undefined") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const MODAL_MAX_W = 1024;

      const availableW = Math.max(0, vw - marginX);
      const maxWidth = Math.min(availableW, MODAL_MAX_W);

      const maxHeight = Math.max(0, vh - paddingY);

      setBox({ maxWidth, maxHeight });
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [paddingY, marginX]);

  return box;
}

export default function ThumbnailEditModal({
  open,
  item,
  onClose,
  onModify,
  onSwapFace,
  onAddText,
  modifyLoading = false,
  swapLoading = false,
  addTextLoading = false,
}: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Preview loading: keep <img> mounted, skeleton overlays until onLoad.
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { maxWidth, maxHeight } = useViewportImageBox(260, 40);

  const maskRef = useRef<ThumbnailMaskEditorHandle | null>(null);
  const textRef = useRef<ThumbnailTextEditorHandle | null>(null);
  const faceFileRef = useRef<HTMLInputElement | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);

  const [prompt, setPrompt] = useState<string>(
    "Remove the selected object"
  );

  const busy = modifyLoading || swapLoading || addTextLoading;

  const title = item?.title || item?.idea_uuid || "Thumbnail";

  const aspect = useMemo(() => {
    const w = Number(item?.width || 0);
    const h = Number(item?.height || 0);
    if (w > 0 && h > 0) return `${w} / ${h}`;
    return "16 / 9";
  }, [item?.width, item?.height]);

  // Reset state when opening / changing item
  useEffect(() => {
    if (!open) return;

    setMode(null);
    setLocalError(null);
    setFaceFile(null);
    setPrompt(
      "Remove the selected object"
    );

    const next = item ? thumbnailFileUrl(item.id) : "";
    setPreviewSrc(next);

    // show skeleton immediately
    setImgLoaded(false);
    setImgError(false);
  }, [open, item?.id]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  async function applyModify() {
    if (!item) return;
    if (!previewSrc) return;

    try {
      setLocalError(null);

      const mask = await maskRef.current?.exportMask();
      if (!mask) throw new Error("Mask is not ready.");
      if (!maskRef.current?.isDirty()) {
        throw new Error("Please paint the edit region (black) before applying.");
      }

      const finalPrompt =
        prompt?.trim() ||
        "Remove the selected object"
      await onModify(item, { mask, prompt: finalPrompt });
      setMode(null);
    } catch (e: any) {
      setLocalError(e?.message || "Failed to apply modification.");
    }
  }

  async function applySwapFace() {
    if (!item) return;
    if (!previewSrc) return;

    try {
      setLocalError(null);

      const mask = await maskRef.current?.exportMask();
      if (!mask) throw new Error("Mask is not ready.");
      if (!maskRef.current?.isDirty()) {
        throw new Error("Please paint the face region (black) before applying.");
      }

      if (!faceFile) throw new Error("Please upload a reference face image.");

      const swapPrompt =
        prompt?.trim() ||
        "Replace the face of the main subject in the image with the face from the reference image. " +
        "Keep everything else (background, lighting, colors, composition) as close as possible to the original. " +
        "Do not add any new text, logos, watermarks, UI elements, or branding.";

      await onSwapFace(item, { mask, faceImage: faceFile, prompt: swapPrompt });
      setMode(null);
    } catch (e: any) {
      setLocalError(e?.message || "Failed to apply swap face.");
    }
  }

  async function applyAddText() {
    if (!item) return;
    if (!previewSrc) return;

    try {
      setLocalError(null);

      const editor = textRef.current;
      if (!editor) throw new Error("Text editor is not ready.");

      const blob = await editor.exportCompositedImage();
      const payload = editor.getState();

      const txt = (payload.text || "").trim();
      if (!txt) throw new Error("Please enter some text.");

      await onAddText(item, { image: blob, payload });
      setMode(null);
    } catch (e: any) {
      setLocalError(e?.message || "Failed to apply add text.");
    }
  }

  function startModify() {
    setLocalError(null);
    setMode("modify");
    setPrompt(
      "Remove the selected object"
    );
    setTimeout(() => maskRef.current?.clear(), 0);
  }

  function startSwapFace() {
    setLocalError(null);
    setMode("swap_face");
    setPrompt(
      "Replace the main subject face with the reference face. Preserve body, background, lighting, and composition. Do not add text or logos."
    );
    setTimeout(() => maskRef.current?.clear(), 0);
  }

  function startAddText() {
    setLocalError(null);
    setMode("add_text");
  }

  const canStartEdits = imgLoaded && !!previewSrc && !busy;

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70" onClick={() => (!busy ? onClose() : undefined)} />

          {/* Modal */}
          <motion.div
            className="relative w-[92vw] max-w-5xl max-h-[95vh] rounded-3xl border border-[#2E2D39] bg-[#0F0E17] shadow-2xl overflow-hidden flex flex-col"
            initial={{ y: 14, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#2E2D39]">
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{title}</p>
                <p className="text-xs text-neutral-400 truncate">
                  Resolution: {item.width ?? "—"}x{item.height ?? "—"} • Version: {item.version}
                </p>
              </div>

              <button
                type="button"
                className="h-9 w-9 rounded-2xl bg-[#0F0E17] border border-[#2E2D39] hover:border-[#00F5A0]/70 flex items-center justify-center transition disabled:opacity-60"
                onClick={onClose}
                disabled={busy}
                aria-label="Close"
              >
                <X size={16} className="text-neutral-200" />
              </button>
            </div>

            {/* Body */}
            <div
              className="
                flex-1 min-h-0 p-5 flex flex-col gap-5
                overflow-y-auto overflow-x-hidden
                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
              "
            >
              {/* Mode badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-neutral-400">
                  {mode ? (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl border border-[#00F5A0]/30 bg-[#00F5A0]/10 text-[#00F5A0]">
                      Editing:{" "}
                      <span className="text-neutral-200">
                        {mode === "modify" ? "Modify region" : mode === "swap_face" ? "Swap face" : "Add text"}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl border border-[#2E2D39] bg-[#1B1A24] text-neutral-300">
                      Choose an edit operation
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              {mode === null ? (
                <>
                  {/* Preview box with stable height (aspect ratio) */}
                  <div className="rounded-2xl border border-[#2E2D39] bg-black/20">
                    <div className="w-full flex items-center justify-center bg-[#0F0E17] p-3">
                      <div
                        className="relative w-full rounded-xl overflow-hidden"
                        style={{
                          aspectRatio: aspect,
                          maxWidth: maxWidth || "100%",
                          maxHeight: maxHeight || undefined,
                        }}
                      >
                        {/* Skeleton overlay */}
                        {!imgLoaded && !!previewSrc ? <SkeletonThumb /> : null}

                        {/* Actual image */}
                        {previewSrc ? (
                          <img
                            key={previewSrc}
                            src={previewSrc}
                            alt={title}
                            loading="eager"
                            onLoad={() => {
                              setImgLoaded(true);
                              setImgError(false);
                            }}
                            onError={() => {
                              setImgError(true);
                              setImgLoaded(false);
                            }}
                            className={`absolute inset-0 z-0 h-full w-full object-contain transition-opacity duration-200 ${imgLoaded ? "opacity-100" : "opacity-0"
                              }`}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
                            No image available
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {imgError ? (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
                      Failed to load the thumbnail preview. You can close and retry.
                    </div>
                  ) : null}

                  <div className="shrink-0 flex flex-col md:flex-row gap-3">
                    <PurpleActionButton
                      label="Modify region"
                      size="sm"
                      onClick={startModify}
                      disabled={!canStartEdits}
                      className="w-full md:w-auto"
                    />
                    <PurpleActionButton
                      label="Swap face"
                      size="sm"
                      onClick={startSwapFace}
                      disabled={!canStartEdits}
                      className="w-full md:w-auto"
                    />
                    <PurpleActionButton
                      label="Add text"
                      size="sm"
                      onClick={startAddText}
                      disabled={!canStartEdits}
                      className="w-full md:w-auto"
                    />
                  </div>
                </>
              ) : null}

              {/* Modify region */}
              {mode === "modify" ? (
                <>
                  <ThumbnailMaskEditor ref={maskRef} imageUrl={previewSrc} maxWidth={maxWidth} maxHeight={maxHeight} />

                  <div className="flex flex-col gap-3">
                    <label className="text-xs text-neutral-300">Edit prompt (what should happen inside the green mask?)</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={3}
                      className="italic w-full rounded-2xl bg-[#0F0E17] border border-[#2E2D39] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60"
                      placeholder="Example: Remove the text and reconstruct the background; keep everything outside the mask unchanged."
                    />
                  </div>

                  <div className="shrink-0 flex flex-col md:flex-row gap-3">
                    <PurpleActionButton
                      label={modifyLoading ? "Applying..." : "Apply edit"}
                      size="sm"
                      onClick={applyModify}
                      disabled={!previewSrc || modifyLoading || swapLoading || addTextLoading}
                      loading={modifyLoading}
                      className="w-full md:w-auto"
                    />
                    <PurpleActionButton
                      label="Cancel"
                      size="sm"
                      onClick={() => setMode(null)}
                      disabled={busy}
                      className="w-full md:w-auto"
                      gradientFrom="#2E2D39"
                      gradientTo="#2E2D39"
                    />
                  </div>
                </>
              ) : null}

              {/* Swap face */}
              {mode === "swap_face" ? (
                <>
                  <div className="rounded-2xl border border-[#2E2D39] bg-[#1B1A24] p-4 flex flex-col gap-3">
                    <p className="text-xs text-neutral-400">Upload a reference face image (portrait).</p>

                    <input
                      ref={faceFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setFaceFile(f);
                      }}
                    />

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => faceFileRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#2E2D39] bg-[#0F0E17] text-neutral-200 hover:border-[#00F5A0]/70 transition"
                        disabled={busy}
                      >
                        <UploadCloud size={16} />
                        Choose face image
                      </button>

                      <span className="text-xs text-neutral-400 truncate">{faceFile ? faceFile.name : "No file selected"}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-neutral-300">Edit prompt (how should the face be swapped?)</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        className="w-full rounded-2xl bg-[#0F0E17] border border-[#2E2D39] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60"
                        placeholder="Example: Replace the masked face with the reference face while keeping pose, lighting, and style consistent."
                      />
                    </div>
                  </div>

                  <ThumbnailMaskEditor ref={maskRef} imageUrl={previewSrc} maxWidth={maxWidth} maxHeight={maxHeight} />

                  <div className="shrink-0 flex flex-col md:flex-row gap-3">
                    <PurpleActionButton
                      label={swapLoading ? "Applying..." : "Swap face"}
                      size="sm"
                      onClick={applySwapFace}
                      disabled={!previewSrc || !faceFile || busy}
                      loading={swapLoading}
                      className="w-full md:w-auto"
                    />
                    <PurpleActionButton
                      label="Cancel"
                      size="sm"
                      onClick={() => setMode(null)}
                      disabled={busy}
                      className="w-full md:w-auto"
                      gradientFrom="#2E2D39"
                      gradientTo="#2E2D39"
                    />
                  </div>
                </>
              ) : null}

              {/* Add text */}
              {mode === "add_text" ? (
                <>
                  <ThumbnailTextEditorS3Wrapped ref={textRef} thumbnailId={item.id} maxWidth={maxWidth} maxHeight={maxHeight} />

                  <div className="shrink-0 flex flex-col md:flex-row gap-3">
                    <PurpleActionButton
                      label={addTextLoading ? "Applying..." : "Add text"}
                      size="sm"
                      onClick={applyAddText}
                      disabled={!previewSrc || busy}
                      loading={addTextLoading}
                      className="w-full md:w-auto"
                    />
                    <PurpleActionButton
                      label="Cancel"
                      size="sm"
                      onClick={() => setMode(null)}
                      disabled={busy}
                      className="w-full md:w-auto"
                      gradientFrom="#2E2D39"
                      gradientTo="#2E2D39"
                    />
                  </div>
                </>
              ) : null}

              {/* Error */}
              {localError ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {localError}
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
