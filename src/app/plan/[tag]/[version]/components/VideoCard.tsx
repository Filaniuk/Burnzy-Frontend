"use client";

import { motion } from "framer-motion";
import { CalendarDays, Star } from "lucide-react";
import { GradientActionButton } from "@/components/GradientActionButton";

interface Props {
  v: any;
  plan: any;
}

export default function VideoCard({ v, plan }: Props) {
  return (
    <motion.article
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="bg-[#14131C] border border-[#2E2D39] rounded-2xl p-6 hover:border-[#6C63FF]/40 transition-all shadow-sm flex flex-col justify-between"
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-1 leading-snug">
        {v.title}
      </h3>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mb-3">
        <span className="flex items-center gap-1">
          <CalendarDays size={14} /> {v.date}
        </span>
        <span className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400" /> {v.trend_score}/10
        </span>
      </div>

      {/* Hook */}
      {v.hook && (
        <p className="text-neutral-300 text-sm mb-3 leading-relaxed">
          {v.hook}
        </p>
      )}

      {/* Outline */}
      {v.outline && (
        <ul className="list-disc list-inside text-neutral-400 text-sm space-y-1 mb-3">
          {v.outline.map((point: string, idx: number) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      )}

      {/* Why This Idea */}
      {v.why_this_idea && (
        <p className="text-sm text-neutral-500 italic mb-5">
          🎯 {v.why_this_idea}
        </p>
      )}

      {/* CTA Button */}
      <div className="mt-auto pt-2">
        <GradientActionButton
          onClick={() =>
            window.open(
              `/idea/${v.uuid}?tag=${encodeURIComponent(plan.channel_tag)}&version=${plan.version}`,
              "_blank"
            )
          }
          label="🔍 Explore Full Idea"
          size="md"
        />
      </div>
    </motion.article>
  );
}
