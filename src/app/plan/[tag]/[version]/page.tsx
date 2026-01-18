"use client";

import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import posthog from "posthog-js";

import ContentPlanHeader from "./components/ContentPlanHeader";
import WeeklyPlanSection from "./components/WeeklyPlanSection";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { PurpleActionButton } from "@/components/PurpleActionButton";

export default function ContentPlanPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tag = decodeURIComponent(params.tag as string);
  const version = params.version ? Number(params.version) : 1;
  const uploadsPerWeek = Number(searchParams.get("uploads") || 2);
  const weeks = Number(searchParams.get("weeks") || 3);

  // "YYYY-MM-DD" or ""
  const startDate = (searchParams.get("start_date") || "").trim();

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

  // PostHog tracking refs
  const viewedRef = useRef(false);
  const planReqStartedAtRef = useRef<number | null>(null);
  const importStartedAtRef = useRef<number | null>(null);

  // -----------------------------
  // Stable computed values
  // -----------------------------
  const requestKey = useMemo(() => {
    return `${tag}-${version}-${uploadsPerWeek}-${weeks}-${startDate || "none"}`;
  }, [tag, version, uploadsPerWeek, weeks, startDate]);

  const planUuid = plan?.plan_uuid ?? null;

  // -----------------------------
  // Track page view (once)
  // -----------------------------
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;

    posthog.capture("content_plan_page_viewed", {
      tag,
      version,
      uploads_per_week: uploadsPerWeek,
      weeks,
      has_start_date: Boolean(startDate),
    });
  }, [tag, version, uploadsPerWeek, weeks, startDate]);

  // -----------------------------
  // Fetch plan
  // -----------------------------
  useEffect(() => {
    if (fetchRef.current === requestKey) return;
    fetchRef.current = requestKey;

    let cancelled = false;

    async function load() {
      setLoading(true);
      planReqStartedAtRef.current = Date.now();

      posthog.capture("content_plan_requested", {
        tag,
        version,
        uploads_per_week: uploadsPerWeek,
        weeks,
        start_date: startDate || null,
        request_key: requestKey,
      });

      try {
        const res = await apiFetch<any>("/api/v1/content_plan", {
          method: "POST",
          body: JSON.stringify({
            channel_tag: tag,
            uploads_per_week: uploadsPerWeek,
            weeks,
            version,
            start_date: startDate || null,
          }),
        });

        if (!res?.data || !res.data.weekly_plan) {
          throw new Error("Invalid or missing plan data.");
        }

        if (cancelled) return;

        setPlan(res.data);

        posthog.capture("content_plan_succeeded", {
          tag,
          version,
          uploads_per_week: uploadsPerWeek,
          weeks,
          has_start_date: Boolean(startDate),
          cached: Boolean(res?.meta?.cached),
          plan_uuid: res?.data?.plan_uuid ?? null,
          week_count: Array.isArray(res?.data?.weekly_plan)
            ? res.data.weekly_plan.length
            : null,
          ms:
            planReqStartedAtRef.current != null
              ? Date.now() - planReqStartedAtRef.current
              : null,
        });
      } catch (err: any) {
        if (cancelled) return;

        console.error("[ContentPlan] Failed:", err);

        posthog.capture("content_plan_failed", {
          tag,
          version,
          uploads_per_week: uploadsPerWeek,
          weeks,
          has_start_date: Boolean(startDate),
          status_code: err?.status ?? null,
          is_api_error: Boolean(err?.isApiError),
          ms:
            planReqStartedAtRef.current != null
              ? Date.now() - planReqStartedAtRef.current
              : null,
        });

        setFeedback({
          show: true,
          title: "Failed to Build Content Plan",
          description:
            err?.message ||
            "Your content plan could not be generated. Please try again.",
          color: "red",
        });

        setPlan(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [requestKey, tag, version, uploadsPerWeek, weeks, startDate]);

  // -----------------------------
  // Import plan
  // -----------------------------
  async function handleImportPlan() {
    if (!plan?.plan_uuid) {
      posthog.capture("content_plan_import_blocked", {
        reason: "missing_plan_uuid",
        tag,
        version,
      });

      setFeedback({
        show: true,
        title: "Missing Plan ID",
        description: "This plan has no valid identifier.",
        color: "red",
      });
      return;
    }

    importStartedAtRef.current = Date.now();

    posthog.capture("content_plan_import_requested", {
      plan_uuid: plan.plan_uuid,
      tag,
      version,
      mode: "filming",
    });

    try {
      await apiFetch<any>("/api/v1/calendar/import_plan", {
        method: "POST",
        body: JSON.stringify({
          plan_uuid: plan.plan_uuid,
          mode: "filming",
        }),
      });

      posthog.capture("content_plan_import_succeeded", {
        plan_uuid: plan.plan_uuid,
        tag,
        version,
        mode: "filming",
        ms:
          importStartedAtRef.current != null
            ? Date.now() - importStartedAtRef.current
            : null,
      });

      setFeedback({
        show: true,
        title: "Plan Imported",
        description: "Your content plan has been added to your calendar.",
        color: "green",
      });
    } catch (err: any) {
      posthog.capture("content_plan_import_failed", {
        plan_uuid: plan.plan_uuid,
        tag,
        version,
        mode: "filming",
        status_code: err?.status ?? null,
        is_api_error: Boolean(err?.isApiError),
        ms:
          importStartedAtRef.current != null
            ? Date.now() - importStartedAtRef.current
            : null,
      });

      setFeedback({
        show: true,
        title: "Import Failed",
        description: err?.message || "We couldn’t import the content plan.",
        color: "red",
      });
    }
  }

  // -----------------------------
  // Render states
  // -----------------------------
  if (loading) {
    return (
      <LoadingAnalysis
        message="Building your content plan..."
        secondary_message="This might take a few moments."
      />
    );
  }

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

        <button
          onClick={() => {
            posthog.capture("content_plan_back_clicked", {
              from: "empty_state",
              tag,
              version,
            });
            router.push("/dashboard");
          }}
          className="px-5 py-2.5 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39] text-neutral-300 border border-[#2E2D39] transition-all"
        >
          ← Back
        </button>

        {/* MODAL: DO NOT TRACK */}
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
        <ContentPlanHeader plan={plan} />

        <div className="flex flex-col items-center gap-2">
          <PurpleActionButton
            label="📅 Import Plan To Calendar"
            size="lg"
            onClick={() => {
              // track intent, not the modal itself
              posthog.capture("content_plan_import_intent", {
                plan_uuid: planUuid,
                tag,
                version,
              });

              setConfirmImport(true);
            }}
          />
          <p className="text-sm text-neutral-400">
            (You can remove or hide ideas later in your calendar)
          </p>
        </div>

        <section className="space-y-10">
          {plan.weekly_plan.map((week: any) => (
            <WeeklyPlanSection key={week.week} week={week} plan={plan} />
          ))}
        </section>

        <div className="text-center mt-14 space-y-6">
          <button
            onClick={() => {
              posthog.capture("content_plan_back_clicked", {
                from: "plan_view",
                plan_uuid: planUuid,
                tag,
                version,
              });
              history.back();
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39]
                       text-neutral-300 border border-[#2E2D39] transition-all"
          >
            ← Back to Portfolio
          </button>
        </div>
      </div>

      {/* CONFIRM IMPORT (MODAL UI, DO NOT TRACK OPEN/CLOSE) */}
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

      {/* FEEDBACK MODAL (DO NOT TRACK) */}
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
