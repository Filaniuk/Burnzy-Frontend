"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { user } = useAuth();

  const [activeSection, setActiveSection] =
    useState<"insights" | "ideas" | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // -----------------------------------------------
  // Detect if this analysis is user's primary
  // -----------------------------------------------
  useEffect(() => {
    if (!data?.meta?.id || !user) return;
    if (user.primary_channel_id === data.meta.id) setIsPrimary(true);
  }, [user, data]);

  // -----------------------------------------------
  // Toggle primary channel/topic
  // -----------------------------------------------
  async function togglePrimary() {
    const id = data?.meta?.id;
    if (!id) return;

    const newValue = !isPrimary;
    setIsPrimary(newValue);

    try {
      await apiFetch<any>("/api/v1/set_primary_channel", {
        method: "POST",
        body: JSON.stringify({ channel_id: id }),
      });
    } catch (err) {
      console.error(err);
      setIsPrimary(!newValue); // revert state
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
              topic: tag.startsWith("[new_topic_req]:")
                ? tag.slice(17)
                : tag,
            };

      const res = await apiFetch<any>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res?.meta?.tag || !res?.meta?.version) {
        throw new Error("Invalid response from analysis API.");
      }

      router.push(
        `/analyze?type=${type}&tag=${encodeURIComponent(
          res.meta.tag
        )}&version=${res.meta.version}`
      );
    } catch (err) {
      console.error(err);
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

        {/* Primary Toggle */}
        <div className="flex items-center justify-center mb-8 gap-4 select-none">
          <ToggleSwitch
            enabled={isPrimary}
            onToggle={togglePrimary}
            label={`Make this my primary ${
              type === "channel" ? "channel" : "topic"
            }`}
          />
        </div>

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
          Generated with{" "}
          <span className="text-[#00F5A0]">AI Channel Engine</span>
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
