"use client";

import { Search, Filter } from "lucide-react";

type Props = {
  q: string;
  onQ: (v: string) => void;
  status: "all" | "succeeded" | "failed";
  onStatus: (v: "all" | "succeeded" | "failed") => void;
};

export default function ThumbnailsToolbar({ q, onQ, status, onStatus }: Props) {
  return (
    <section className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] p-4 md:p-5">
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Search by title or idea UUID…"
            className="w-full rounded-2xl bg-[#0F0E17] border border-[#2E2D39] pl-11 pr-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-[#0F0E17] border border-[#2E2D39] flex items-center justify-center">
            <Filter size={16} className="text-neutral-400" />
          </div>

          <select
            value={status}
            onChange={(e) => onStatus(e.target.value as any)}
            className="rounded-2xl bg-[#0F0E17] border border-[#2E2D39] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60"
          >
            <option value="all">All</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
    </section>
  );
}
