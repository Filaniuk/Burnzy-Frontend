"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import ContentPlanHeader from "./components/ContentPlanHeader";
import WeeklyPlanSection from "./components/WeeklyPlanSection";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal"; // ✅ reuse global modal

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
  const [feedback, setFeedback] = useState<{
    show: boolean;
    title: string;
    description: string;
    color?: "green" | "red" | "yellow";
  }>({ show: false, title: "", description: "", color: "red" });

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
          description:
            err.message ||
            "We couldn’t load your content plan. Please try again later.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, [tag, version, uploadsPerWeek, weeks]);

  // --- Loading State ---
  if (loading) return <LoadingAnalysis message="Building your content plan..." secondary_message="This is a big request, so it may take a few minutes. Thanks for your patience!" />;

  // --- No Plan Found ---
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
          We couldn’t find a content plan for this channel. Try regenerating one
          from your dashboard.
        </p>
        <button
          onClick={() => history.back()}
          className="px-5 py-2.5 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39] text-neutral-300 border border-[#2E2D39] transition-all"
        >
          ← Back to Portfolio
        </button>

        {/* Error modal for API issues */}
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

  // --- Render Plan ---
  return (
    <main className="min-h-screen bg-[#0F0E17] text-white py-14 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <ContentPlanHeader plan={plan} />

        {/* Weekly Plan Sections */}
        <section className="space-y-10">
          {plan.weekly_plan.map((week: any) => (
            <WeeklyPlanSection key={week.week} week={week} plan={plan} />
          ))}
        </section>

        {/* Back Button */}
        <div className="text-center mt-14">
          <button
            onClick={() => history.back()}
            className="px-5 py-2.5 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39] text-neutral-300 border border-[#2E2D39] transition-all"
          >
            ← Back to Portfolio
          </button>
        </div>
      </div>

      {/* Feedback Modal */}
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
