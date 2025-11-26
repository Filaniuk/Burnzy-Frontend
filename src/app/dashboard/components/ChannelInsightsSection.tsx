"use client";

import { useState } from "react";
import ChannelInsightsDashboard from "@/app/dashboard/components/ChannelInsightsDashoard";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { apiFetch } from "@/lib/api";
import SectionTitle from "./SectionTitle";

export default function ChannelInsightsSection({
  primary_channel,
}: {
  primary_channel: any;
}) {
  const [insights, setInsights] = useState(
    primary_channel.insights?.recommendations || null
  );
  const [scale, setScale] = useState(primary_channel.insights?.scale || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize error from ANY source (network, API, unexpected)
  const normalizeError = (err: any) => {
    if (!err || typeof err !== "object") {
      return { detail: "Unknown error occurred." };
    }
    return {
      detail: err.detail || err.message || "Unexpected error.",
    };
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const json = await apiFetch("/api/v1/channel_insights", {
        method: "POST",
        body: JSON.stringify({
          channel_tag: primary_channel.tag,
          version: primary_channel.version,
        }),
      });

      setInsights(json.data.recommendations || []);
      setScale(json.data.scale ?? null);
    } catch (rawErr: any) {
      const err = normalizeError(rawErr);
      console.error("Insights fetch error:", err);
      setError(err.detail);
    } finally {
      setLoading(false);
    }
  };

  const hasInsights = insights && insights.length > 0;

  if(primary_channel.is_topic) {
    return;
  }

  return (
    <div className="w-full space-y-4 mt-6">
      {/* Title */}
      <div className="mb-8">
        <SectionTitle title="Channel Insights" />
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm bg-red-950/30 border border-red-700/40 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* CASE 1 — Insights exist */}
      {hasInsights ? (
        <ChannelInsightsDashboard insights={insights} scale={scale} />
      ) : (
        /* CASE 2 — No insights yet */
        <div className="flex flex-col items-center justify-center bg-[#16151E] border border-[#2E2D39] rounded-xl p-8">
          <p className="text-neutral-400 mb-4 text-sm text-center">
            No insights have been generated yet. Don't be shy, get some now!
          </p>

          <PurpleActionButton
            label="✨ Get Channel Insights"
            loading={loading}
            onClick={fetchInsights}
            size="md"
          />
        </div>
      )}
    </div>
  );
}
