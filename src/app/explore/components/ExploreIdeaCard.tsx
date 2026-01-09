"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import type { ExploreIdeaSuggestion } from "@/types/explore";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function ExploreIdeaCard({
  idea,
  index,
  channelTag,
  version,
  batchUuid,
}: {
  idea: ExploreIdeaSuggestion;
  index: number;
  channelTag: string;
  version: number;
  batchUuid: string;
}) {
  const imageUrl =
    idea.mocked_thumbnail_url
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/mocked-thumbnails/${idea.mocked_thumbnail_url}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.25) }}
      className="rounded-3xl border border-white/10 bg-[#14131C] shadow-xl overflow-hidden"
    >
      {imageUrl ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={idea.title}
            className="w-full h-[170px] object-cover blur-md"
          />

          {/* Dark gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

          {/* Centered thumbnail text */}
          {idea.thumbnail_mockup_text ? (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div
                className={cn(
                  "text-center font-extrabold uppercase tracking-tight",
                  "text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]",
                  "text-3xl sm:text-2xl leading-none"
                )}
              >
                {idea.thumbnail_mockup_text}
              </div>
            </div>
          ) : null}

          {/* Bottom chips */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/85">
              {idea.format == "long_form" ? "Long" : "Shorts"}
            </span>
            {typeof idea.trend_score === "number" && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10 text-white/85">
                Trend score: {idea.trend_score}/10
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-5 pb-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
              {idea.format || "Idea"}
            </span>
            {typeof idea.trend_score === "number" && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                Trend score: {idea.trend_score}/10
              </span>
            )}
          </div>
        </div>
      )}

      <div className={cn("p-5", imageUrl ? "pt-4" : "pt-4")}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight">{idea.title}</h3>
          <div className="w-9 h-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#6C63FF]" />
          </div>
        </div>

        {idea.meaning_short && (
          <p className="mt-2 text-sm text-white/70 leading-relaxed">
            {idea.meaning_short}
          </p>
        )}

        {idea.hook && (
          <div className="mt-4 rounded-2xl bg-[#0F0E17] border border-white/10 p-4">
            <p className="text-xs text-white/50 mb-1">Hook</p>
            <p className="text-sm text-white/85 leading-relaxed">{idea.hook}</p>
          </div>
        )}

        {idea.outline?.length ? (
          <div className="mt-4">
            <p className="text-xs text-white/50 mb-2">Outline</p>
            <ul className="space-y-2">
              {idea.outline.slice(0, 4).map((item, i) => (
                <li key={i} className="text-sm text-white/75 flex gap-2">
                  <span className="text-white/40">•</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between gap-3">
          <PurpleActionButton
            label="Explore idea"
            size="sm"
            onClick={() =>
              window.open(
                `/idea/${idea.uuid}?tag=${encodeURIComponent(channelTag)}&version=${version}&explore_batch_uuid=${encodeURIComponent(batchUuid)}`,
                "_blank"
              )
            }
          />
          <span className="text-xs text-white/45 text-right">
            Click to get a full brief
          </span>
        </div>
      </div>
    </motion.div>
  );
}
