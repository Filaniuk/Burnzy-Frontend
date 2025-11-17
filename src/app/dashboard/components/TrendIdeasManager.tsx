"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";

export default function TrendIdeasManager({
  tag,
  version,
}: {
  tag: string;
  version: number;
}) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const [loading, setLoading] = useState(false); // loading for initial fetch
  const [generating, setGenerating] = useState(false); // loading for Generate 5 More
  const [limit, setLimit] = useState(2);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/trend_ideas/latest_full", {
        method: "POST",
        body: JSON.stringify({ channel_tag: tag, version }),
      });

      setIdeas(res.data?.ideas?.reverse());
      setLastGenerated(res.data.last_generated);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function generateMore() {
    try {
      setGenerating(true);

      await apiFetch("/api/v1/trend_ideas/generate_more", {
        method: "POST",
        body: JSON.stringify({ channel_tag: tag, version }),
      });

      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-6 mt-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#00F5A0] to-[#6C63FF] bg-clip-text text-transparent text-center">
          Latest Trend Ideas
        </h2>

        <PurpleActionButton
          label="Generate 5 More"
          onClick={generateMore}
          loading={generating}  
          disabled={generating}
          size="md"
        />
      </div>

      {lastGenerated && (
        <p className="text-neutral-500 text-sm mb-3">
          Last updated: {new Date(lastGenerated).toISOString().split("T")[0]}
        </p>
      )}

      {/* Idea List */}
      <div className="space-y-3">
        {ideas.slice(0, limit).map((i) => (
          <motion.div
            key={i.uuid}
            whileHover={{ scale: 1.01 }}
            className="bg-[#1B1A24] border border-[#2E2D39] rounded-lg p-4"
          >
            <h3 className="font-semibold">{i.title}</h3>
            <p className="text-neutral-400 text-sm">{i.hook}</p>

            <div className="mt-3 flex gap-3">
              <GradientActionButton
                label="Save Idea"
                size="sm"
                onClick={async () => {
                  await apiFetch("/api/v1/ideas/save_from_trend", {
                    method: "POST",
                    body: JSON.stringify({
                      idea_uuid: i.uuid,
                      channel_tag: tag,
                      version,
                      user_title: i.title,
                    }),
                  });
                }}
              />
              <GradientActionButton
                label="🔍 Explore Full Idea"
                size="sm"
                onClick={() =>
                  (window.location.href = `/idea/${i.uuid}?tag=${tag}&version=${version}`)
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
