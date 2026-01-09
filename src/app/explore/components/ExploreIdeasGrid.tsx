"use client";

import { motion } from "framer-motion";
import type { ExploreIdeaSuggestion } from "@/types/explore";
import ExploreIdeaCard from "./ExploreIdeaCard";

export default function ExploreIdeasGrid({
  ideas,
  channelTag,
  version,
  batchUuid,
}: {
  ideas: ExploreIdeaSuggestion[];
  channelTag: string;
  version: number;
  batchUuid: string;
}) {
  if (!ideas?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-8"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Suggestions</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Pick one and get a full creative brief.
          </p>
        </div>
        <div className="text-xs text-white/40">
          Channel: <span className="text-white/70">{channelTag}</span> · Version {version}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {ideas.slice(0, 5).map((idea, i) => (
          <ExploreIdeaCard
            key={idea.uuid}
            idea={idea}
            index={i}
            channelTag={channelTag}
            version={version}
            batchUuid={batchUuid}
          />
        ))}
      </div>
    </motion.div>
  );
}
