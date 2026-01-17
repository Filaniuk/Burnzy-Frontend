"use client";

import { useEffect, useMemo, useState } from "react";
import type { GeneratedThumbnail } from "@/types/thumbnail";
import ThumbnailCard from "./ThumbnailCard";

const PAGE_SIZE = 9;

export default function ThumbnailsGrid({
  items,
  onMutate,
}: {
  items: GeneratedThumbnail[];
  onMutate?: () => Promise<void> | void;
}) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    setPage((prev) => (prev > totalPages ? totalPages : prev));
  }, [items.length]);

  const { pageItems, totalPages, from, to } = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    const current = Math.min(page, totalPages);

    const startIdx = (current - 1) * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, items.length);

    return {
      totalPages,
      pageItems: items.slice(startIdx, endIdx),
      from: items.length === 0 ? 0 : startIdx + 1,
      to: endIdx,
    };
  }, [items, page]);

  if (!items.length) {
    return (
      <section className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] p-5 sm:p-8 text-center">
        <p className="text-white font-semibold">No thumbnails yet</p>
        <p className="mt-2 text-sm text-neutral-400">
          Generate a thumbnail from an idea to populate this library.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Grid: 1 column on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageItems.map((t) => (
          <ThumbnailCard key={t.id} item={t} onMutate={onMutate} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={[
                "px-3 py-2 sm:py-1.5 rounded-xl border text-xs sm:text-sm",
                page === 1
                  ? "border-[#2E2D39] text-neutral-500 bg-[#0F0E17] cursor-not-allowed opacity-60"
                  : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17] hover:border-[#00F5A0]/70",
              ].join(" ")}
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={[
                "px-3 py-2 sm:py-1.5 rounded-xl border text-xs sm:text-sm",
                page === totalPages
                  ? "border-[#2E2D39] text-neutral-500 bg-[#0F0E17] cursor-not-allowed opacity-60"
                  : "border-[#2E2D39] text-neutral-200 bg-[#0F0E17] hover:border-[#00F5A0]/70",
              ].join(" ")}
            >
              Next
            </button>
          </div>

          {/* Make the status line shorter on mobile */}
          <div className="text-xs text-neutral-400 text-right sm:text-left">
            <span className="sm:hidden">
              Page <span className="text-neutral-200">{page}</span> /{" "}
              <span className="text-neutral-200">{totalPages}</span>
            </span>

            <span className="hidden sm:inline">
              Page <span className="text-neutral-200">{page}</span> of{" "}
              <span className="text-neutral-200">{totalPages}</span> • Showing{" "}
              <span className="text-neutral-200">
                {from}-{to}
              </span>{" "}
              of <span className="text-neutral-200">{items.length}</span> thumbnails
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
