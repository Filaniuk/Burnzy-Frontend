"use client";

import { ExternalLink, Copy, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { GeneratedThumbnail } from "@/types/thumbnail";

function formatDate(iso: string | undefined | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
}

export default function ThumbnailCard({ item }: { item: GeneratedThumbnail }) {
  const ok = item.status === "succeeded";
  const href = item.storage_url || "";

  return (
    <div className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] overflow-hidden">
      <div className="relative aspect-[16/9] bg-[#0F0E17]">
        {ok && item.storage_url ? (
          <img
            src={item.storage_url}
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

        <div className="absolute top-3 left-3">
          <div
            className={[
              "inline-flex items-center gap-1 rounded-2xl px-3 py-1 text-xs border",
              ok
                ? "bg-[#00F5A0]/10 text-[#00F5A0] border-[#00F5A0]/30"
                : "bg-red-500/10 text-red-200 border-red-500/30",
            ].join(" ")}
          >
          </div>
        </div>

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
          <div className="flex flex-col gap-2 min-w-0">
            <p className="text-white font-semibold leading-snug truncate">
              {item.title || "Untitled thumbnail"}
            </p>
            {(item.width && item.height) ? 
              <p className="text-xs text-neutral-400 truncate">
                <span className="text-sm text-neutral-400">Resolution: {item.width}x{item.height}px</span>
              </p>
              : null
            }
            <p className="text-xs text-neutral-400 ">Created: {formatDate(item.created_at)}</p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-neutral-400">v{item.version}</p>
          </div>
        </div>

        {item.error_message ? (
          <p className="mt-3 text-xs text-red-200 line-clamp-2">{item.error_message}</p>
        ) : null}
      </div>
    </div>
  );
}
