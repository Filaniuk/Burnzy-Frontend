"use client";

import { useEffect, useState, useMemo } from "react";
import { AlertTriangle, Download } from "lucide-react";
import type { GeneratedThumbnail } from "@/types/thumbnail";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import ThumbnailEditModal from "./ThumbnailEditModal";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";
import { thumbnailFileUrl } from "@/lib/thumbnails";
import posthog from "posthog-js";

type ThumbnailDetailResponse = {
  status: string;
  message?: string;
  data: GeneratedThumbnail;
  meta?: any;
};

type EditResponse = {
  status: string;
  message?: string;
  data: {
    thumbnail_id: string;
    thumbnail_url: string;
    version: number;
    created_at?: string;
  };
  meta?: any;
};

function formatDate(iso: string | undefined | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
}

export default function ThumbnailCard({
  item,
  onMutate,
}: {
  item: GeneratedThumbnail;
  onMutate?: () => Promise<void> | void;
}) {
  const ok = item.status === "succeeded";
  const href = item.storage_url || "";
  const proxySrc = thumbnailFileUrl(item.id);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<GeneratedThumbnail | null>(null);

  const [swapLoading, setSwapLoading] = useState(false);
  const [modifyLoading, setModifyLoading] = useState(false);
  const [addTextLoading, setAddTextLoading] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "red" | "yellow" | "green",
  });

  useEffect(() => {
    if (!open) return;
    setActive(item);
  }, [open]);

  async function fetchDetail(id: string) {
    try {
      const res = await apiFetch<ThumbnailDetailResponse>(`/api/v1/thumbnails/${id}`);
      return res.data;
    } catch {
      return null;
    }
  }

  async function handleModify(row: GeneratedThumbnail, args: { mask: Blob; prompt: string }) {
    try {
      setModifyLoading(true);

      const fd = new FormData();
      fd.append("mask", args.mask, "mask.png");
      fd.append("prompt", args.prompt);
      posthog.capture("thumbnail_modify_started", {
        thumbnail_id: row.id,
        version: row.version,
        prompt_length: args.prompt?.length ?? 0,
      });
      const res = await apiFetch<EditResponse>(`/api/v1/thumbnails/${row.id}/modify`, {
        method: "POST",
        body: fd,
      });

      const newId = res?.data?.thumbnail_id;
      if (!newId) throw new Error("Server did not return a new thumbnail id.");

      const detail = await fetchDetail(newId);
      if (detail) setActive(detail);

      if (onMutate) await onMutate();

      setModal({
        show: true,
        title: "Edit applied",
        description: "A new thumbnail version was created successfully.",
        color: "green",
      });
      posthog.capture("thumbnail_modify_succeeded", {
        previous_thumbnail_id: row.id,
        previous_version: row.version,
        new_thumbnail_id: newId,
      });

    } catch (err: any) {
      posthog.capture("thumbnail_modify_failed", {
        thumbnail_id: row.id,
        version: row.version,
        error: extractApiError(err),
      });
      setModal({
        show: true,
        title: "Modify failed",
        description: extractApiError(err),
        color: "red",
      });
    } finally {
      setModifyLoading(false);
    }
  }

  async function handleSwapFace(
    row: GeneratedThumbnail,
    args: { mask: Blob; faceImage: File; prompt: string }
  ) {
    try {
      setSwapLoading(true);

      const fd = new FormData();
      fd.append("mask", args.mask, "mask.png");
      fd.append("face_image", args.faceImage);
      fd.append("prompt", args.prompt);
      posthog.capture("thumbnail_swap_face_started", {
        thumbnail_id: row.id,
        version: row.version,
        prompt_length: args.prompt?.length ?? 0,
        face_image_name: args.faceImage?.name ?? null,
        face_image_size: args.faceImage?.size ?? null,
      });

      const res = await apiFetch<EditResponse>(`/api/v1/thumbnails/${row.id}/swap-face`, {
        method: "POST",
        body: fd,
      });

      const newId = res?.data?.thumbnail_id;
      if (!newId) throw new Error("Server did not return a new thumbnail id.");

      const detail = await fetchDetail(newId);
      if (detail) setActive(detail);

      if (onMutate) await onMutate();

      setModal({
        show: true,
        title: "Face swapped",
        description: "A new thumbnail version was created successfully.",
        color: "green",
      });
      posthog.capture("thumbnail_swap_face_succeeded", {
        previous_thumbnail_id: row.id,
        previous_version: row.version,
        new_thumbnail_id: newId,
      });
    } catch (err: any) {
      posthog.capture("thumbnail_swap_face_failed", {
        thumbnail_id: row.id,
        version: row.version,
        error: extractApiError(err),
      });

      setModal({
        show: true,
        title: "Swap face failed",
        description: extractApiError(err),
        color: "red",
      });
    } finally {
      setSwapLoading(false);
    }
  }

  async function handleAddText(row: GeneratedThumbnail, args: { image: Blob; payload: Record<string, any> }) {
    try {
      setAddTextLoading(true);

      const fd = new FormData();
      fd.append("image", args.image, "thumbnail.png");
      fd.append("payload", JSON.stringify(args.payload));
      posthog.capture("thumbnail_add_text_started", {
        thumbnail_id: row.id,
        version: row.version,
        payload_keys: args.payload ? Object.keys(args.payload) : [],
      });
      const res = await apiFetch<EditResponse>(`/api/v1/thumbnails/${row.id}/add-text`, {
        method: "POST",
        body: fd,
      });

      const newId = res?.data?.thumbnail_id;
      if (!newId) throw new Error("Server did not return a new thumbnail id.");

      const detail = await fetchDetail(newId);
      if (detail) setActive(detail);

      if (onMutate) await onMutate();

      setModal({
        show: true,
        title: "Text added",
        description: "A new thumbnail version was created successfully.",
        color: "green",
      });
      posthog.capture("thumbnail_add_text_succeeded", {
        previous_thumbnail_id: row.id,
        previous_version: row.version,
        new_thumbnail_id: newId,
      });
    } catch (err: any) {
      posthog.capture("thumbnail_add_text_failed", {
        thumbnail_id: row.id,
        version: row.version,
        error: extractApiError(err),
      });
      setModal({
        show: true,
        title: "Add text failed",
        description: extractApiError(err),
        color: "red",
      });
    } finally {
      setAddTextLoading(false);
    }
  }

  const display = active || item;
  const displayHref = thumbnailFileUrl(item.id) || display.storage_url || href;

  const preferredSrc = display.storage_url || proxySrc;
  const [imgSrc, setImgSrc] = useState(preferredSrc);

  useEffect(() => {
    setImgSrc(preferredSrc);
  }, [preferredSrc]);

  // If you want the button to be "sm" only on mobile:
  // (This is safe in Next.js client components.)
  const [isSmUp, setIsSmUp] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const handler = () => setIsSmUp(mql.matches);
    handler();
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <div className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] overflow-hidden">
        <div className="relative aspect-[16/9] bg-[#0F0E17]">
          {ok ? (
            <img
              src={imgSrc}
              onError={() => {
                if (imgSrc !== proxySrc) setImgSrc(proxySrc);
              }}
              alt={display.title || item.title || "Thumbnail"}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-neutral-500">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle size={16} className="text-[#00F5A0]" />
                No image
              </div>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            {displayHref ? (
              <a
                href={`${displayHref}?download=1`}
                onClick={() => {
                  posthog.capture("thumbnail_download_clicked", {
                    thumbnail_id: item.id,
                    version: display.version,
                    title: display.title || item.title || null,
                    status: item.status,
                  });
                }}
                className="h-9 w-9 rounded-2xl bg-[#0F0E17]/80 border border-[#2E2D39] hover:border-[#00F5A0]/70 flex items-center justify-center transition"
                title="Download Thumbnail"
              >
                <Download size={16} className="text-neutral-200" />
              </a>
            ) : (
              <div className="h-9 w-9 rounded-2xl bg-[#0F0E17]/60 border border-[#2E2D39] opacity-60" />
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0 w-full">
              {/* Title: allow 2 lines on mobile, then clamp on larger screens if desired */}
              <p className="text-white font-semibold leading-snug line-clamp-2 sm:line-clamp-1">
                {display.title || "Untitled thumbnail"}
              </p>

              {/* Resolution: no truncation needed; keep it compact */}
              <p className="text-xs sm:text-sm text-neutral-400">
                Resolution:{" "}
                <span className="text-neutral-200">
                  {display.width ?? "—"}×{display.height ?? "—"}
                </span>
              </p>

              {/* CTA: right-aligned on larger screens; full-width on mobile */}
              <div className="pt-1 flex">
                <div className="w-full sm:w-auto sm:ml-auto">
                  <PurpleActionButton
                    label="Edit Thumbnail"
                    size={isSmUp ? "md" : "sm"}
                    onClick={() => {
                      posthog.capture("thumbnail_edit_modal_opened", {
                        thumbnail_id: item.id,
                        version: display.version,
                        title: display.title || item.title || null,
                        status: item.status,
                      });

                      setOpen(true);
                    }}
                    disabled={!displayHref}
                  />
                </div>
              </div>

              {/* Meta row: stack on mobile to reduce horizontal squeeze */}
              <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-neutral-400">Created: {formatDate(display.created_at)}</p>
                <p className="text-xs text-neutral-400">Version: {display.version}</p>
              </div>

              {display.error_message ? (
                <p className="mt-2 text-xs text-red-200 line-clamp-2">{display.error_message}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ThumbnailEditModal
        open={open}
        item={displayHref ? display : item}
        onClose={() => setOpen(false)}
        onModify={handleModify}
        onSwapFace={handleSwapFace}
        onAddText={handleAddText}
        modifyLoading={modifyLoading}
        swapLoading={swapLoading}
        addTextLoading={addTextLoading}
      />

      <ConfirmModal
        show={modal.show}
        title={modal.title}
        description={modal.description}
        onCancel={() => setModal((m) => ({ ...m, show: false }))}
        onConfirm={() => setModal((m) => ({ ...m, show: false }))}
        confirmText="OK"
        confirmColor={modal.color}
      />
    </>
  );
}
