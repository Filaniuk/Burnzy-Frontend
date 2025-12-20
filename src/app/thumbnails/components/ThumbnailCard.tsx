"use client";

import { useEffect, useState } from "react";
import { ExternalLink, AlertTriangle } from "lucide-react";
import type { GeneratedThumbnail } from "@/types/thumbnail";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import ThumbnailEditModal from "./ThumbnailEditModal";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";

type EditResponse = {
  status: string;
  message?: string;
  data: {
    thumbnail_id: string;
    thumbnail_url: string;
    version: number;
    parent_id?: string | null;
    operation?: string | null;
  };
};

type DetailResponse = {
  status: string;
  message?: string;
  data: GeneratedThumbnail;
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

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<GeneratedThumbnail>(item);

  const [swapLoading, setSwapLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    description: "",
    color: "green" as "red" | "yellow" | "green",
  });

  // keep active thumbnail in sync with incoming props
  useEffect(() => setActive(item), [item]);

  async function fetchDetail(id: string): Promise<GeneratedThumbnail | null> {
    try {
      const res = await apiFetch<DetailResponse>(`/api/v1/thumbnails/${id}`, { method: "GET" });
      return res?.data || null;
    } catch {
      return null;
    }
  }

  async function handleRemoveText(row: GeneratedThumbnail, mask: Blob, prompt: string) {
    try {
      setRemoveLoading(true);

      const fd = new FormData();
      fd.append("mask", mask, "mask.png");
      fd.append("prompt", prompt);

      const res = await apiFetch<EditResponse>(`/api/v1/thumbnails/${row.id}/remove-text`, {
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
        title: "Text removed",
        description: "A new thumbnail version was created successfully.",
        color: "green",
      });
    } catch (err: any) {
      setModal({
        show: true,
        title: "Remove text failed",
        description: extractApiError(err),
        color: "red",
      });
    } finally {
      setRemoveLoading(false);
    }
  }

  async function handleSwapFace(row: GeneratedThumbnail, faceImage: File, mask: Blob, prompt: string) {
    try {
      setSwapLoading(true);

      const fd = new FormData();
      fd.append("face_image", faceImage);
      fd.append("mask", mask, "mask.png");
      fd.append("prompt", prompt);

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

  return (
    <>
      <div className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] overflow-hidden">
        <div className="relative aspect-[16/9] bg-[#0F0E17]">
          {ok && href ? (
            <img
              src={href}
              alt={item.title || item.idea_uuid}
              className="h-full w-full object-cover"
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
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="h-9 w-9 rounded-2xl bg-[#0F0E17]/80 border border-[#2E2D39] hover:border-[#00F5A0]/70 flex items-center justify-center transition"
                title="Open image"
              >
                <ExternalLink size={16} className="text-neutral-200" />
              </a>
            ) : (
              <div className="h-9 w-9 rounded-2xl bg-[#0F0E17]/60 border border-[#2E2D39] opacity-60" />
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2 min-w-0 w-full">
              <p className="text-white font-semibold leading-snug truncate">
                {item.title || "Untitled thumbnail"}
              </p>

              <p className="text-sm text-neutral-400 truncate">
                Resolution:{" "}
                <span className="text-neutral-200">
                  {item.width && item.height ? `${item.width}x${item.height}` : "—"}
                </span>
              </p>

              <div className="my-2 shrink-0 text-right flex flex-col gap-2">
                <PurpleActionButton
                  label="Edit Thumbnail"
                  size="md"
                  onClick={() => setOpen(true)}
                  disabled={!href}
                />
              </div>

              <div className="mt-2 flex flex-row justify-between">
                <p className="text-xs text-neutral-400">Created: {formatDate(item.created_at)}</p>
                <p className="text-xs text-neutral-400">Version: {item.version}</p>
              </div>

              {item.error_message ? (
                <p className="mt-3 text-xs text-red-200 line-clamp-2">{item.error_message}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <ThumbnailEditModal
        open={open}
        item={active}
        onClose={() => setOpen(false)}
        onSwapFace={handleSwapFace}
        onRemoveText={handleRemoveText}
        swapLoading={swapLoading}
        removeLoading={removeLoading}
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
