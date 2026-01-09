"use client";

import { motion } from "framer-motion";

type Props = {
  hotTopics: string[];
};

export default function NicheHotTopicsCard({ hotTopics }: Props) {
  const topics = Array.isArray(hotTopics) ? hotTopics.filter(Boolean) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-[#2a2750] bg-[#16152a]/70 p-6 shadow-[0_0_40px_rgba(108,99,255,0.08)]"
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-white">Hot topics</h3>
        <div className="rounded-full bg-[#00F5A0]/10 px-3 py-1 text-xs font-semibold text-[#00F5A0]">
          3–7 ideas
        </div>
      </div>

      {topics.length === 0 ? (
        <div className="mt-4 text-sm text-white/60">No topics were returned.</div>
      ) : (
        <ul className="mt-5 space-y-2">
          {topics.map((t, idx) => (
            <li key={`${t}-${idx}`} className="flex items-start gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#6C63FF]" />
              <span className="text-sm text-white/85">{t}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
