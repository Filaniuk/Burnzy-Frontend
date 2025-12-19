"use client";

import type { NicheAnalysisData } from "@/types/keywords";

type Props = {
  data: NicheAnalysisData;
};

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function pillForEngagement(label: string) {
  const v = (label || "").toLowerCase();
  if (v.includes("extremely")) return "bg-[#00F5A0]/15 text-[#00F5A0] border-[#00F5A0]/30";
  if (v.includes("very")) return "bg-[#6C63FF]/15 text-[#6C63FF] border-[#6C63FF]/30";
  if (v.includes("high")) return "bg-white/10 text-white border-white/15";
  if (v.includes("medium")) return "bg-white/10 text-white/80 border-white/10";
  return "bg-white/5 text-white/60 border-white/10";
}

export default function NicheScoreCard({ data }: Props) {
  const score = clamp01(data.score);
  const today = data.today;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F0E17] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/70">Niche score</div>
          <div className="mt-1 flex items-end gap-2">
            <div className="text-4xl font-semibold text-white">{score}</div>
            <div className="pb-1 text-sm text-white/60">/ 100</div>
          </div>
        </div>

        <div
          className={[
            "rounded-full border px-3 py-1 text-xs font-medium",
            pillForEngagement(String(data.topic_engagement || "")),
          ].join(" ")}
        >
          {data.topic_engagement || "—"}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <MetricRow label="Demand" value={today.demand} accent="purple" />
        <MetricRow label="Momentum" value={today.momentum} accent="green" />
        <MetricRow label="Opportunity" value={today.opportunity} accent="purple" />
        <MetricRow label="Competition" value={today.competition} accent="white" />
        <MetricRow label="Ease" value={today.ease} accent="green" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat
          label="Avg views / video (21d)"
          value={formatInt(data.avg_video_views)}
          hint={data.metric_notes?.demand}
        />
        <Stat
          label={`Videos sampled (${data.metrics.window_days}d)`}
          value={formatInt(data.metrics.videos_sampled)}
          hint={data.metric_notes?.competition}
        />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "purple" | "green" | "white";
}) {
  const v = clamp01(value);

  const barClass =
    accent === "green"
      ? "bg-[#00F5A0]"
      : accent === "purple"
      ? "bg-[#6C63FF]"
      : "bg-white";

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <div className="text-white/80">{label}</div>
        <div className="tabular-nums text-white">{v}</div>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
      {hint ? <div className="mt-2 text-xs text-white/50">{hint}</div> : null}
    </div>
  );
}

function formatInt(n: number) {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return v.toLocaleString();
}
