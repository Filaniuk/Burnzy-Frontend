"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";

import ContentPlanHeader from "./components/ContentPlanHeader";
import WeeklyPlanSection from "./components/WeeklyPlanSection";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";

// Global cache to avoid refetching under React strict mode
const fetchedPlans = new Set<string>();

export default function ContentPlanPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const tag = decodeURIComponent(params.tag as string);
  const version = params.version ? Number(params.version) : 1;
  const uploadsPerWeek = Number(searchParams.get("uploads") || 2);
  const weeks = Number(searchParams.get("weeks") || 3);

  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "green" | "red" | "yellow",
  });
  const [confirmImport, setConfirmImport] = useState(false);

  // ---------------------------------------------
  // FETCH PLAN
  // ---------------------------------------------
  useEffect(() => {
    const key = `${tag}-${version}`;
    if (fetchedPlans.has(key)) return;
    fetchedPlans.add(key);

    async function fetchPlan() {
      setLoading(true);
      try {
        const res = await apiFetch<any>("/api/v1/content_plan", {
          method: "POST",
          body: JSON.stringify({
            channel_tag: tag,
            uploads_per_week: uploadsPerWeek,
            weeks,
            version,
          }),
        });

        if (!res?.data || !res.data.weekly_plan) {
          throw new Error("Invalid or empty plan data received from server.");
        }

        setPlan(res.data);
      } catch (err: any) {
        console.error(err);
        setFeedback({
          show: true,
          title: "Failed to Load Plan",
          description: err.message || "We couldn’t load your content plan.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [tag, version, uploadsPerWeek, weeks]);

  // ---------------------------------------------
  // IMPORT PLAN → CALENDAR
  // ---------------------------------------------
  async function handleImportPlan() {
    if (!plan?.plan_uuid) {
      setFeedback({
        show: true,
        title: "Missing Plan ID",
        description: "This plan does not have a valid identifier.",
        color: "red",
      });
      return;
    }

    try {
      const res = await apiFetch("/api/v1/calendar/import_plan", {
        method: "POST",
        body: JSON.stringify({
          plan_uuid: plan.plan_uuid,
          mode: "filming", // always TO_FILM for new ideas
        }),
      });

      setFeedback({
        show: true,
        title: "Plan Imported",
        description:
          "Your content plan has been successfully added to your calendar.",
        color: "green",
      });
    } catch (err: any) {
      setFeedback({
        show: true,
        title: "Import Failed",
        description: err.message || "Failed to import plan.",
        color: "red",
      });
    }
  }

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------
  if (loading)
    return (
      <LoadingAnalysis
        message="Building your content plan..."
        secondary_message="This is a big request — it may take a moment."
      />
    );

  // ---------------------------------------------
  // NO PLAN
  // ---------------------------------------------
  if (!plan)
    return (
      <main className="min-h-screen bg-[#0F0E17] text-white flex flex-col items-center justify-center px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl sm:text-2xl font-semibold mb-3"
        >
          Something went wrong.
        </motion.h2>
        <p className="text-neutral-400 mb-6 max-w-md">
          We couldn’t find a content plan for this channel. Try regenerating it.
        </p>

        <ConfirmModal
          show={feedback.show}
          onConfirm={() => setFeedback({ ...feedback, show: false })}
          onCancel={() => setFeedback({ ...feedback, show: false })}
          confirmText="OK"
          title={feedback.title}
          description={feedback.description}
          confirmColor={feedback.color}
        />
      </main>
    );

  // ---------------------------------------------
  // RENDER CONTENT PLAN
  // ---------------------------------------------
  return (
    <main className="min-h-screen bg-[#0F0E17] text-white py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HEADER */}
        <ContentPlanHeader plan={plan} />
        {/* Add Plan to Calendar */}
        <div className="flex justify-center">
          <PurpleActionButton
            label="📅 Import Plan To Calendar"
            size="lg"
            onClick={() => setConfirmImport(true)}
          />
        </div>
        {/* WEEKLY PLAN */}
        <section className="space-y-10">
          {plan.weekly_plan.map((week: any) => (
            <WeeklyPlanSection key={week.week} week={week} plan={plan} />
          ))}
        </section>

        {/* IMPORT BUTTON */}
        <div className="text-center mt-14 space-y-6">

          {/* Back Button */}
          <button
            onClick={() => history.back()}
            className="px-5 py-2.5 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39] 
                       text-neutral-300 border border-[#2E2D39] transition-all"
          >
            ← Back to Portfolio
          </button>
        </div>
      </div>

      {/* CONFIRM IMPORT MODAL */}
      <ConfirmModal
        show={confirmImport}
        onCancel={() => setConfirmImport(false)}
        onConfirm={() => {
          setConfirmImport(false);
          handleImportPlan();
        }}
        confirmText="Import"
        title="Add Plan to Calendar?"
        description="This will add all videos from this plan to your calendar. Existing ideas will keep their status; new ideas will be marked as 'To Film'."
        confirmColor="green"
      />

      {/* FEEDBACK MODAL */}
      <ConfirmModal
        show={feedback.show}
        onCancel={() => setFeedback({ ...feedback, show: false })}
        onConfirm={() => setFeedback({ ...feedback, show: false })}
        confirmText="OK"
        title={feedback.title}
        description={feedback.description}
        confirmColor={feedback.color}
      />
    </main>
  );
}
