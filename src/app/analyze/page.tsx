"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import AnalysisReport from "@/app/analyze/components/AnalysisReport";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

type AnalysisResponse = {
  status: string;
  message: string;
  data: any;
  meta: any;
};

export default function AnalyzePage() {
  const searchParams = useSearchParams();
  const queryTag = searchParams.get("tag");
  const queryType = searchParams.get("type");
  const queryVersion = searchParams.get("version");

  const [mode, setMode] = useState<"channel" | "topic">("channel");
  const [input, setInput] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState<{
    show: boolean;
    title: string;
    description: string;
    color?: "green" | "red" | "yellow";
  }>({ show: false, title: "", description: "", color: "red" });

  const router = useRouter();

  // --------------------------------------------------
  // Load existing analysis from URL params
  // --------------------------------------------------
  useEffect(() => {
    if (!queryTag) return;

    async function fetchExisting() {
      setLoading(true);
      try {
        const res = await apiFetch<any>(
          `/api/v1/analyze_existing?tag=${encodeURIComponent(
            queryTag
          )}&version=${queryVersion || 1}`
        );

        const detectedType = res.data?.channel_niche ? "channel" : "topic";
        setMode(queryType === "topic" ? "topic" : detectedType);
        setResult({ ...res.data, meta: res.meta });
      } catch (e: any) {
        setFeedback({
          show: true,
          title: "Failed to Load",
          description:
            "Could not load existing analysis. It may have expired or been removed.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchExisting();
  }, [queryTag, queryType, queryVersion]);

  // --------------------------------------------------
  // Handle new analysis
  // --------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const path =
      mode === "channel" ? "/api/v1/analyze_channel" : "/api/v1/analyze_topic";
    const body =
      mode === "channel"
        ? { channel_url: input, user_query: context }
        : { topic: input, user_goal: context };

    try {
      const data = await apiFetch<AnalysisResponse>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!data?.data) {
        throw new Error("No valid data returned from the server.");
      }

      setResult({ ...data.data, meta: data.meta });
    } catch (err: any) {
      console.error(err);
      setFeedback({
        show: true,
        title: "Analysis Failed",
        description:
          err?.message || "Something went wrong while analyzing your input.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------
  if (loading) return <LoadingAnalysis message="Analyzing your request..." />;

  // --------------------------------------------------
  // Result state
  // --------------------------------------------------
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
            {queryTag ? "Saved Analysis" : "AI YouTube Strategist"}
          </motion.h1>

          <div className="text-center mt-10">
            <button
              onClick={() => {
                setResult(null);
                router.push(`/analyze`);
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

  // --------------------------------------------------
  // Default view
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white py-20">
      <motion.div
        className="max-w-3xl mx-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
            AI YouTube Strategist
          </h1>
          <p className="text-neutral-400 max-w-lg mx-auto">
            Analyze an existing YouTube channel or explore a new content topic.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#1B1A24]/70 backdrop-blur-xl border border-[#2A2935] rounded-2xl p-8 shadow-2xl"
        >
          {/* Mode toggle */}
          <div className="flex justify-center mb-8 gap-2 bg-[#14131C] rounded-xl p-1">
            <button
              onClick={() => {
                setMode("channel");
                setInput("");
                setContext("");
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "channel"
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
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "topic"
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
                  : "Enter topic (e.g. ‘Exploring food cultures’)"
              }
              className="w-full rounded-xl bg-[#1B1A24] px-4 py-3 text-white placeholder-neutral-500 border border-[#2E2D39] focus:outline-none focus:ring-1 focus:ring-[#00F5A0]"
            />

            {mode === "topic" && (
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Your goal (optional, e.g. ‘grow a food channel’)"
                className="w-full rounded-xl bg-[#1B1A24] px-4 py-3 text-white placeholder-neutral-500 border border-[#2E2D39] focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
              />
            )}

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
        onCancel={() => setFeedback({ ...feedback, show: false })}
        onConfirm={() => setFeedback({ ...feedback, show: false })}
        confirmText="OK"
        title={feedback.title}
        description={feedback.description}
        confirmColor={feedback.color}
      />
    </div>
  );
}
