"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import TrendIdeasDashboard from "@/app/dashboard/components/TrendIdeasDashboard";
import TrendIdeasManager from "@/app/dashboard/components/TrendIdeasManager";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import SectionTitle from "./SectionTitle";

export default function TrendIdeasSection({ tag, version }: { tag: string; version: number }) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("An unexpected error occurred.");

  const didLoadRef = useRef(false);

  const normalizeError = (err: any) => ({
    status: err?.status ?? null,
    detail: err?.detail ?? err?.message ?? "Unexpected error.",
  });

  const loadIdeas = useCallback(async () => {
    setLoading(true);

    try {
      const res = await apiFetch<any>("/api/v1/trend_ideas/latest_full", {
        method: "POST",
        body: JSON.stringify({ channel_tag: tag, version }),
      });

      const rawIdeas = Array.isArray(res?.data?.ideas)
        ? [...res.data.ideas].reverse()
        : [];

      setIdeas(rawIdeas);
      setLastGenerated(res?.data?.last_generated || null);

    } catch (err: any) {
      const n = normalizeError(err);

      if (n.status === 404) {
        setIdeas([]);
      } else {
        setErrorMsg(n.detail);
        setErrorOpen(true);
        setIdeas([]);
      }
    }

    setLoading(false);
  }, [tag, version]);

  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;

    loadIdeas();
  }, [loadIdeas]);

  async function generateInitialIdeas() {
    setGenerating(true);

    try {
      await apiFetch<any>("/api/v1/trend_ideas", {
        method: "POST",
        body: JSON.stringify({ tag, version }),
      });

      await loadIdeas();
    } catch (err: any) {
      const n = normalizeError(err);
      setErrorMsg(n.detail);
      setErrorOpen(true);
    }

    setGenerating(false);
  }

  async function generateMoreIdeas() {
    try {
      await apiFetch<any>("/api/v1/trend_ideas/generate_more", {
        method: "POST",
        body: JSON.stringify({ channel_tag: tag, version }),
      });

      await loadIdeas();
    } catch (err: any) {
      const n = normalizeError(err);
      setErrorMsg(n.detail);
      setErrorOpen(true);
    }
  }

  return (
    <>
      <div className="w-full space-y-4 mt-6">
        <div className="mb-8">
          <SectionTitle title="Trend Ideas" />
        </div>

        {loading && (
          <div className="text-neutral-400 mt-6 text-center animate-pulse">
            Loading trend ideas…
          </div>
        )}

        {!loading && ideas.length === 0 && (
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

        {!loading && ideas.length > 0 && (
          <div className="flex flex-col gap-10">
            <TrendIdeasDashboard tag={tag} version={version} ideas={ideas} />

            <TrendIdeasManager
              ideas={ideas}
              lastGenerated={lastGenerated}
              onGenerateMore={generateMoreIdeas}
              tag={tag}
              version={version}
            />
          </div>
        )}
      </div>

      <ConfirmModal
        show={errorOpen}
        title="Trend Ideas Error"
        description={errorMsg}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setErrorOpen(false)}
        onCancel={() => setErrorOpen(false)}
      />
    </>
  );
}
