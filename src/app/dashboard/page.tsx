"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, LineChart, Users, LayoutDashboard } from "lucide-react";
import { apiFetch, getDashboardOverview, getUpcomingIdeas } from "@/lib/api";

import { GradientActionButton } from "@/components/GradientActionButton";
import ActionButton from "./components/ActionButton";
import EmptyState from "./components/EmptyState";
import IdeaCountCard from "./components/IdeaCountCard";
import SectionTitle from "./components/SectionTitle";
import TrendIdeasManager from "./components/TrendIdeasManager";
import { DashboardOverviewResponse } from "@/types/dashboard";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ChannelInsightsDashoard from "./components/ChannelInsightsDashoard";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import TrendIdeasDashboard from "./components/TrendIdeasDashboard";
import DashboardPlanModal from "./components/DashboardPlanModal";
import UpcomingTimeline from "./components/UpcomingTimeline";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardOverviewResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showAllTrendIdeas, setShowAllTrendIdeas] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);


  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const res = await getDashboardOverview();
        setData(res);
      } catch (err) {
        console.error("Dashboard failed:", err);
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, [user]);

  if (loading || loadingData) {
    return (
      <div><LoadingAnalysis message="Loading your dashboard" /></div>
    );
  }

  async function refreshUpcoming() {
    const res = await getUpcomingIdeas();

    setData(prev => ({
      ...prev,                    
      upcoming_ideas: res.data,   
    }));
  }




  if (!user || !data) {
    return (
      <div className="min-h-screen bg-[#0F0E17] flex items-center justify-center text-white">
        Not logged in
      </div>
    );
  }

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
    typeof plan?.name === "string" && plan.name.length > 0
      ? plan.name
      : "free";

  const trendsForPrimary = latest_trend_ideas?.[0] || null;
  const tag = primary_channel?.tag;
  const version = primary_channel?.version;

  return (
    <div className="min-h-screen bg-[#0F0E17] text-white py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto w-full space-y-12"
      >
        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
            Creator Dashboard
          </h1>
          <p className="text-neutral-400 mt-2">
            Track your channel, ideas, competitors, insights & workflow.
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

        {/* TOP ACTION BUTTONS */}
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
            onClick={() => setShowPlanModal(true)}
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
            <p className="text-lg font-semibold mb-2">
              No channel connected yet
            </p>
            <p className="text-neutral-400 mb-6">
              Connect your YouTube channel to unlock tailored analytics and
              trend ideas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GradientActionButton
                label="➕ Add Existing Channel"
                size="md"
                onClick={() => router.push("/analyze?mode=channel")}
              />

              <button
                onClick={() => router.push("/analyze?mode=topic")}
                className="px-5 py-3 rounded-xl border border-[#00F5A0] text-neutral-200 text-md hover:bg-[#1F1E29] transition"
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
                        Subs:{" "}
                        {primary_channel.subscribers?.toLocaleString() ?? "N/A"}
                      </span>
                      <span>
                        Avg views:{" "}
                        {primary_channel.avg_views?.toLocaleString() ?? "N/A"}
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
                      `/analyze?type=${primary_channel.is_topic ? "topic" : "channel"}&tag=${encodeURIComponent(
                        primary_channel.tag
                      )}&version=${primary_channel.version}`
                    )
                  }
                  label="Open Full Analysis →"
                  size="md"
                />

              </div>
            </div>

            {/* CHANNEL INSIGHTS */}
            {primary_channel?.insights && !primary_channel.is_topic && (
              <>
                <SectionTitle title="Channel Insights" />

                <ChannelInsightsDashoard
                  insights={primary_channel.insights.recommendations}
                  scale={primary_channel.insights.scale}
                />
              </>
            )}
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

        {/* NEW: Link to Board */}
        <div className="flex justify-center">
          <GradientActionButton
            onClick={() => router.push("/calendar")}
            label="Open Production Calender →"
            size="md"
          />
        </div>

        {/* UPCOMING CONTENT */}
        <SectionTitle title="Upcoming Content" />

        {upcoming_ideas.length === 0 ? (
          <EmptyState
            label="Nothing scheduled yet."
            action="Open calendar"
            onClick={() => router.push("/calendar")}
          />
        ) : (
          <UpcomingTimeline
            upcoming={upcoming_ideas}
            tag={primary_channel.tag}
            version={primary_channel.version}
            onRefreshUpcoming={refreshUpcoming}
          />
        )}


        <SectionTitle title="Trend Ideas" />
        {primary_channel && (
          <TrendIdeasDashboard tag={primary_channel.tag} version={primary_channel.version} />
        )}

        {primary_channel && (
          <TrendIdeasManager tag={primary_channel.tag} version={primary_channel.version} />
        )}


      </motion.div>
      {showPlanModal && primary_channel && (
        <DashboardPlanModal
          channel={primary_channel}
          onClose={() => setShowPlanModal(false)}
        />
      )}

    </div>
  );
}
