"use client";

import { motion } from "framer-motion";

import { formatNumberCompact, formatNumber } from "@/lib/format";
import type { NicheMetricNotes, NicheMetrics } from "@/types/niche";

type Props = {
  metrics: NicheMetrics;
  metricNotes?: NicheMetricNotes;
};

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-sm text-gray-300">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function NicheMetricsCard({ metrics, metricNotes }: Props) {
  const m = metrics || ({} as NicheMetrics);
  const notes = metricNotes || {};

  const view21d = Number(m.total_views_21d_sample || 0);
  const view7d = Number(m.total_views_7d_sample || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#151326] to-[#0F0E17] p-6 shadow-lg"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#6C63FF] via-[#00F5A0] to-[#6C63FF] opacity-80" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Probe Metrics</h3>
          <p className="mt-1 text-sm text-gray-300">
            Lightweight signal from a small YouTube sample.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricRow label="Window" value={`${m.window_days ?? "-"} days`} />
        <MetricRow label="Recent" value={`${m.recent_days ?? "-"} days`} />
        <MetricRow label="Videos sampled" value={formatNumber(m.videos_sampled || 0)} />
        <MetricRow label="Filtered out" value={formatNumber(m.filtered_out_videos || 0)} />
        <MetricRow label="Views (21d sample)" value={formatNumberCompact(view21d)} />
        <MetricRow label="Views (7d sample)" value={formatNumberCompact(view7d)} />
        <MetricRow label="Views/day (21d)" value={formatNumberCompact(m.views_per_day_21d_sample || 0)} />
        <MetricRow label="Views/day (7d)" value={formatNumberCompact(m.views_per_day_7d_sample || 0)} />
        <MetricRow label="Search results (21d)" value={formatNumberCompact(m.search_results_count_21d || 0)} />
      </div>

      {(notes.demand || notes.momentum || notes.opportunity || notes.competition) && (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white">Model notes</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-200">
            {notes.demand && (
              <p>
                <span className="font-semibold text-[#00F5A0]">Demand:</span> {notes.demand}
              </p>
            )}
            {notes.momentum && (
              <p>
                <span className="font-semibold text-[#00F5A0]">Momentum:</span> {notes.momentum}
              </p>
            )}
            {notes.opportunity && (
              <p>
                <span className="font-semibold text-[#00F5A0]">Opportunity:</span> {notes.opportunity}
              </p>
            )}
            {notes.competition && (
              <p>
                <span className="font-semibold text-[#00F5A0]">Competition:</span> {notes.competition}
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
