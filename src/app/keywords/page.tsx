"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";

import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import { apiFetch, type APIError } from "@/lib/api";
import { extractApiError } from '@/lib/errors'
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

export default function NichePage() {
  const { user, loading: authLoading } = useAuth();
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NicheApiResponse | null>(null);
  const [meta, setMeta] = useState<NicheApiResponse["meta"] | null>(null);
  const [data, setData] = useState<NicheApiResponse["data"] | null>(null);

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ title: string; message: string, color: string }>({
    title: "",
    message: "",
    color: "green"
  });

  const canSubmit = useMemo(() => keyword.trim().length >= 2, [keyword]);

  const openFeedback = useCallback((title: string, message: string, color:string) => {
    setFeedback({ title, message, color });
    setFeedbackOpen(true);
  }, []);

  const submit = useCallback(async () => {
    const kw = keyword.trim();
    if (kw.length < 2) {
      openFeedback("Invalid keyword", "Please enter a keyword with at least 2 characters.", "red");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch<NicheApiResponse>("/api/v1/analyze_niche", {
        method: "POST",
        body: JSON.stringify({ keyword }), // keep exactly what backend expects
      });

      setResult(res);
      setData(res.data);
      setMeta(res.meta);
    } catch (err) {
      const msg = extractApiError(err);
      openFeedback("Keyword analysis failed", msg, "red")
    } finally {
      setLoading(false);
    }

  }, [keyword, openFeedback]);

  if (loading && !result) {
    return <LoadingAnalysis />;
  }

  if (!user) {
      return <Unauthorized title="Login Required" description="Login is required to access this page." />;
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
