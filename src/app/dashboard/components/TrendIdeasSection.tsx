"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import TrendIdeasDashboard from "@/app/dashboard/components/TrendIdeasDashboard";
import TrendIdeasManager from "@/app/dashboard/components/TrendIdeasManager";
import { apiFetch } from "@/lib/api";
import SectionTitle from "./SectionTitle";

export default function TrendIdeasSection({ tag, version }: { tag: string; version: number }) {
  const [ideas, setIdeas] = useState<any[] | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 FIX: Prevent duplicate calls in StrictMode
  const didLoadRef = useRef(false);

  const normalizeError = (err: any) => ({
    status: err?.status ?? null,
    detail: err?.detail ?? err?.message ?? "Unexpected error.",
  });

  const loadIdeas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/v1/trend_ideas/latest_full", {
        method: "POST",
        body: JSON.stringify({ channel_tag: tag, version }),
      });

      const rawIdeas = res?.data?.ideas.reverse() || [];

      setIdeas(rawIdeas); // Manager gets original
      setLastGenerated(res?.data?.last_generated || null);

    } catch (err: any) {
      const n = normalizeError(err);
      console.error("TrendIdeas load error:", n);

      if (n.status === 404) {
        setIdeas([]);
      } else {
        setError(n.detail);
        setIdeas([]);
      }
    } finally {
      setLoading(false);
    }
  }, [tag, version]);

  useEffect(() => {
    if (didLoadRef.current) return; // ❌ prevents duplicate run
    didLoadRef.current = true;

    loadIdeas();
  }, [loadIdeas]);

  async function generateInitialIdeas() {
    setGenerating(true);
    setError(null);

    try {
      await apiFetch("/api/v1/trend_ideas", {
        method: "POST",
        body: JSON.stringify({ tag, version }),
      });

      await loadIdeas();
    } catch (err: any) {
      const n = normalizeError(err);
      setError(n.detail);
    } finally {
      setGenerating(false);
    }
  }

  async function generateMoreIdeas() {
    await apiFetch("/api/v1/trend_ideas/generate_more", {
      method: "POST",
      body: JSON.stringify({ channel_tag: tag, version }),
    });

    await loadIdeas();
  }

  return (
    <div className="w-full space-y-4 mt-6">
      <div className="mb-8">
        <SectionTitle title="Trend Ideas" />
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-950/30 border border-red-700/40 p-3 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-neutral-400 mt-6 text-center animate-pulse">
          Loading trend ideas…
        </div>
      )}

      {!loading && ideas && ideas.length === 0 && (
        <div className="flex flex-col items-center justify-center bg-[#16151E] border border-[#2E2D39] rounded-xl p-8">
          <p className="text-neutral-400 mb-4 text-sm text-center">
            No trend ideas generated yet for this version.
          </p>

          <PurpleActionButton
            label="🔥 Get Trend Ideas"
            loading={generating}
            onClick={generateInitialIdeas}
            size="md"
          />
        </div>
      )}

      {!loading && ideas && ideas.length > 0 && (
        <div className="flex flex-col gap-10">
          <TrendIdeasDashboard tag={tag} version={version} ideas={ideas} />
          <TrendIdeasManager
            ideas={ideas}
            lastGenerated={lastGenerated}
            onGenerateMore={generateMoreIdeas}
            tag={tag} version={version}
          />
        </div>
      )}
    </div>
  );
}
