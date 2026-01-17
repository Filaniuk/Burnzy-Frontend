"use client";

import { useMemo } from "react";
import type { BuilderQuestion } from "@/types/builderTypes";

export default function BuilderQuestionBlock({
  q,
  value,
  customText,
  onChange,
  onCustomChange,
}: {
  q: BuilderQuestion;
  value: string | string[];
  customText?: string;
  onChange: (next: string | string[]) => void;
  onCustomChange: (txt: string) => void;
}) {
  const isMulti = q.type === "multi_select";
  const isSingle = q.type === "single_select";
  const isFree = q.type === "free_text";

  const selectedList = useMemo(() => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value) return [value];
    return [];
  }, [value]);

  const hasCustomSelected = selectedList.includes("custom");

  const toggleMulti = (v: string) => {
    const max = q.max_select || 3;

    if (selectedList.includes(v)) {
      onChange(selectedList.filter((x) => x !== v));
      return;
    }

    // enforce max_select
    if (selectedList.length >= max) return;

    onChange([...selectedList, v]);
  };

  const selectSingle = (v: string) => {
    onChange(v);
  };

  return (
    <div className="border border-[#242335] rounded-2xl p-5 bg-[#12111A]/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-400 mb-1">
            {q.required ? "Required" : "Optional"}
          </p>
          <h3 className="text-lg font-semibold text-white leading-snug">
            {q.text}
          </h3>
          {q.help ? (
            <p className="text-xs text-neutral-400 mt-2">{q.help}</p>
          ) : null}
        </div>
      </div>

      {/* Options */}
      {(isSingle || isMulti) && (
        <div className="mt-4 grid sm:grid-cols-2 gap-2">
          {q.options.map((opt) => {
            const selected = selectedList.includes(opt.value);

            return (
              <button
                key={opt.id}
                onClick={() => {
                  if (isMulti) toggleMulti(opt.value);
                  else selectSingle(opt.value);
                }}
                className={[
                  "text-left p-3 rounded-xl border transition",
                  selected
                    ? "bg-[#121826] border-[#00F5A0]/40 text-white"
                    : "bg-[#14131C] border-[#2E2D39] text-neutral-300 hover:border-[#6C63FF]/50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">{opt.label}</span>

                  {selected ? (
                    <span className="text-xs px-2 py-1 rounded-full border border-[#00F5A0]/40 text-[#00F5A0]">
                      Selected
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full border border-[#2E2D39] text-neutral-500">
                      Pick
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom input */}
      {(isSingle || isMulti) && hasCustomSelected && (
        <div className="mt-4">
          <label className="text-xs text-neutral-400">Custom answer</label>
          <input
            value={customText || ""}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="Type your own option…"
            className="mt-2 w-full bg-[#101018] border border-[#2E2D39] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/40"
          />
        </div>
      )}

      {/* Free text */}
      {isFree && (
        <div className="mt-4">
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write a short answer…"
            className="w-full bg-[#101018] border border-[#2E2D39] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#00F5A0]/30"
            rows={4}
          />
        </div>
      )}
    </div>
  );
}
