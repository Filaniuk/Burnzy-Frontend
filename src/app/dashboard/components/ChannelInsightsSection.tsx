"use client";

import { useState } from "react";
import ChannelInsightsDashboard from "@/app/dashboard/components/ChannelInsightsDashoard";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { apiFetch } from "@/lib/api";
import SectionTitle from "./SectionTitle";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import posthog from "posthog-js";
import { extractApiError } from "@/lib/errors";

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

  // ConfirmModal state for errors
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("An unexpected error occurred.");

  const fetchInsights = async () => {
    setLoading(true);

    posthog.capture("dashboard_channel_insights_cta_clicked", {
      tag: primary_channel.tag,
      version: primary_channel.version ?? null,
    });

    posthog.capture("dashboard_channel_insights_requested", {
      tag: primary_channel.tag,
      version: primary_channel.version ?? null,
    });

    try {
      const json = await apiFetch<any>("/api/v1/channel_insights", {
        method: "POST",
        body: JSON.stringify({
          channel_tag: primary_channel.tag,
          version: primary_channel.version,
        }),
      });

      const recs = json.data.recommendations || [];

      setInsights(recs);
      setScale(json.data.scale ?? null);

      posthog.capture("dashboard_channel_insights_succeeded", {
        tag: primary_channel.tag,
        version: primary_channel.version ?? null,
        insights_count: recs.length,
        has_scale: json.data.scale != null,
      });
    } catch (rawErr: any) {
      posthog.capture("dashboard_channel_insights_failed", {
        tag: primary_channel.tag,
        version: primary_channel.version ?? null,
        status: rawErr?.status ?? null,
        is_api_error: Boolean(rawErr?.isApiError),
      });

      const msg = extractApiError(rawErr) || "Unexpected error.";
      console.error("Insights fetch error:", msg);
      setErrorMsg(msg);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };


  if (primary_channel.is_topic) return null;

  const hasInsights = insights && insights.length > 0;

  return (
    <>
      <div className="w-full space-y-4 mt-6">
        <div className="mb-8">
          <SectionTitle title="Channel Insights" />
        </div>

        {/* CASE 1 — Insights exist */}
        {hasInsights ? (
          <ChannelInsightsDashboard insights={insights} scale={scale} />
        ) : (
          /* CASE 2 — No insights yet */
          <div className="flex flex-col items-center justify-center bg-[#16151E] border border-[#2E2D39] rounded-xl p-8">
            <p className="text-neutral-400 mb-4 text-sm text-center">
              No insights yet. Don't be shy, get some now!
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

      {/* ERROR MODAL */}
      <ConfirmModal
        show={errorOpen}
        title="Insights Error"
        description={errorMsg}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setErrorOpen(false)}
        onCancel={() => setErrorOpen(false)}
      />
    </>
  );
}
