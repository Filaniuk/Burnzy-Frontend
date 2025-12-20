"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brush, Image as ImageIcon } from "lucide-react";
import type { GeneratedThumbnail } from "@/types/thumbnail";
import { PurpleActionButton } from "@/components/PurpleActionButton";

import ThumbnailMaskEditor, {
  type ThumbnailMaskEditorHandle,
} from "./ThumbnailMaskEditor";

type EditMode = "remove_text" | "swap_face" | null;

type Props = {
  open: boolean;
  item: GeneratedThumbnail | null;
  onClose: () => void;

  /**
   * These should call backend endpoints using FormData:
   * - remove text: POST /api/v1/thumbnails/{id}/remove-text (mask + prompt)
   * - swap face:   POST /api/v1/thumbnails/{id}/swap-face (mask + prompt + face_image)
   */
  onSwapFace: (item: GeneratedThumbnail, faceImage: File, mask: Blob, prompt: string) => Promise<void> | void;
  onRemoveText: (item: GeneratedThumbnail, mask: Blob, prompt: string) => Promise<void> | void;

  swapLoading?: boolean;
  removeLoading?: boolean;
};

export default function ThumbnailEditModal({
  open,
  item,
  onClose,
  onSwapFace,
  onRemoveText,
  swapLoading = false,
  removeLoading = false,
}: Props) {
  const editorRef = useRef<ThumbnailMaskEditorHandle | null>(null);
  const faceFileRef = useRef<HTMLInputElement | null>(null);

  const [localError, setLocalError] = useState<string | null>(null);
  const [mode, setMode] = useState<EditMode>(null);

  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>("");

  const href = item?.storage_url || "";
  const title = item?.title || item?.idea_uuid || "Thumbnail";

  const busy = swapLoading || removeLoading;

  const modeLabel = useMemo(() => {
    if (mode === "remove_text") return "Remove text";
    if (mode === "swap_face") return "Swap face";
    return "";
  }, [mode]);

  useEffect(() => {
    if (!open) return;

    setLocalError(null);
    setMode(null);
    setFaceFile(null);
    setPrompt("");

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  function startRemoveText() {
    setLocalError(null);
    setMode("remove_text");
    setFaceFile(null);
    setPrompt("Remove all text. Preserve the scene, subject, lighting and composition. Do not add logos or watermarks.");
    editorRef.current?.clear();
    editorRef.current?.setMode("paint");
  }

  function startSwapFace() {
    setLocalError(null);
    setMode("swap_face");
    setPrompt("Replace the main subject face with the reference face. Preserve body, background, lighting, and composition. Do not add text or logos.");
    editorRef.current?.clear();
    editorRef.current?.setMode("paint");
    // face file picked later
  }

  function cancelMasking() {
    setLocalError(null);
    setMode(null);
    setFaceFile(null);
    setPrompt("");
    editorRef.current?.clear();
  }

  function triggerPickFace() {
    setLocalError(null);
    if (!item) return;
    faceFileRef.current?.click();
  }

  function onPickFace(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Please select an image file (jpg/png/webp).");
      return;
    }
    setFaceFile(file);
  }

  async function applyRemoveText() {
    if (!item) return;
    try {
      setLocalError(null);

      const editor = editorRef.current;
      if (!editor) throw new Error("Mask editor not ready.");

      if (!editor.isDirty()) {
        setLocalError("Paint the region you want to edit (black) before applying.");
        return;
      }

      const mask = await editor.exportMask();
      await onRemoveText(item, mask, prompt);
    } catch (err: any) {
      setLocalError(err?.message || "Remove text failed.");
    }
  }

  async function applySwapFace() {
    if (!item) return;
    try {
      setLocalError(null);

      const editor = editorRef.current;
      if (!editor) throw new Error("Mask editor not ready.");

      if (!editor.isDirty()) {
        setLocalError("Paint the face region you want to replace (black) before applying.");
        return;
      }

      if (!faceFile) {
        setLocalError("Please pick a reference face image first.");
        return;
      }

      const mask = await editor.exportMask();
      await onSwapFace(item, faceFile, mask, prompt);
    } catch (err: any) {
      setLocalError(err?.message || "Swap face failed.");
    }
  }

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
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />

          <motion.div
            className="relative w-[92vw] max-w-4xl max-h-[95vh] rounded-3xl border border-[#2E2D39] bg-[#0F0E17] shadow-2xl overflow-hidden flex flex-col"
            initial={{ y: 14, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 h-10 w-10 rounded-2xl bg-[#0F0E17]/70 border border-[#2E2D39] hover:border-[#6C63FF]/70 flex items-center justify-center transition"
              title="Close"
            >
              <X size={18} className="text-neutral-200" />
            </button>

            <div
              className="
                flex-1 min-h-0 p-5 flex flex-col gap-5
                overflow-y-auto overflow-x-hidden
                [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
              "
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{title}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {item.width && item.height ? `Resolution: ${item.width}x${item.height}` : "Resolution: —"} • Version:{" "}
                    {item.version ?? "—"}
                  </p>
                </div>

                {mode ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#00F5A0]/30 bg-[#00F5A0]/10 text-[#00F5A0] text-xs">
                    <Brush size={14} />
                    Masking: {modeLabel}
                  </div>
                ) : null}
              </div>

              {/* Image / Editor */}
              <div className="rounded-2xl border border-[#2E2D39] bg-black/20 overflow-hidden">
                <div className="w-full flex items-center justify-center bg-[#0F0E17] p-3">
                  {href ? (
                    mode ? (
                      <div className="w-full">
                        <ThumbnailMaskEditor ref={editorRef} imageUrl={href} showToolbar />
                      </div>
                    ) : (
                      <img
                        src={href}
                        alt={title}
                        loading="lazy"
                        className="h-auto w-auto max-w-full max-h-[60vh] object-contain"
                      />
                    )
                  ) : (
                    <div className="text-neutral-500 py-10">No image available</div>
                  )}
                </div>
              </div>

              {/* Prompt (only during masking) */}
              {mode ? (
                <div className="rounded-2xl border border-[#2E2D39] bg-[#0F0E17] p-4">
                  <p className="text-xs text-neutral-400 mb-2">
                    Instruction (sent to Ideogram). Keep it short and specific.
                  </p>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl bg-[#0F0E17] border border-[#2E2D39] px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60"
                  />
                </div>
              ) : null}

              {/* Actions */}
              {!mode ? (
                <div className="shrink-0 flex flex-col md:flex-row gap-3">
                  <PurpleActionButton
                    label="Swap face"
                    size="sm"
                    onClick={startSwapFace}
                    disabled={!href || busy}
                    loading={swapLoading}
                    className="w-full md:w-auto"
                  />
                  <PurpleActionButton
                    label="Remove text"
                    size="sm"
                    onClick={startRemoveText}
                    disabled={!href || busy}
                    loading={removeLoading}
                    className="w-full md:w-auto"
                  />
                </div>
              ) : (
                <div className="shrink-0 flex flex-col gap-3">
                  {mode === "swap_face" ? (
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                      <button
                        type="button"
                        onClick={triggerPickFace}
                        disabled={busy}
                        className={[
                          "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition border",
                          busy
                            ? "bg-[#2A2933] text-neutral-500 cursor-not-allowed border-[#2E2D39]"
                            : "bg-[#0F0E17] text-white border-[#2E2D39] hover:border-[#00F5A0]/70",
                        ].join(" ")}
                      >
                        <ImageIcon size={16} />
                        {faceFile ? "Change face image" : "Pick face image"}
                      </button>

                      <div className="text-xs text-neutral-400 truncate">
                        {faceFile ? `Selected: ${faceFile.name}` : "No face image selected"}
                      </div>

                      <input
                        ref={faceFileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onPickFace}
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-col md:flex-row gap-3">
                    <PurpleActionButton
                      label={mode === "swap_face" ? "Apply swap face" : "Apply remove text"}
                      size="sm"
                      onClick={mode === "swap_face" ? applySwapFace : applyRemoveText}
                      disabled={!href || busy || (mode === "swap_face" && !faceFile)}
                      loading={mode === "swap_face" ? swapLoading : removeLoading}
                      className="w-full md:w-auto"
                    />

                    <button
                      type="button"
                      onClick={cancelMasking}
                      disabled={busy}
                      className={[
                        "inline-flex items-center justify-center rounded-2xl px-4 py-3 font-medium transition border",
                        busy
                          ? "bg-[#2A2933] text-neutral-500 cursor-not-allowed border-[#2E2D39]"
                          : "bg-[#0F0E17] text-white border-[#2E2D39] hover:border-[#6C63FF]/70",
                      ].join(" ")}
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400">
                    Paint the region to edit in black. Everything else stays unchanged.
                  </p>
                </div>
              )}

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
