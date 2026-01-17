"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch, APIError } from "@/lib/api";
import { extractApiError } from "@/lib/errors";

import AnalysisReport from "@/app/analyze/components/AnalysisReport";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import ToggleSwitch from "@/components/ToggleSwitch";

type AnalysisResponse = {
  status: string;
  message: string;
  data: any;
  meta: any;
};

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loadedRef = useRef(false);

  const queryTag = searchParams.get("tag");
  const queryType = searchParams.get("type");
  const queryVersion = searchParams.get("version");

  const [mode, setMode] = useState<"channel" | "topic">("channel");
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(true);

  const [feedback, setFeedback] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "red" | "green" | "yellow",
  });

  // ---------------------------------------------
  // Load existing analysis from URL
  // ---------------------------------------------
  useEffect(() => {
    if (!queryTag) return;
    if (loadedRef.current) return;

    loadedRef.current = true;
    setLoading(true);

    async function fetchExisting() {
      try {
        const res = await apiFetch<any>(
          `/api/v1/analyze_existing?tag=${encodeURIComponent(queryTag || "")}&version=${queryVersion || 1}`
        );

        const detectedType = res.data?.channel_niche ? "channel" : "topic";

        setMode(queryType === "topic" ? "topic" : detectedType);
        setResult({ ...res.data, meta: res.meta });

      } catch (err) {
        console.error("Load Existing Error:", err);
        setFeedback({
          show: true,
          title: "Failed to Load",
          description: extractApiError(err),
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchExisting();
  }, [queryTag, queryType, queryVersion]);

  // ---------------------------------------------
  // Validate before submitting analysis request
  // ---------------------------------------------
  function validateBeforeSubmit() {
    if (!input.trim()) {
      setFeedback({
        show: true,
        title: "Missing Input",
        description:
          mode === "channel"
            ? "Please enter a YouTube channel URL or @handle."
            : "Please enter a topic.",
        color: "yellow",
      });
      return false;
    }

    return true;
  }

  // ---------------------------------------------
  // Submit new analysis request
  // ---------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!validateBeforeSubmit()) return;

    setLoading(true);
    setResult(null);

    const path =
      mode === "channel"
        ? `/api/v1/analyze_channel?force_refresh=${forceRefresh}`
        : `/api/v1/analyze_topic?force_refresh=${forceRefresh}`;

    const body =
      mode === "channel"
        ? { channel_url: input, user_query: context }
        : { topic: input, user_goal: context };

    try {
      const data = await apiFetch<AnalysisResponse>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!data?.data) throw new APIError("No data returned from server.");

      setResult({ ...data.data, meta: data.meta });

    } catch (err) {
      console.error("Analysis Submit Error:", err);
      setFeedback({
        show: true,
        title: "Analysis Failed",
        description: extractApiError(err),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------
  // Loading state
  // ---------------------------------------------
  if (loading) {
    return <LoadingAnalysis message="Analyzing your request..." />;
  }

  // ---------------------------------------------
  // Result view
  // ---------------------------------------------
  if (result) {
    return (

      <motion.div
        className="min-h-screen bg-[#0F0E17] text-white py-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl font-bold mb-10 text-center bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent"
          >
            {queryTag ? "Saved Analysis" : "YouTube Content Strategist"}
          </motion.h1>

          <div className="text-center mt-10">
            <button
              onClick={() => {
                setResult(null);
                router.push("/analyze");
              }}
              className="px-6 py-3 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39] text-neutral-300 border border-[#2E2D39] transition-all"
            >
              ← Back to Analyzer
            </button>
          </div>

          <AnalysisReport data={result} type={mode} />
        </div>
      </motion.div>

    );

  }

  // ---------------------------------------------
  // Main Form View
  // ---------------------------------------------
  return (

    <div className="min-h-screen bg-[#0F0E17] text-white py-10">
      <motion.div
        className="max-w-3xl mx-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
            YouTube Content Strategist
          </h1>
          <p className="text-neutral-400 max-w-lg mx-auto">
            Analyze a YouTube channel or research a new content topic.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1B1A24]/70 backdrop-blur-xl border border-[#2A2935] rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex justify-center mb-8 gap-2 bg-[#14131C] rounded-xl p-1">
            <button
              onClick={() => {
                setMode("channel");
                setInput("");
                setContext("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "channel"
                ? "bg-[#00F5A0] text-black"
                : "text-neutral-400 hover:text-white"
                }`}
            >
              Analyze Channel
            </button>

            <button
              onClick={() => {
                setMode("topic");
                setInput("");
                setContext("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === "topic"
                ? "bg-[#6C63FF] text-white"
                : "text-neutral-400 hover:text-white"
                }`}
            >
              Research Topic
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              placeholder={
                mode === "channel"
                  ? "YouTube channel URL or @handle"
                  : "Enter topic (e.g. “Exploring food cultures”)"
              }
              className="w-full rounded-xl bg-[#1B1A24] px-4 py-3 text-white placeholder-neutral-500 border border-[#2E2D39] focus:outline-none focus:ring-1 focus:ring-[#00F5A0]"
            />

            {mode === "topic" && (
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Your goal (optional, e.g. “Grow a food-focused channel”)"
                className="w-full rounded-xl bg-[#1B1A24] px-4 py-3 text-white placeholder-neutral-500 border border-[#2E2D39] focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
              />
            )}

            <div className="py-2">
              <ToggleSwitch
                enabled={forceRefresh}
                onToggle={() => setForceRefresh((prev) => !prev)}
                label="Fresh Analysis"
                disabled={true}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              type="submit"
              className="w-full py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] hover:opacity-90 disabled:opacity-60 text-black"
            >
              {mode === "channel" ? "Analyze Channel" : "Analyze Topic"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      {/* Feedback Modal */}
      <ConfirmModal
        show={feedback.show}
        onCancel={() => setFeedback((f) => ({ ...f, show: false }))}
        onConfirm={() => setFeedback((f) => ({ ...f, show: false }))}
        confirmText="OK"
        title={feedback.title}
        description={feedback.description}
        confirmColor={feedback.color}
      />
    </div>

  );
}
