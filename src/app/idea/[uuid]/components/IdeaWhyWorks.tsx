"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function IdeaWhyWorks({ text }: { text?: string }) {
  const [open, setOpen] = useState(false);

  const clean = (text || "").trim();
  if (!clean) return null;

  return (
    <section className="border border-[#2E2D39] rounded-2xl p-5 bg-[#12111A]/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3"
      >
        <div className="text-base font-semibold text-white">Why this idea works</div>
        {open ? (
          <ChevronUp size={18} className="text-neutral-400" />
        ) : (
          <ChevronDown size={18} className="text-neutral-400" />
        )}
      </button>

      {open ? (
        <p className="mt-3 text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
          {clean}
        </p>
      ) : (
        <p className="mt-2 text-xs text-neutral-500">
          Tap to expand (plain text from trend service).
        </p>
      )}
    </section>
  );
}
