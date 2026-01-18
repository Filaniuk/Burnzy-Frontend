"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";

import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import ActionButtons from "./ActionButton";
import AudienceProfileSection from "./AudienceProfileSection";
import DynamicSection from "./DynamicSection";
import InfoGrid from "./InfoGrid";
import KeywordSection from "./KeywordSection";
import ReportHeader from "./ReportHeader";
import ToggleSwitch from "@/components/ToggleSwitch";

// -----------------------------------------------
// Types
// -----------------------------------------------
type AnalysisData = {
  channel_niche: string;
  primary_language: string;
  likely_audience_region: string;
  tone: string;
  content_style: string;
  video_format: string;
  avg_upload_frequency: number;
  engagement_level: string;
  top_keywords: string[];
  audience_profile: string;
  meta: { tag: string; version: number; id?: number };
};

interface Props {
  data: AnalysisData;
  type: "channel" | "topic";
}

// -----------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

// -----------------------------------------------
export default function AnalysisReport({ data, type }: Props) {
  const router = useRouter();
  const { user, setPrimaryChannelId } = useAuth();

  const [activeSection, setActiveSection] =
    useState<"insights" | "ideas" | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  // ✅ Keep the latest analysis id in local state
  const [analysisId, setAnalysisId] = useState<number | null>(
    data?.meta?.id ?? null
  );

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // -----------------------------------------------
  // Update analysisId whenever data.meta.id changes
  // -----------------------------------------------
  useEffect(() => {
    setAnalysisId(data?.meta?.id ?? null);
  }, [data?.meta?.id]);

  // -----------------------------------------------
  // Detect if this analysis is user's primary (based on auth context)
  // -----------------------------------------------
  useEffect(() => {
    if (!analysisId || !user) return;
    setIsPrimary(user.primary_channel_id === analysisId);
  }, [user, analysisId]);

  // -----------------------------------------------
  // Toggle primary channel/topic
  // -----------------------------------------------
  async function togglePrimary() {
    const id = analysisId;
    if (!id) return;

    if (user?.primary_channel_id === id) return;

    // optimistic UI
    setIsPrimary(true);

    try {
      posthog.capture("primary_channel_set_requested", {
        analysis_id: id,
        type,
      });
      await apiFetch<any>("/api/v1/set_primary_channel", {
        method: "POST",
        body: JSON.stringify({ channel_id: id }),
      });
      setPrimaryChannelId(id);
      posthog.capture("primary_channel_set_succeeded", {
        analysis_id: id,
        type,
      });
    } catch (err) {
      console.error(err);
      posthog.capture("primary_channel_set_failed", {
        analysis_id: id,
        type,
        status: (err as any)?.status ?? null,
        is_api_error: Boolean((err as any)?.isApiError),
      });
      setIsPrimary(user?.primary_channel_id === id);
      setErrorMessage(extractApiError(err));
      setShowErrorModal(true);
    }
  }

  // -----------------------------------------------
  // Reanalyze logic
  // -----------------------------------------------
  const handleReanalyze = async () => {
    const tag = data?.meta?.tag;
    if (!tag) {
      setErrorMessage("Invalid analysis data: missing tag.");
      setShowErrorModal(true);
      return;
    }
    setReanalyzing(true);

    try {
      const endpoint =
        type === "channel"
          ? "/api/v1/analyze_channel?force_refresh=true"
          : "/api/v1/analyze_topic?force_refresh=true";

      const body =
        type === "channel"
          ? { channel_url: tag }
          : {
            topic: tag.startsWith("[new_topic_req]:") ? tag.slice(17) : tag,
          };

      posthog.capture("analysis_reanalyze_requested", {
        type,
        analysis_id: analysisId,
        tag: data?.meta?.tag ?? null,
        version: data?.meta?.version ?? null,
      });
      const res = await apiFetch<any>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res?.meta?.tag || !res?.meta?.version) {
        throw new Error("Invalid response from analysis API.");
      }

      if (res?.meta?.id) {
        setAnalysisId(res.meta.id);
      }

      setIsPrimary(false);
      posthog.capture("analysis_reanalyze_succeeded", {
        type,
        previous_analysis_id: analysisId,
        new_analysis_id: res?.meta?.id ?? null,
        new_tag: res?.meta?.tag ?? null,
        new_version: res?.meta?.version ?? null,
      });
      router.push(
        `/analyze?type=${type}&tag=${encodeURIComponent(
          res.meta.tag
        )}&version=${res.meta.version}`
      );

      router.refresh();
    } catch (err) {
      posthog.capture("analysis_reanalyze_failed", {
        type,
        analysis_id: analysisId,
        status: (err as any)?.status ?? null,
        is_api_error: Boolean((err as any)?.isApiError),
      });

      setErrorMessage(extractApiError(err));
      setShowErrorModal(true);
    } finally {
      setReanalyzing(false);
    }
  };

  // -----------------------------------------------
  // If no data loaded
  // -----------------------------------------------
  if (!data) {
    return (
      <div className="text-red-500 text-center mt-20">
        Failed to load analysis.
      </div>
    );
  }

  // -----------------------------------------------
  return (
    <>
      <motion.div
        className="bg-[#0F0E17] rounded-3xl border border-[#1D1C26] p-8 mt-12 text-white shadow-2xl relative"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {/* Header */}
        <ReportHeader
          data={data}
          type={type}
          reanalyzing={reanalyzing}
          onReanalyze={handleReanalyze}
        />

        {/* Primary Toggle (Improved) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-10"
        >
          <div
            className={[
              "mx-auto w-full max-w-xl",
              "rounded-2xl border p-4 sm:p-5",
              "bg-gradient-to-b from-[#141321] to-[#0F0E17]",
              "shadow-[0_0_0_1px_rgba(0,245,160,0.05),0_20px_60px_rgba(0,0,0,0.35)]",
              isPrimary
                ? "border-[#00F5A0]/40 ring-1 ring-[#00F5A0]/25"
                : "border-[#1D1C26] hover:border-[#2A2936]",
              "transition-all",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-4 select-none">
              {/* Left text */}
              <div className="flex items-start gap-3">
                <div className="leading-tight">
                  <div className="flex items-center gap-2">
                    <p className="text-sm sm:text-base text-white/90">
                      <span className="font-semibold text-white">
                        Make this my primary{" "}
                        <span className="text-[#00F5A0]">
                          {type === "channel" ? "channel" : "topic"}
                        </span>
                      </span>
                    </p>

                    {isPrimary && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00F5A0]/15 text-[#00F5A0] border border-[#00F5A0]/25">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-white/50">
                    This will be used as your default in the dashboard and future activities.
                  </p>
                </div>
              </div>

              {/* Right toggle */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-white/40">
                    {isPrimary ? "Primary is enabled" : "Set as primary"}
                  </p>
                </div>

                {/* block toggle clicks while reanalyzing without changing ToggleSwitch */}
                <div
                  className={[
                    "rounded-full px-2 py-1",
                    isPrimary ? "bg-[#00F5A0]/10" : "bg-white/5",
                    "border border-white/10",
                    reanalyzing ? "opacity-60 pointer-events-none" : "",
                  ].join(" ")}
                >
                  <ToggleSwitch enabled={isPrimary} onToggle={togglePrimary} label="" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content sections */}
        <InfoGrid data={data} />
        <KeywordSection keywords={data.top_keywords || []} />
        <AudienceProfileSection profile={data.audience_profile || ""} />

        <ActionButtons
          type={type}
          onShowInsights={() => setActiveSection("insights")}
          onGenerateIdeas={() => setActiveSection("ideas")}
        />

        <DynamicSection
          activeSection={activeSection}
          tag={data.meta.tag}
          version={data.meta.version}
        />

        <motion.div
          variants={fadeUp}
          className="mt-10 text-center text-neutral-500 text-sm"
        >
          Generated with <span className="text-[#00F5A0]">Burnzy</span>
        </motion.div>
      </motion.div>

      {/* Error Modal */}
      <ConfirmModal
        show={showErrorModal}
        title="Action Failed"
        description={errorMessage}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
      />
    </>
  );
}
