"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import posthog from "posthog-js";

import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";
import type { NicheAnalysisData } from "@/types/keywords";

import NicheHero from "./components/NicheHero";
import NicheInputCard from "./components/NicheInputCard";
import NicheResults from "./components/NicheResults";
import { useAuth } from "@/context/AuthContext";
import Unauthorized from "@/components/Unauthorized";

type NicheApiResponse = {
  status: "success" | "error";
  message: string;
  data: NicheAnalysisData;
  meta: any & {
    cached?: boolean;
    id?: number | null;
    version?: number | null;
  };
};

type ConfirmColor = "red" | "green" | "yellow";

export default function NichePage() {
  const { user, loading: authLoading } = useAuth();

  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NicheApiResponse | null>(null);
  const [meta, setMeta] = useState<NicheApiResponse["meta"] | null>(null);
  const [data, setData] = useState<NicheApiResponse["data"] | null>(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState<{
    title: string;
    message: string;
    color: ConfirmColor;
  }>({
    title: "",
    message: "",
    color: "green",
  });

  const canSubmit = useMemo(() => keyword.trim().length >= 2, [keyword]);

  // -----------------------------
  // PostHog guards / timers
  // -----------------------------
  const viewTrackedRef = useRef(false);
  const requestStartedAtRef = useRef<number | null>(null);
  const resultsTrackedRef = useRef(false);

  // -----------------------------
  // Track page view (once)
  // -----------------------------
  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;

    posthog.capture("niche_page_viewed", {
      is_authed: Boolean(user),
    });
  }, [user]);

  const openFeedback = useCallback(
    (title: string, message: string, color: ConfirmColor) => {
      setFeedback({ title, message, color });
      setFeedbackOpen(true);
    },
    []
  );

  const submit = useCallback(async () => {
    const kw = keyword.trim();

    if (kw.length < 2) {
      // Useful: see how often users try invalid submissions (NOT modal tracking)
      posthog.capture("niche_submit_blocked", {
        reason: "keyword_too_short",
        keyword_length: kw.length,
      });

      openFeedback(
        "Invalid keyword",
        "Please enter a keyword with at least 2 characters.",
        "red"
      );
      return;
    }

    setLoading(true);

    requestStartedAtRef.current = Date.now();

    posthog.capture("niche_analysis_requested", {
      keyword_length: kw.length,
      keyword_preview: kw.slice(0, 32), // safe preview (no full keyword leakage)
    });

    try {
      const res = await apiFetch<NicheApiResponse>("/api/v1/analyze_niche", {
        method: "POST",
        body: JSON.stringify({ keyword }), // keep exactly what backend expects
      });

      setResult(res);
      setData(res.data);
      setMeta(res.meta);

      posthog.capture("niche_analysis_succeeded", {
        keyword_length: kw.length,
        cached: Boolean(res?.meta?.cached),
        analysis_id: res?.meta?.id ?? null,
        version: res?.meta?.version ?? null,
        ms:
          requestStartedAtRef.current != null
            ? Date.now() - requestStartedAtRef.current
            : null,
      });

      // reset rendered tracker for new results
      resultsTrackedRef.current = false;
    } catch (err: any) {
      const msg = extractApiError(err);

      posthog.capture("niche_analysis_failed", {
        keyword_length: kw.length,
        status_code: err?.status ?? null,
        is_api_error: Boolean(err?.isApiError),
        ms:
          requestStartedAtRef.current != null
            ? Date.now() - requestStartedAtRef.current
            : null,
      });

      openFeedback("Keyword analysis failed", msg, "red");
    } finally {
      setLoading(false);
    }
  }, [keyword, openFeedback]);

  // Track results render (1x per successful result)
  useEffect(() => {
    if (!data) return;
    if (resultsTrackedRef.current) return;
    resultsTrackedRef.current = true;

    posthog.capture("niche_results_rendered", {
      keyword_length: keyword.trim().length,
      cached: Boolean(meta?.cached),
      analysis_id: meta?.id ?? null,
      version: meta?.version ?? null,
    });
  }, [data, keyword, meta]);

  // -----------------------------
  // Loading / auth gates
  // -----------------------------
  if (loading && !result) {
    return <LoadingAnalysis />;
  }

  // optional: if you want to avoid rendering Unauthorized while auth still booting
  if (authLoading) {
    return <LoadingAnalysis message="Checking authentication..." />;
  }

  if (!user) {
    return (
      <Unauthorized
        title="Login Required"
        description="Login is required to access this page."
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0E17] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <NicheHero />

        <div className="block gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <NicheInputCard
              keyword={keyword}
              setKeyword={setKeyword}
              onSubmit={submit}
              isLoading={loading}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            {data ? <NicheResults data={data} keyword={keyword} /> : null}
          </motion.div>
        </div>
      </div>

      <ConfirmModal
        show={feedbackOpen}
        title={feedback.title}
        confirmColor={feedback.color}
        description={feedback.message}
        onCancel={() => setFeedbackOpen(false)}
        onConfirm={() => setFeedbackOpen(false)}
        confirmText="OK"
      />
    </div>
  );
}
