"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { apiFetch } from "@/lib/api";

export default function TrendIdeasManager({
  tag,
  version,
  ideas,
  lastGenerated,
  onGenerateMore,
}: {
  tag: string;
  version: number;
  ideas: any[];
  lastGenerated: string | null;
  onGenerateMore: () => Promise<void>;
}) {
  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});
  const [limit, setLimit] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);

  async function generateMore() {
    setLoadingMore(true);
    await onGenerateMore();
    setLoadingMore(false);
  }

  async function saveIdea(i: any) {
    try {
      await apiFetch("/api/v1/ideas/save_from_trend", {
        method: "POST",
        body: JSON.stringify({
          idea_uuid: i.uuid,
          channel_tag: tag,
          version,
          user_title: i.title,
        }),
      });


    } catch (err) {
      console.error(err);
    }
    finally {
      setSavedStates((prev) => ({ ...prev, [i.uuid]: true }));
      setTimeout(() => {
        setSavedStates((prev) => ({ ...prev, [i.uuid]: false }));
      }, 5000);
    }
  }

  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-6 mt-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#00F5A0] to-[#6C63FF] bg-clip-text text-transparent">
          Latest Trend Ideas
        </h2>

        <PurpleActionButton
          label="Generate 5 More"
          onClick={generateMore}
          loading={loadingMore}
          size="md"
        />
      </div>

      {lastGenerated && (
        <p className="text-neutral-500 text-sm mb-3">
          Last updated: {new Date(lastGenerated).toISOString().split("T")[0]}
        </p>
      )}

      <div className="space-y-3">
        {ideas.slice(0, limit).map((i) => (
          <motion.div
            key={i.uuid}
            whileHover={{ scale: 1.01 }}
            className="bg-[#1B1A24] border border-[#2E2D39] rounded-lg p-4"
          >
            <h3 className="font-semibold">{i.title}</h3>
            <p className="text-neutral-400 text-sm">{i.hook}</p>

            {savedStates[i.uuid] && (
              <p className="text-[#00F5A0] text-sm font-medium mt-2">
                ✓ Saved to your calendar
              </p>
            )}

            <div className="mt-3 flex gap-3">
              <GradientActionButton
                label={savedStates[i.uuid] ? "Saved!" : "Save Idea"}
                size="sm"
                onClick={() => saveIdea(i)}
              />

              <GradientActionButton
                label="🔍 Explore Full Idea"
                size="sm"
                onClick={() =>
                  window.open(
                    `/idea/${i.uuid}?tag=${tag}&version=${version}`,
                    "_blank"
                  )
                }
              />
            </div>
          </motion.div>
        ))}
      </div>

      {limit < ideas.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setLimit(limit + 3)}
            className="mt-4 text-md text-[#6C63FF]"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
