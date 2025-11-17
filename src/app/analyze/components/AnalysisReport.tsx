"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import ActionButtons from "./ActionButton";
import AudienceProfileSection from "./AudienceProfileSection";
import DynamicSection from "./DynamicSection";
import InfoGrid from "./InfoGrid";
import KeywordSection from "./KeywordSection";
import ReportHeader from "./ReportHeader";

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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

// -----------------------------------------------
export default function AnalysisReport({ data, type }: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<"insights" | "ideas" | null>(
    null
  );
  const [reanalyzing, setReanalyzing] = useState(false);

  const [isPrimary, setIsPrimary] = useState(false);

  // Error modal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // -----------------------------------------------
  // Detect if this analysis is primary
  // -----------------------------------------------
  useEffect(() => {
    console.log("data:", data)
    if (!data?.meta?.id || !user) return;

    if (user.primary_channel_id === data.meta.id) {
      setIsPrimary(true);
    }
  }, [user, data]);

  // -----------------------------------------------
  // Update primary channel/topic
  // -----------------------------------------------
  async function togglePrimary() {
    if (!data?.meta?.id) return;

    const newValue = !isPrimary;
    setIsPrimary(newValue);

    try {
      await apiFetch("/api/v1/set_primary_channel", {
        method: "POST",
        body: JSON.stringify({ channel_id: data.meta.id }),
      });
    } catch (err) {
      console.error(err);
      setIsPrimary(!newValue);
      setErrorMessage("Failed to update primary channel.");
      setShowErrorModal(true);
    }
  }

  // -----------------------------------------------
  // Reanalyze logic
  // -----------------------------------------------
  const handleReanalyze = async () => {
    const tag = data?.meta?.tag;
    if (!tag) return;

    setReanalyzing(true);
    try {
      const endpoint =
        type === "channel"
          ? "/api/v1/analyze_channel?force_refresh=true"
          : "/api/v1/analyze_topic?force_refresh=true";

      const body =
        type === "channel"
          ? { channel_url: tag }
          : { topic: tag.startsWith("[new_topic_req]:") ? tag.slice(17) : tag };

      const res = await apiFetch<any>(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
      });

      router.push(
        `/analyze?type=${type}&tag=${encodeURIComponent(
          res.meta.tag
        )}&version=${res.meta.version}`
      );
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Something went wrong during reanalysis."
      );
      setShowErrorModal(true);
    } finally {
      setReanalyzing(false);
    }
  };

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

        {/* ⭐ PRIMARY CHANNEL TOGGLE */}
        <div className="flex items-center justify-center mt-10 mb-12 gap-4 select-none">
          <button
            onClick={togglePrimary}
            type="button"
            className={`relative inline-flex w-14 h-7 rounded-full transition-all duration-300 
      ${isPrimary ? "bg-[#00F5A0]" : "bg-[#2E2D39]"} 
      shadow-inner cursor-pointer outline-none border border-[#3A3A45]`}
            style={{ pointerEvents: "auto" }}
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-lg transform transition-all duration-300 
        ${isPrimary ? "translate-x-7" : "translate-x-0"}`}
              style={{ pointerEvents: "none" }}
            />
          </button>

          <span
            onClick={togglePrimary}
            className="text-neutral-300 text-sm cursor-pointer hover:text-white transition"
            style={{ pointerEvents: "auto" }}
          >
            Make this my primary {type === "channel" ? "channel" : "topic"}
          </span>
        </div>


        {/* Sections */}
        <InfoGrid data={data} />
        <KeywordSection keywords={data.top_keywords} />
        <AudienceProfileSection profile={data.audience_profile} />

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
          Generated by{" "}
          <span className="text-[#00F5A0]">AI Channel Strategist</span>
        </motion.div>
      </motion.div>

      {/* Error modal */}
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
