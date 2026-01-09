"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import { useAuth } from "@/context/AuthContext";
import Unauthorized from "@/components/Unauthorized";

import ExploreHero from "./components/ExploreHero";
import ExploreInputCard from "./components/ExploreInputCard";
import ExploreIdeasGrid from "./components/ExploreIdeasGrid";

import type { ExploreIdeasSuggestionsResponse, ExploreIdeaSuggestion } from "@/types/explore";

type AdvancedState = {
  budget: string;
  location: string;
  desired_length: string;
  format: "auto" | "shorts" | "long_form";
  platform: "YouTube";
  constraints: string;
};

export default function ExploreIdeasPage() {
  const { user, loading: authLoading } = useAuth();

  const [creatorInput, setCreatorInput] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [advanced, setAdvanced] = useState<AdvancedState>({
    budget: "",
    location: "",
    desired_length: "",
    format: "auto",
    platform: "YouTube",
    constraints: "",
  });

  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ExploreIdeaSuggestion[]>([]);
  const [batchUuid, setBatchUuid] = useState<string | null>(null);
  const [channelTag, setChannelTag] = useState<string>("");
  const [version, setVersion] = useState<number>(1);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const advancedPayload = useMemo(() => {
    const payload: any = {};
    if (advanced.budget.trim()) payload.budget = advanced.budget.trim();
    if (advanced.location.trim()) payload.location = advanced.location.trim();
    if (advanced.desired_length.trim()) payload.desired_length = advanced.desired_length.trim();
    if (advanced.constraints.trim()) payload.constraints = advanced.constraints.trim();
    // always include steering enums
    payload.format = advanced.format;
    payload.platform = advanced.platform;
    return payload;
  }, [advanced]);

  async function submit() {
    if (creatorInput.trim().length < 8) return;

    setLoading(true);
    setIdeas([]);
    setBatchUuid(null);

    try {
      const res = await apiFetch<ExploreIdeasSuggestionsResponse>("/api/v1/explore_ideas/suggestions", {
        method: "POST",
        body: JSON.stringify({
          creator_input: creatorInput.trim(),
          advanced: advancedPayload,
          count: 5,
        }),
      });

      if (!res?.data?.ideas?.length || !res?.data?.batch_uuid) {
        throw new Error("No suggestions returned.");
      }

      setIdeas(res.data.ideas.slice(0, 5));
      setBatchUuid(res.data.batch_uuid);
      setChannelTag(res.data.channel_tag || "");
      setVersion(res.data.version || 1);
    } catch (err: any) {
      const msg = extractApiError(err);
      setErrorMsg(msg);
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <LoadingAnalysis />;
  }

  if (!user) {
    return <Unauthorized title="Explore Ideas requires login" description="Please sign in to explore suggestions." />;
  }

  return (
    <div className="min-h-screen bg-[#0F0E17] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <ExploreHero />

        <div className="mt-8">
          <ExploreInputCard
            creatorInput={creatorInput}
            setCreatorInput={setCreatorInput}
            advancedOpen={advancedOpen}
            setAdvancedOpen={setAdvancedOpen}
            advanced={advanced}
            setAdvanced={setAdvanced}
            isLoading={loading}
            onSubmit={submit}
          />
        </div>

        {loading && (
          <div className="mt-8">
            <div className="rounded-3xl border border-white/10 bg-[#14131C] p-6">
              <p className="text-white/80 font-semibold">Generating suggestions…</p>
              <p className="text-sm text-white/50 mt-1">
                We are drafting five options based on your idea and primary channel analysis.
              </p>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-3xl border border-white/10 bg-[#0F0E17] p-5 animate-pulse">
                    <div className="h-4 w-2/3 bg-white/10 rounded" />
                    <div className="h-3 w-full bg-white/10 rounded mt-3" />
                    <div className="h-3 w-5/6 bg-white/10 rounded mt-2" />
                    <div className="h-10 w-40 bg-white/10 rounded-2xl mt-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {batchUuid && (
          <ExploreIdeasGrid
            ideas={ideas}
            channelTag={channelTag}
            version={version}
            batchUuid={batchUuid}
          />
        )}

        <ConfirmModal
          show={errorOpen}
          title="Explore Ideas Error"
          description={errorMsg}
          confirmText="OK"
          confirmColor="red"
          onConfirm={() => setErrorOpen(false)}
          onCancel={() => setErrorOpen(false)}
        />
      </div>
    </div>
  );
}
