"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";

import ContentPlanHeader from "./components/ContentPlanHeader";
import WeeklyPlanSection from "./components/WeeklyPlanSection";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

import { PurpleActionButton } from "@/components/PurpleActionButton";

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
    color: "red" as "red" | "yellow" | "green",
  });

  const [confirmImport, setConfirmImport] = useState(false);
  const fetchRef = useRef<string | null>(null);

  // ----------------------------------------------------
  // FETCH CONTENT PLAN
  // ----------------------------------------------------
  useEffect(() => {
    const key = `${tag}-${version}-${uploadsPerWeek}-${weeks}`;

    if (fetchRef.current === key) return; // strict mode double-call guard
    fetchRef.current = key;

    async function load() {
      setLoading(true);

      try {
        const res = await apiFetch("/api/v1/content_plan", {
          method: "POST",
          body: JSON.stringify({
            channel_tag: tag,
            uploads_per_week: uploadsPerWeek,
            weeks,
            version,
          }),
        });

        if (!res?.data || !res.data.weekly_plan) {
          throw new Error("Invalid or missing plan data.");
        }

        setPlan(res.data);
      } catch (err: any) {
        console.error("[ContentPlan] Failed:", err);

        setFeedback({
          show: true,
          title: "Failed to Build Content Plan",
          description:
            err?.message ||
            "Your content plan could not be generated. Please try again.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tag, version, uploadsPerWeek, weeks]);

  // ----------------------------------------------------
  // IMPORT PLAN INTO CALENDAR
  // ----------------------------------------------------
  async function handleImportPlan() {
    if (!plan?.plan_uuid) {
      setFeedback({
        show: true,
        title: "Missing Plan ID",
        description: "This plan has no valid identifier.",
        color: "red",
      });
      return;
    }

    try {
      await apiFetch("/api/v1/calendar/import_plan", {
        method: "POST",
        body: JSON.stringify({
          plan_uuid: plan.plan_uuid,
          mode: "filming",
        }),
      });

      setFeedback({
        show: true,
        title: "Plan Imported",
        description: "Your content plan has been added to your calendar.",
        color: "green",
      });
    } catch (err: any) {
      setFeedback({
        show: true,
        title: "Import Failed",
        description: err?.message || "We couldn’t import the content plan.",
        color: "red",
      });
    }
  }

  // ----------------------------------------------------
  // LOADING
  // ----------------------------------------------------
  if (loading) {
    return (
      <LoadingAnalysis
        message="Building your content plan..."
        secondary_message="This might take a few moments."
      />
    );
  }

  // ----------------------------------------------------
  // NO PLAN
  // ----------------------------------------------------
  if (!plan) {
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
          We couldn’t generate a plan. Try again later.
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
  }

  return (
    <main className="min-h-screen bg-[#0F0E17] text-white py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* HEADER */}
        <ContentPlanHeader plan={plan} />

        {/* IMPORT BUTTON */}
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

        {/* BACK BTN */}
        <div className="text-center mt-14 space-y-6">
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
        description="This will add all scheduled videos to your calendar. Existing ones keep their status."
        confirmColor="green"
      />

      {/* GENERAL FEEDBACK MODAL */}
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
