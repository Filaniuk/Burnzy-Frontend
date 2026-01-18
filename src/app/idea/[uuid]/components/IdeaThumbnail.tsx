"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import posthog from "posthog-js";

type GenerateThumbnailResponse = {
  data?: {
    thumbnail_url?: string;
    image_url?: string;
    thumbnail_id?: string;
  };
};

type Props = { v: any; ideaUuid: string; trendId?: number | null };

export default function IdeaThumbnail({ v, ideaUuid, trendId }: Props) {
  const [thumbLoading, setThumbLoading] = useState(false);
  const [newThumbnail, setNewThumbnail] = useState<string | null>(null);

  const [activeIdx, setActiveIdx] = useState(0);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "red" | "yellow" | "green",
  });

  const baseImageUrl = v?.mocked_thumbnail_url
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/mocked-thumbnails/${v.mocked_thumbnail_url}`
    : null;

  const finalThumb = newThumbnail || baseImageUrl;

  const variations: string[] = useMemo(() => {
    const raw = v?.thumbnail_variations;
    if (!Array.isArray(raw)) return [];
    return raw.filter((x) => typeof x === "string" && x.trim().length > 0);
  }, [v]);

  useEffect(() => {
    if (variations.length === 0) {
      setActiveIdx(0);
      return;
    }
    setActiveIdx((idx) => {
      if (idx < 0) return 0;
      if (idx > variations.length - 1) return 0;
      return idx;
    });
  }, [variations.length]);

  const activeConcept = useMemo(() => {
    if (variations.length > 0) {
      const idx = Math.min(Math.max(activeIdx, 0), variations.length - 1);
      return variations[idx];
    }
    if (typeof v?.thumbnail_concept === "string" && v.thumbnail_concept.trim()) {
      return v.thumbnail_concept.trim();
    }
    return "";
  }, [variations, activeIdx, v]);

  const canNavigate = variations.length > 1;

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    setActiveIdx((i) => {
      const next = (i - 1 + variations.length) % variations.length;
      return next;
    });
  }, [canNavigate, variations.length]);

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    setActiveIdx((i) => {
      const next = (i + 1) % variations.length;
      return next;
    });
  }, [canNavigate, variations.length]);

  async function handleGenerateThumbnail() {
    try {
      setThumbLoading(true);

      const idx =
        variations.length > 0
          ? Math.min(Math.max(activeIdx, 0), variations.length - 1)
          : 0;

      const conceptToSend =
        variations.length > 0
          ? variations[idx]
          : typeof v?.thumbnail_concept === "string"
            ? v.thumbnail_concept.trim()
            : "";

      posthog.capture("thumbnail_generate_requested", {
        idea_uuid: ideaUuid,
        trend_id: trendId ?? null,
        variations_count: variations.length,
        active_idx: variations.length > 0 ? idx : null,
        has_concept: Boolean(conceptToSend?.trim()),
      });

      const res = (await apiFetch<any>(`/api/v1/generate_thumbnail/${ideaUuid}`, {
        method: "POST",
        body: JSON.stringify({
          trend_id: trendId ?? null,
          thumbnail_concept: conceptToSend || null,
          active_idx: variations.length > 0 ? idx : null,
        }),
      })) as GenerateThumbnailResponse;

      const url =
        res?.data?.thumbnail_url ||
        res?.data?.image_url ||
        (res?.data?.thumbnail_id
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/thumbnails/${res.data.thumbnail_id}/file`
          : null);

      if (!url) throw new Error("API did not return thumbnail URL.");

      setNewThumbnail(url);

      posthog.capture("thumbnail_generate_succeeded", {
        idea_uuid: ideaUuid,
        trend_id: trendId ?? null,
        variations_count: variations.length,
        active_idx: variations.length > 0 ? idx : null,
        url_source: res?.data?.thumbnail_url
          ? "thumbnail_url"
          : res?.data?.image_url
            ? "image_url"
            : res?.data?.thumbnail_id
              ? "thumbnail_id"
              : "unknown",
      });

      try {
        const img = new Image();
        img.src = url;
        await img.decode();
      } catch {
        // ignore preload errors
      }
    } catch (err: any) {
      posthog.capture("thumbnail_generate_failed", {
        idea_uuid: ideaUuid,
        trend_id: trendId ?? null,
        variations_count: variations.length,
        active_idx: variations.length > 0 ? activeIdx : null,
        status_code: err?.status ?? null,
        is_api_error: Boolean(err?.isApiError),
      });

      setModal({
        show: true,
        title: "Thumbnail Generation Failed",
        description:
          err?.detail ||
          err?.message ||
          "Something went wrong while generating the thumbnail.",
        color: "red",
      });
    } finally {
      setThumbLoading(false);
    }
  }

  return (
    <>
      <section className="flex flex-col items-center gap-4 w-full">
        {/* Thumbnail Container */}
        <div className="relative w-full max-w-2xl rounded-xl overflow-hidden border border-[#2E2D39] shadow-lg">
          {finalThumb ? (
            <img
              src={finalThumb}
              alt="Generated thumbnail"
              className={`w-full object-cover transition-all duration-500 ${thumbLoading ? "opacity-70 blur-md" : ""
                } ${!newThumbnail && baseImageUrl
                  ? "blur-md brightness-75 scale-[1.02]"
                  : "blur-0"
                }`}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-[#1B1A24] text-neutral-500">
              No thumbnail available
            </div>
          )}
        </div>

        {/* Thumbnail Variations Carousel */}
        <div className="w-full max-w-2xl bg-[#1B1A24]/60 border border-[#2E2D39] rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-white">Thumbnail Concepts</p>
              <p className="text-xs text-neutral-400">
                Visual-only concepts (open workspace to add text). Use arrows to select the active one.
              </p>
            </div>

            {variations.length > 0 && (
              <div className="text-xs text-neutral-400">
                {activeIdx + 1}/{variations.length}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-stretch gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canNavigate}
              className={`shrink-0 w-10 rounded-lg border border-[#2E2D39] bg-[#14131C] flex items-center justify-center transition ${canNavigate ? "hover:border-[#6C63FF]/50" : "opacity-40 cursor-not-allowed"
                }`}
              aria-label="Previous thumbnail concept"
            >
              <ChevronLeft size={18} className="text-neutral-200" />
            </button>

            <div className="flex-1 rounded-lg border border-[#2E2D39] bg-[#14131C] p-3">
              {activeConcept ? (
                <p className="text-sm text-neutral-200 leading-relaxed">{activeConcept}</p>
              ) : (
                <p className="text-sm text-neutral-500">
                  No thumbnail variations available yet.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canNavigate}
              className={`shrink-0 w-10 rounded-lg border border-[#2E2D39] bg-[#14131C] flex items-center justify-center transition ${canNavigate ? "hover:border-[#6C63FF]/50" : "opacity-40 cursor-not-allowed"
                }`}
              aria-label="Next thumbnail concept"
            >
              <ChevronRight size={18} className="text-neutral-200" />
            </button>
          </div>
          <p className="text-xs text-neutral-400">
            You can swap face, modify, add or remove elements in the workspace.
          </p>

          {variations.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {variations.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`h-2.5 w-2.5 rounded-full border transition ${i === activeIdx
                    ? "bg-[#6C63FF] border-[#6C63FF]"
                    : "bg-transparent border-[#FFFFFF] hover:border-[#6C63FF]/60"
                    }`}
                  aria-label={`Select concept ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-row gap-4">
          <PurpleActionButton
            label={variations.length > 0 ? "Generate Thumbnail" : "Generate Thumbnail"}
            onClick={handleGenerateThumbnail}
            loading={thumbLoading}
            size="sm"
          />
          <PurpleActionButton
            label="Open Workspace"
            onClick={() => window.open(`/thumbnails`, `_blank`)}
            size="sm"
          />
        </div>
      </section>

      <ConfirmModal
        show={modal.show}
        onCancel={() => setModal({ ...modal, show: false })}
        onConfirm={() => setModal({ ...modal, show: false })}
        confirmText="OK"
        title={modal.title}
        description={modal.description}
        confirmColor={modal.color}
      />
    </>
  );
}
