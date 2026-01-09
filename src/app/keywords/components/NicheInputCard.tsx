"use client";

import { motion } from "framer-motion";

type Props = {
  keyword: string;
  setKeyword: (v: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
};

export default function NicheInputCard({ keyword, setKeyword, isLoading, onSubmit }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#16152a]/80 p-6 shadow-xl"
    >
      <div className="pointer-events-none inset-0 opacity-20">
        <div className="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-[#6C63FF] blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-[#00F5A0] blur-3xl" />
      </div>

      <div className="relative">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-white">Niche keyword</h2>
          <p className="text-sm mt-2 text-gray-400">
            Enter a keyword. We sample recent YouTube videos and score demand, momentum, and competition.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0F0E17] px-4 py-3 text-white placeholder-gray-500 shadow-sm outline-none ring-0 transition focus:border-[#6C63FF]/60 focus:ring-2 focus:ring-[#6C63FF]/30"
            placeholder="e.g., venezuela, saas business, ai agents"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit();
              }
            }}
            disabled={isLoading}
          />

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] px-6 py-3 font-semibold text-[#0F0E17] shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
          <p className="text-sm mt-2 text-gray-400">
            The evaluation uses a statistical approach for niche and keyword analysis. Our engine calculates metrics such as upload date, channel data, and views over time from YouTube Analytics to produce a precise analysis.          </p>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">50 probe videos from YouTube Search</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Median values</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Probe Metrics</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Custom Evaluation Engine</span>

        </div>
      </div>
    </motion.div>
  );
}
