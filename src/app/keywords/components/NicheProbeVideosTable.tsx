"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { NicheProbeVideo } from "@/types/keywords";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

type Props = {
  probeVideos: NicheProbeVideo[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatDateOnly(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatViews(n: number) {
  const v = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;

  // YouTube-ish compact display (e.g., 39K / 1.2M), with full number in title attribute.
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(v);
  } catch {
    return v.toLocaleString();
  }
}

function getVisibleCount(width: number) {
  // Tailwind-ish breakpoints:
  // <640: 1, 640-1023: 2, 1024-1279: 3, >=1280: 4
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

export default function NicheProbeVideosTable({ probeVideos }: Props) {
  const sorted = useMemo(() => {
    const arr = Array.isArray(probeVideos) ? [...probeVideos] : [];
    arr.sort((a, b) => (Number(b?.view_count || 0) || 0) - (Number(a?.view_count || 0) || 0));
    return arr;
  }, [probeVideos]);

  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [startIdx, setStartIdx] = useState<number>(0);

  useEffect(() => {
    // Set initial + update on resize
    const apply = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 1024;
      setVisibleCount(getVisibleCount(w));
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // Keep startIdx valid if visibleCount or list size changes
  useEffect(() => {
    const maxStart = Math.max(0, sorted.length - visibleCount);
    setStartIdx((v) => clamp(v, 0, maxStart));
  }, [sorted.length, visibleCount]);

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F0E17] p-5">
        <div className="text-sm font-medium text-white">Probe videos</div>
        <div className="mt-2 text-sm text-white/60">No probe videos returned for this keyword.</div>
      </div>
    );
  }

  const maxStart = Math.max(0, sorted.length - visibleCount);
  const canLeft = startIdx > 0;
  const canRight = startIdx < maxStart;

  const visible = sorted.slice(startIdx, startIdx + visibleCount);

  const rangeStart = sorted.length ? startIdx + 1 : 0;
  const rangeEnd = Math.min(sorted.length, startIdx + visible.length);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F0E17] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm font-medium text-white">Probe videos</div>
          <div className="mt-1 text-xs text-white/60">
            Videos used for the evaluation.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-white/60 tabular-nums">
            Showing <span className="text-white">{rangeStart}</span>–<span className="text-white">{rangeEnd}</span>{" "}
            <span className="text-white/50">/ {sorted.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous video (−1)"
              onClick={() => setStartIdx((v) => clamp(v - 1, 0, maxStart))}
              disabled={!canLeft}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous (−1)"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next video (+1)"
              onClick={() => setStartIdx((v) => clamp(v + 1, 0, maxStart))}
              disabled={!canRight}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next (+1)"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((v, i) => {
          const href = v.video_id
            ? `https://www.youtube.com/watch?v=${encodeURIComponent(v.video_id)}`
            : "#";

          const thumb =
            v?.thumbnails?.medium ||
            v?.thumbnails?.standard ||
            v?.thumbnails?.default ||
            "";

          const published = v?.published_at ? formatDateOnly(v.published_at) : "—";
          const viewsCompact = formatViews(Number(v?.view_count || 0));
          const viewsFull = Number(v?.view_count || 0);
          const title = v?.title || "Untitled";
          const channel = v?.channel || "—";

          return (
            <a
              key={`${v.video_id}-${startIdx}-${i}`}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-[#16152a]/40 hover:bg-[#16152a]/60 transition shadow-[0_0_40px_rgba(108,99,255,0.06)] hover:shadow-[0_0_55px_rgba(0,245,160,0.08)] overflow-hidden"
              title="Open on YouTube"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full bg-black/30">
                {thumb ? (
                  // Using <img> on purpose (YouTube external). If you prefer next/image, add domain config.
                  <img
                    src={thumb}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-white/50">
                    No thumbnail
                  </div>
                )}

                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] text-white/90 backdrop-blur">
                  <ExternalLink size={12} />
                  YouTube
                </div>
              </div>

              {/* Meta */}
              <div className="p-4">
                <div className="line-clamp-2 text-sm font-semibold text-white group-hover:text-[#00F5A0] transition-colors">
                  {title}
                </div>

                <div className="mt-2 text-xs text-white/70 line-clamp-1">{channel}</div>

                <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/60">
                  <span className="tabular-nums" title={`${viewsFull.toLocaleString()} views`}>
                    {viewsCompact} views
                  </span>
                  <span className="tabular-nums">{published}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Optional: subtle hint for users on touch devices */}
      <div className="mt-4 text-xs text-white/45">
        Tip: Use the chevrons to move the carousel.
      </div>
    </div>
  );
}
