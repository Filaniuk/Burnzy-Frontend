"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, AlertTriangle, Download } from "lucide-react";
import type { GeneratedThumbnail } from "@/types/thumbnail";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import ThumbnailEditModal from "./ThumbnailEditModal";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";
import { thumbnailFileUrl } from "@/lib/thumbnails";

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
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
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
    // When opening, use latest detail if we have it; otherwise item.
    setActive(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function fetchDetail(id: string) {
    try {
      const res = await apiFetch<ThumbnailDetailResponse>(`/api/v1/thumbnails/${id}`);
      return res.data;
    } catch {
      return null;
    }
  }

  async function handleModify(
    row: GeneratedThumbnail,
    args: { mask: Blob; prompt: string }
  ) {
    try {
      setModifyLoading(true);

      const fd = new FormData();
      fd.append("mask", args.mask, "mask.png");
      fd.append("prompt", args.prompt);

      const res = await apiFetch<EditResponse>(
        `/api/v1/thumbnails/${row.id}/modify`,
        {
          method: "POST",
          body: fd,
        }
      );

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
    } catch (err: any) {
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

      const res = await apiFetch<EditResponse>(
        `/api/v1/thumbnails/${row.id}/swap-face`,
        {
          method: "POST",
          body: fd,
        }
      );

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
    } catch (err: any) {
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

  async function handleAddText(
    row: GeneratedThumbnail,
    args: { image: Blob; payload: Record<string, any> }
  ) {
    try {
      setAddTextLoading(true);

      const fd = new FormData();
      fd.append("image", args.image, "thumbnail.png");
      fd.append("payload", JSON.stringify(args.payload));

      const res = await apiFetch<EditResponse>(
        `/api/v1/thumbnails/${row.id}/add-text`,
        {
          method: "POST",
          body: fd,
        }
      );

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
    } catch (err: any) {
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

  return (
    <>
      <div className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] overflow-hidden">
        <div className="relative aspect-[16/9] bg-[#0F0E17]">
          {ok ? (
            <img
              // Prefer the direct storage URL (S3/CloudFront) for cheap, cacheable delivery.
              // If the bucket is private / CORS isn't configured, we fall back to the authenticated API proxy.
              src={imgSrc}
              onError={() => {
                if (imgSrc !== proxySrc) setImgSrc(proxySrc);
              }}
              alt={item.title}
              loading="lazy"
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
              <>
                <a
                  href={`${displayHref}?download=1`}
                  className="h-9 w-9 rounded-2xl bg-[#0F0E17]/80 border border-[#2E2D39] hover:border-[#00F5A0]/70 flex items-center justify-center transition"
                  title="Download Thumbnail"
                >
                  <Download size={16} className="text-neutral-200" />
                </a>
              </>
            ) : (
              <div className="h-9 w-9 rounded-2xl bg-[#0F0E17]/60 border border-[#2E2D39] opacity-60" />
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0 w-full">
              <p className="text-white font-semibold leading-snug truncate">
                {display.title || "Untitled thumbnail"}
              </p>

              <p className="text-sm text-neutral-400 truncate">
                Resolution:{" "}
                <span className="text-neutral-200">
                  {display.width ?? "—"}x{display.height ?? "—"}
                </span>
              </p>

              <div className="my-2 shrink-0 flex justify-end">
                <PurpleActionButton
                  label="Edit Thumbnail"
                  size="sm"
                  onClick={() => setOpen(true)}
                  disabled={!displayHref}
                />
              </div>

              <div className="mt-2 flex flex-row justify-between">
                <p className="text-xs text-neutral-400">
                  Created: {formatDate(display.created_at)}
                </p>
                <p className="text-xs text-neutral-400">
                  Version: {display.version}
                </p>
              </div>

              {display.error_message ? (
                <p className="mt-3 text-xs text-red-200 line-clamp-2">
                  {display.error_message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ThumbnailEditModal
        open={open}
        item={displayHref ? display : item}
        onClose={() => setOpen(false)}
        onModify={handleModify}  // now calls /modify under the hood
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
