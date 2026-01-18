"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";
import posthog from "posthog-js";

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
  const safeIdeas = useMemo(() => (Array.isArray(ideas) ? ideas : []), [ideas]);

  const [savedStates, setSavedStates] = useState<Record<string, boolean>>({});
  const [limit, setLimit] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("An error occurred.");

  async function generateMore() {
    setLoadingMore(true);

    posthog.capture("trend_ideas_generate_more_clicked", {
      tag,
      version,
      currently_visible: limit,
      total_available: safeIdeas.length,
      last_generated: lastGenerated ?? null,
    });

    try {
      await onGenerateMore();

      posthog.capture("trend_ideas_generate_more_succeeded", {
        tag,
        version,
      });
    } catch (err: any) {
      posthog.capture("trend_ideas_generate_more_failed", {
        tag,
        version,
        status_code: err?.status ?? null,
        is_api_error: Boolean(err?.isApiError),
      });

      setErrorMsg(extractApiError(err) || "Failed to generate more ideas.");
      setErrorOpen(true);
    } finally {
      setLoadingMore(false);
    }
  }


  async function saveIdea(i: any) {
    posthog.capture("trend_idea_save_requested", {
      idea_uuid: i.uuid,
      tag,
      version,
    });

    try {
      await apiFetch<any>("/api/v1/ideas/save_from_trend", {
        method: "POST",
        body: JSON.stringify({
          idea_uuid: i.uuid,
          channel_tag: tag,
          version,
          user_title: i.title,
        }),
      });

      posthog.capture("trend_idea_save_succeeded", {
        idea_uuid: i.uuid,
        tag,
        version,
      });

      setSavedStates((prev) => ({ ...prev, [i.uuid]: true }));

      setTimeout(() => {
        setSavedStates((prev) => ({ ...prev, [i.uuid]: false }));
      }, 5000);
    } catch (err: any) {
      posthog.capture("trend_idea_save_failed", {
        idea_uuid: i.uuid,
        tag,
        version,
        status_code: err?.status ?? null,
        is_api_error: Boolean(err?.isApiError),
      });

      setErrorMsg(extractApiError(err) || "Failed to save idea.");
      setErrorOpen(true);
    }
  }


  return (
    <>
      <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-4 sm:p-6 mt-6">
        {/* Header: column on mobile, row on sm+ */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#00F5A0] to-[#6C63FF] bg-clip-text text-transparent leading-tight">
            Latest Trend Ideas
          </h2>

          {/* Button: full-width on mobile + size sm on mobile, md on sm+ */}
          <div className="w-full sm:w-auto">
            <div className="sm:hidden">
              <PurpleActionButton
                label="Generate More"
                onClick={generateMore}
                loading={loadingMore}
                size="sm"
              />
            </div>
            <div className="hidden sm:block">
              <PurpleActionButton
                label="Generate More"
                onClick={generateMore}
                loading={loadingMore}
                size="md"
              />
            </div>
          </div>
        </div>

        {lastGenerated && (
          <p className="text-neutral-500 text-xs sm:text-sm mb-3">
            Last updated: {new Date(lastGenerated).toISOString().split("T")[0]}
          </p>
        )}

        <div className="space-y-3">
          {safeIdeas.slice(0, limit).map((i) => (
            <motion.div
              key={i.uuid}
              whileHover={{ scale: 1.01 }}
              className="bg-[#1B1A24] border border-[#2E2D39] rounded-lg p-4"
            >
              <h3 className="font-semibold text-white leading-snug break-words">
                {i.title}
              </h3>

              {i.hook ? (
                <p className="text-neutral-400 text-sm mt-1 leading-snug break-words">
                  {i.hook}
                </p>
              ) : null}

              {savedStates[i.uuid] && (
                <p className="text-[#00F5A0] text-sm font-medium mt-2">
                  ✓ Saved to your calendar
                </p>
              )}

              {/* Actions: stack on mobile, row on sm+ */}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <div className="w-full sm:w-auto">
                  <PurpleActionButton
                    label={savedStates[i.uuid] ? "Saved!" : "Save Idea"}
                    size="sm"
                    onClick={() => saveIdea(i)}
                  />
                </div>

                <div className="w-full sm:w-auto">
                  <PurpleActionButton
                    label="Explore Full Idea"
                    size="sm"
                    onClick={() =>
                      window.open(`/idea/${i.uuid}?tag=${tag}&version=${version}`, "_blank")
                    }
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {limit < safeIdeas.length && (
          <div className="flex justify-center">
            <button
              onClick={() => setLimit(limit + 3)}
              className="mt-4 text-sm sm:text-md text-[#6C63FF]"
            >
              Load more
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        show={errorOpen}
        title="Trend Idea Error"
        description={errorMsg}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setErrorOpen(false)}
        onCancel={() => setErrorOpen(false)}
      />
    </>
  );
}
