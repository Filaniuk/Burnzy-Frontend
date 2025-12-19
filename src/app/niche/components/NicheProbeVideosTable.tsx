"use client";

import React, { useMemo } from "react";
import type { NicheProbeVideo } from "@/types/niche";

type Props = {
  probeVideos: NicheProbeVideo[];
  maxRows?: number;
};

function formatInt(n: number) {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return v.toLocaleString();
}

function formatDate(iso: string) {
  // Keep it simple + robust; if invalid, show raw.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function NicheProbeVideosTable({ probeVideos, maxRows = 25 }: Props) {
  const rows = useMemo(() => (probeVideos || []).slice(0, maxRows), [probeVideos, maxRows]);

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F0E17] p-5">
        <div className="text-sm font-medium text-white">Probe videos</div>
        <div className="mt-2 text-sm text-white/60">No probe videos returned for this keyword.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F0E17] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">Probe videos</div>
          <div className="mt-1 text-xs text-white/60">
            Sampled from YouTube search results; used for scoring signals.
          </div>
        </div>

        <div className="text-xs text-white/60">
          Showing <span className="text-white">{rows.length}</span>
          {probeVideos.length > rows.length ? (
            <span className="text-white/60"> / {probeVideos.length}</span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[820px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs text-white/60">
              <th className="sticky top-0 bg-[#0F0E17] px-3 py-2 font-medium">Title</th>
              <th className="sticky top-0 bg-[#0F0E17] px-3 py-2 font-medium">Channel</th>
              <th className="sticky top-0 bg-[#0F0E17] px-3 py-2 font-medium">Published</th>
              <th className="sticky top-0 bg-[#0F0E17] px-3 py-2 text-right font-medium">Views</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((v, idx) => {
              const href = v.video_id ? `https://www.youtube.com/watch?v=${encodeURIComponent(v.video_id)}` : "#";
              const isLast = idx === rows.length - 1;

              return (
                <tr key={`${v.video_id}-${idx}`} className="text-sm text-white">
                  <td
                    className={[
                      "border-t border-white/10 px-3 py-3 align-top",
                      isLast ? "rounded-bl-2xl" : "",
                    ].join(" ")}
                  >
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white hover:text-[#00F5A0] transition-colors"
                      title={v.title}
                    >
                      {v.title || "Untitled"}
                    </a>
                    {v.video_id ? (
                      <div className="mt-1 text-xs text-white/50">ID: {v.video_id}</div>
                    ) : null}
                  </td>

                  <td className="border-t border-white/10 px-3 py-3 align-top text-white/85">
                    {v.channel || "—"}
                  </td>

                  <td className="border-t border-white/10 px-3 py-3 align-top text-white/75">
                    {v.published_at ? formatDate(v.published_at) : "—"}
                  </td>

                  <td
                    className={[
                      "border-t border-white/10 px-3 py-3 align-top text-right tabular-nums",
                      isLast ? "rounded-br-2xl" : "",
                    ].join(" ")}
                  >
                    {formatInt(v.view_count)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
