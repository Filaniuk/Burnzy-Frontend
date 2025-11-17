"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BarChart2, Zap, TrendingUp, Lightbulb } from "lucide-react";

type Insight = {
  title: string;
  detail: string;
  impact_score: number;
};

export default function ChannelInsightsDashboard({
  insights,
  scale,
}: {
  insights: Insight[];
  scale?: number | null;
}) {
  // SECTION EXPAND STATE (show top 2 or all)
  const [expandedSection, setExpandedSection] = useState(false);

  // TEXT EXPANSION STATES (per insight)
  const [textOpen, setTextOpen] = useState<boolean[]>([]);

  useEffect(() => {
    if (!insights) return;
    // Initialize all as "closed"
    setTextOpen(new Array(insights.length).fill(false));
  }, [insights]);

  const visibleInsights = expandedSection ? insights : insights.slice(0, 2);

  const icons = useMemo(
    () => [Lightbulb, TrendingUp, Zap, BarChart2],
    []
  );

  if (!insights || insights.length === 0)
    return (
      <div className="text-neutral-500 text-sm bg-[#16151E] border border-[#2E2D39] rounded-xl p-5 text-center">
        No insights available yet.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-[#14131C]/90 to-[#0F0E17]/90 border border-[#2A2935] rounded-2xl p-6 shadow-[0_0_25px_rgba(108,99,255,0.15)] space-y-6"
    >
      <h2 className="text-xl font-bold bg-gradient-to-r from-[#00F5A0] to-[#6C63FF] bg-clip-text text-transparent text-center">
        Latest Insights
      </h2>

      {/* INSIGHTS */}
      <div className="space-y-5">
        <AnimatePresence>
          {visibleInsights.map((insight, i) => {
            const realIndex = expandedSection ? i : i; // same index
            const Icon = icons[i % icons.length];

            const color =
              insight.impact_score >= 8
                ? "#00F5A0"
                : insight.impact_score >= 5
                ? "#6C63FF"
                : "#FF4C4C";

            const isLong = insight.detail.length > 180;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl bg-[#1B1A24]/80 border border-[#2E2D39] hover:border-[#6C63FF]/40 transition-all shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: `${color}22`,
                        color,
                      }}
                    >
                      <Icon size={16} />
                    </div>

                    <h3 className="font-semibold text-white">{insight.title}</h3>
                  </div>

                  <span className="text-sm font-semibold" style={{ color }}>
                    {insight.impact_score}/10
                  </span>
                </div>

                {/* Impact Bar */}
                <div className="w-full h-2 bg-[#15141D] rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(insight.impact_score / 10) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${color}, #00F5A0)`,
                    }}
                  />
                </div>

                {/* TEXT */}
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {textOpen[realIndex] || !isLong
                    ? insight.detail
                    : insight.detail.slice(0, 180) + "…"}
                </p>

                {/* TOGGLE */}
                {isLong && (
                  <button
                    onClick={() => {
                      const copy = [...textOpen];
                      copy[realIndex] = !copy[realIndex];
                      setTextOpen(copy);
                    }}
                    className="mt-2 text-xs text-[#00F5A0] flex items-center gap-1"
                  >
                    {textOpen[realIndex] ? (
                      <>
                        Show less <ChevronUp size={12} />
                      </>
                    ) : (
                      <>
                        Read more <ChevronDown size={12} />
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* SHOW MORE SECTION */}
      {insights.length > 2 && (
        <div className="flex justify-center">
          <button
            onClick={() => setExpandedSection(!expandedSection)}
            className="text-sm text-[#6C63FF]"
          >
            {expandedSection ? "Show less ▲" : "Show more ▼"}
          </button>
        </div>
      )}

      {/* CHANNEL HEALTH SCORE */}
      {scale !== null && (
        <div className="pt-4">
          <div className="text-center text-neutral-400 text-sm mb-4 uppercase tracking-wide">
            Channel Health Score
          </div>

          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative flex items-center justify-center w-24 h-24 rounded-full bg-[#1B1A24] border border-[#2E2D39]"
            >
              <svg className="absolute inset-0 w-full h-full">
                <circle cx="50%" cy="50%" r="45%" stroke="#2A2935" strokeWidth="5" fill="none" />

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
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>

              <span className="text-[#00F5A0] font-bold text-lg">
                {scale.toFixed(1)}/10
              </span>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
