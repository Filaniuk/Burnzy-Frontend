"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";   // ✅ ADD THIS
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { BarChart2, Zap, TrendingUp, Lightbulb } from "lucide-react";

type Insight = {
  title: string;
  detail: string;
  impact_score: number;
};

type ChannelInsightsResponse = {
  status: string;
  data: {
    channel_name: string;
    tag: string;
    niche: string;
    subscribers: number;
    avg_views: number;
    engagement_rate: number;
    upload_frequency: number;
    recommendations: Insight[];
    scale?: number;
  };
};

export default function ChannelInsights({
  tag,
  version,
}: {
  tag: string;
  version: number;
}) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [scale, setScale] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchedTags = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (fetchedTags.current.has(tag)) return;
    fetchedTags.current.add(tag);

    async function fetchInsights() {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch<ChannelInsightsResponse>(
          "/api/v1/channel_insights",
          {
            method: "POST",
            body: JSON.stringify({ channel_tag: tag, version }),
          }
        );

        setInsights(res.data.recommendations || []);
        setScale(res.data.scale ?? null);

      } catch (err) {
        console.error("Insights Error:", err);
        setError(extractApiError(err));   // ✅ Now user-friendly
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [tag, version]);

  const insightIcons = useMemo(
    () => [Lightbulb, TrendingUp, Zap, BarChart2],
    []
  );

  if (loading)
    return (
      <div className="text-center text-neutral-400 mt-6 animate-pulse">
        🧠 Generating channel insights...
        <br />
        <span>It can take a few minutes.</span>
      </div>
    );

  if (error)
    return (
      <div className="mt-6 text-red-400 bg-red-950/30 border border-red-900 rounded-xl p-4 text-sm text-center">
        {error}
      </div>
    );

  return (
    <AnimatePresence>
      <motion.section
        key={tag}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="mt-10 bg-gradient-to-b from-[#14131C]/90 to-[#0F0E17]/90 border border-[#2A2935] rounded-2xl p-6 sm:p-8 shadow-[0_0_25px_rgba(108,99,255,0.15)]"
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-[#00F5A0] to-[#6C63FF] bg-clip-text text-transparent text-center">
          Channel Insights
        </h2>

        <div className="space-y-5 sm:space-y-6">
          {insights.map((insight, i) => {
            const color =
              insight.impact_score >= 8
                ? "#00F5A0"
                : insight.impact_score >= 5
                  ? "#6C63FF"
                  : "#FF4C4C";
            const Icon = insightIcons[i % insightIcons.length];

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.015 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="p-4 sm:p-5 rounded-2xl bg-[#1B1A24]/70 border border-[#2E2D39] hover:border-[#6C63FF]/60 shadow-md hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${color}22`,
                        color,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
                      {insight.title}
                    </h3>
                  </div>

                  <span
                    className="text-sm font-semibold whitespace-nowrap"
                    style={{ color }}
                  >
                    {insight.impact_score}/10
                  </span>
                </div>

                <div className="w-full bg-[#1B1A24] h-2 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(insight.impact_score / 10) * 100}%`,
                    }}
                    transition={{ duration: 0.8, ease: easeOut }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${color}, #00F5A0)`,
                    }}
                  />
                </div>

                <p className="text-neutral-400 text-sm leading-relaxed">
                  {insight.detail}
                </p>
              </motion.div>
            );
          })}
        </div>

        {scale !== null && (
          <div className="mt-10 text-center">
            <div className="text-xs sm:text-sm uppercase tracking-wide text-neutral-400 mb-3">
              Channel Health Score
            </div>

            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1B1A24] border border-[#2E2D39] shadow-inner"
              >
                <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="#2A2935"
                    strokeWidth="5"
                    fill="none"
                  />
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="#00F5A0"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: scale / 10 }}
                    transition={{ duration: 1.2, ease: easeOut }}
                  />
                </svg>
                <span className="text-lg sm:text-xl font-bold text-[#00F5A0]">
                  {scale.toFixed(1)}/10
                </span>
              </motion.div>
            </div>
          </div>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
