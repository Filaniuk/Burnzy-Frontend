// src/app/dashboard/components/CompetitorsSection.tsx
"use client";

import { DashboardCompetitor } from "@/types/dashboard";
import { motion } from "framer-motion";

interface Props {
  competitors: DashboardCompetitor[];
}

export default function CompetitorsSection({ competitors }: Props) {
  if (!competitors.length) return null;

  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-4 sm:p-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-neutral-400 border-b border-[#2E2D39]">
            <th className="py-2 text-left">Channel</th>
            <th className="py-2 text-right">Avg Views</th>
            <th className="py-2 text-right">Engagement</th>
            <th className="py-2 text-right">Uploads / wk</th>
            <th className="py-2 text-right">Growth</th>
            <th className="py-2 text-right">Trend Score</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, idx) => (
            <motion.tr
              key={`${c.tag}-${idx}`}
              whileHover={{ scale: 1.01 }}
              className="border-b border-[#2E2D39]/70"
            >
              <td className="py-2 pr-4">
                <span className="font-semibold text-white">
                  {c.tag.startsWith("@") ? c.tag : `@${c.tag}`}
                </span>
                <p className="text-[11px] text-neutral-400">{c.channel_name}</p>
              </td>
              <td className="py-2 text-right">
                {typeof c.avg_views === "number"
                  ? c.avg_views.toLocaleString()
                  : "—"}
              </td>
              <td className="py-2 text-right">
                {typeof c.engagement_rate === "number"
                  ? `${c.engagement_rate.toFixed(2)}%`
                  : "—"}
              </td>
              <td className="py-2 text-right">
                {typeof c.upload_frequency === "number"
                  ? c.upload_frequency.toFixed(1)
                  : "—"}
              </td>
              <td className="py-2 text-right">
                {typeof c.growth === "number"
                  ? `${c.growth > 0 ? "+" : ""}${c.growth.toFixed(2)}%`
                  : "—"}
              </td>
              <td className="py-2 text-right">
                {typeof c.trend_strength === "number"
                  ? c.trend_strength.toFixed(1)
                  : "—"}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
