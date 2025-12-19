"use client";

import { useMemo } from "react";

type Props = {
  label: string;
  value: number;
  hint?: string;
  invert?: boolean;
};

export default function MetricBar({ label, value, hint, invert = false }: Props) {
  const v = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;

  const display = useMemo(() => {
    // Competition is "harder" when higher; invert bar to keep visual semantics consistent.
    const pct = invert ? 100 - v : v;
    return { pct, v };
  }, [invert, v]);

  return (
    <div className="rounded-xl border border-[#2a2750] bg-[#0F0E17]/40 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          {hint ? <div className="mt-0.5 text-xs text-white/50">{hint}</div> : null}
        </div>
        <div className="text-sm font-semibold text-white/80">{v}</div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00F5A0]"
          style={{ width: `${display.pct}%` }}
        />
      </div>

      {invert ? <div className="mt-2 text-xs text-white/50">Lower is better</div> : null}
    </div>
  );
}
