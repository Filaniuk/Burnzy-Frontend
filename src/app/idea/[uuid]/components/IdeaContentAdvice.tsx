"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function IdeaContentAdvice({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);

  if (!items?.length) return null;

  return (
    <section className="border border-[#2E2D39] rounded-2xl p-5 bg-[#12111A]/70">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3"
      >
        <div className="text-base font-semibold text-white">What to talk about</div>
        {open ? (
          <ChevronUp size={18} className="text-neutral-400" />
        ) : (
          <ChevronDown size={18} className="text-neutral-400" />
        )}
      </button>

      {open ? (
        <ul className="mt-3 space-y-2 text-sm text-neutral-200">
          {items.map((x, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-neutral-500">
          Tap to expand
        </p>
      )}
    </section>
  );
}
