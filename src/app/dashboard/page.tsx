"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Calendar, LineChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";

import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { GradientActionButton } from "@/components/GradientActionButton";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import { PurpleActionButton } from "@/components/PurpleActionButton";

import ActionButton from "./components/ActionButton";
import ChannelInsightsSection from "./components/ChannelInsightsSection";
import DashboardPlanModal from "./components/DashboardPlanModal";
import IdeaCountCard from "./components/IdeaCountCard";
import SectionTitle from "./components/SectionTitle";
import TrendIdeasSection from "./components/TrendIdeasSection";
import UpcomingTimeline from "./components/UpcomingTimeline";

import { DashboardOverviewResponse } from "@/types/dashboard";
import Unauthorized from "@/components/Unauthorized";

export default function DashboardPage() {
  const { user, loading, unauthorized } = useAuth();
  const router = useRouter();
  const loadedRef = useRef(false);

  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [noChannelModalOpen, setNoChannelModalOpen] = useState(false);

  // Error modal
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to load your dashboard.");

  // -----------------------------
  // Load Dashboard Overview
  // -----------------------------
  useEffect(() => {
    if (!user) return;
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function load() {
      try {
        const res = await apiFetch<DashboardOverviewResponse>("/api/v1/dashboard/overview");
        setData(res);
      } catch (err: any) {
        console.error("Dashboard failed:", err);
        // --- other errors ---
        setErrorMessage(err?.message || "Failed to load your dashboard.");
        setErrorOpen(true);
      } finally {
        setLoadingData(false);
      }

    }

    load();
  }, [user]);

  // -----------------------------
  // Refresh Upcoming Ideas Only
  // -----------------------------
  const refreshUpcoming = useCallback(async () => {
    try {
      const res = await apiFetch<any>("/api/v1/ideas/upcoming", {
        method: "GET",
      });
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, upcoming_ideas: res.data };
      });

    } catch (err: any) {
      console.error("Failed to refresh upcoming ideas:", err);
      setErrorMessage(err?.message || "Failed to refresh upcoming content.");
      setErrorOpen(true);
    }
  }, []);

  // -----------------------------
  // Loading State
  // ----------------------------
  if (unauthorized || !user) {
    return (
      <Unauthorized
        title="No analyses yet"
        description="You haven’t analyzed any channels or topics yet. Log in to continue."
        buttonText="Login"
      />
    );
  }

  if (loading || loadingData) {
    return <LoadingAnalysis message="Loading your dashboard" />;
  }

  if (!data) {
    return (
      <>
        <div className="min-h-screen bg-[#0F0E17]" />

        <ConfirmModal
          show={true}
          title="Dashboard Error"
          description="Failed to load dashboard data"
          confirmText="Retry"
          confirmColor="red"
          onConfirm={() => router.refresh()}
          onCancel={() => router.refresh()}
        />
      </>
    );
  }

  // -----------------------------
  // Extract response safely
  // -----------------------------
  const {
    primary_channel,
    ideas_counts,
    upcoming_ideas,
    idea_activity,
    latest_trend_ideas,
    competitors,
    plan,
  } = data;

  const planName =
    typeof plan?.name === "string" && plan.name.length > 0 ? plan.name : "free";

  const tag = primary_channel?.tag;
  const version = primary_channel?.version;

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <>
      <div className="min-h-screen bg-[#0F0E17] text-white py-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-6xl mx-auto w-full space-y-12"
        >
          {/* HEADER */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
              Creator Dashboard
            </h1>
            <p className="text-neutral-400 mt-2">
              Track your channel, ideas, insights & workflow.
            </p>
          </div>

          {/* PLAN CARD */}
          <div className="flex justify-center">
            <div className="px-5 py-4 rounded-2xl bg-[#16151E] border border-[#2E2D39] shadow-md text-center w-full sm:w-80">
              <p className="text-sm text-neutral-400">Current Plan</p>
              <p className="text-2xl font-semibold text-[#00F5A0] capitalize">
                {planName}
              </p>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ActionButton
              icon={<LineChart size={36} className="text-[#6C63FF]" />}
              title={primary_channel ? "Re-analyze Channel" : "Analyze Channel"}
              desc={
                primary_channel
                  ? "Refresh channel insights"
                  : "Connect your first channel"
              }
              onClick={() => router.push("/analyze")}
            />

            <ActionButton
              icon={<Calendar size={36} className="text-[#6C63FF]" />}
              title="Content Plan"
              desc="Get your unique trendy upload plan"
              onClick={() => {
                if (!primary_channel) {
                  setNoChannelModalOpen(true);
                  return;
                }
                setShowPlanModal(true);
              }}
            />

            <ActionButton
              icon={<Calendar size={36} className="text-[#F8E45C]" />}
              title="Open Calendar"
              desc="Plan content & deadlines"
              onClick={() => router.push("/calendar")}
            />
          </div>

          {/* PRIMARY CHANNEL */}
          <SectionTitle title="My Channel" />

          {!primary_channel ? (
            <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-8 text-center">
              <p className="text-lg font-semibold mb-2">No channel connected yet</p>
              <p className="text-neutral-400 mb-6">
                Connect your YouTube channel to unlock tailored analytics and trend ideas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GradientActionButton
                  label="➕ Add Existing Channel"
                  size="md"
                  onClick={() => router.push("/analyze?mode=channel")}
                />

                <button
                  onClick={() => router.push("/analyze?mode=topic")}
                  className="px-5 py-3 rounded-xl border border-[#00F5A0] text-neutral-200 hover:bg-[#1F1E29] transition"
                >
                  ✨ Start with a Topic Sandbox
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* CHANNEL CARD */}
              <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">
                    {primary_channel.is_topic ? "Primary topic" : "Primary channel"}
                  </p>

                  <h2 className="text-2xl font-semibold">
                    {primary_channel.channel_name}{" "}
                    <span className="text-neutral-500 text-sm">
                      ({primary_channel.tag})
                    </span>
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-300">
                    {!primary_channel.is_topic && (
                      <>
                        <span>
                          Subs: {primary_channel.subscribers?.toLocaleString() ?? "N/A"}
                        </span>
                        <span>
                          Avg views: {primary_channel.avg_views?.toLocaleString() ?? "N/A"}
                        </span>
                      </>
                    )}

                    <span>
                      Uploads/week:{" "}
                      {primary_channel.upload_frequency?.toFixed(1) ?? "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 text-sm">
                  <PurpleActionButton
                    onClick={() =>
                      router.push(
                        `/analyze?type=${primary_channel.is_topic ? "topic" : "channel"
                        }&tag=${encodeURIComponent(primary_channel.tag)}&version=${primary_channel.version
                        }`
                      )
                    }
                    label="Open Full Analysis →"
                    size="md"
                  />
                </div>
              </div>

              <ChannelInsightsSection primary_channel={primary_channel} />
            </>
          )}

          {/* IDEA PIPELINE */}
          <SectionTitle title="Idea Pipeline" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
            <IdeaCountCard label="New" count={ideas_counts.unassigned} color="#6C63FF" />
            <IdeaCountCard label="To Film" count={ideas_counts.to_film} color="#00F5A0" />
            <IdeaCountCard label="To Publish" count={ideas_counts.to_publish} color="#F8E45C" />
            <IdeaCountCard label="Published" count={ideas_counts.published} color="#FF6C6C" />
            <IdeaCountCard label="Archived" count={ideas_counts.archived} color="#FF6C6C" />
          </div>

          <div className="flex justify-center">
            <GradientActionButton
              onClick={() => router.push("/calendar")}
              label="Open Production Calender →"
              size="md"
            />
          </div>

          {/* TREND IDEAS */}
          {primary_channel && (
            <TrendIdeasSection
              tag={primary_channel.tag}
              version={primary_channel.version}
            />
          )}



          {primary_channel && (<>
            < SectionTitle title="Upcoming Content" />
            <UpcomingTimeline
              upcoming={upcoming_ideas}
              tag={primary_channel.tag}
              version={primary_channel.version}
              onRefreshUpcoming={refreshUpcoming}
            />

          </>)}
        </motion.div>

        {showPlanModal && (
          <DashboardPlanModal
            open={showPlanModal}
            channel={primary_channel}
            onClose={() => setShowPlanModal(false)}
          />
        )}
      </div>

      {/* GLOBAL DASHBOARD ERROR MODAL */}
      <ConfirmModal
        show={errorOpen}
        title="Dashboard Error"
        description={errorMessage}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setErrorOpen(false)}
        onCancel={() => setErrorOpen(false)}
      />

      <ConfirmModal
        show={noChannelModalOpen}
        title="Add primary channel first"
        description="You need to analyze a channel or a topic before generating a content plan."
        confirmText="Analyze"
        onConfirm={() => {
          setNoChannelModalOpen(false);
          router.push("/analyze");
        }}
        onCancel={() => setNoChannelModalOpen(false)}
      />

    </>
  );
}
