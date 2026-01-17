"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PurpleActionButton } from "@/components/PurpleActionButton";

type IdeaSummary = {
  uuid: string;
  title: string;
  thumbnail_concept?: string | null;
  thumbnail_variations?: string[] | null;
  trend_idea_id?: number | null;
};

type Props = {
  ideas: IdeaSummary[];
  ideasLoading: boolean;
  loading: boolean;
  onGenerate: (
    idea: IdeaSummary,
    opts?: { activeIdx?: number; thumbnailConcept?: string | null }
  ) => Promise<void> | void;
};

export default function ThumbnailGenerateCard({
  ideas,
  ideasLoading,
  loading,
  onGenerate,
}: Props) {
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [activeIdx, setActiveIdx] = useState(0);

  const [ideaQuery, setIdeaQuery] = useState("");
  const [ideaPage, setIdeaPage] = useState(1);
  const PAGE_SIZE = 4;

  const filteredIdeas = useMemo(() => {
    const q = ideaQuery.trim().toLowerCase();
    if (!q) return ideas;
    return ideas.filter((i) => (i.title || "").toLowerCase().includes(q));
  }, [ideas, ideaQuery]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredIdeas.length / PAGE_SIZE));
  }, [filteredIdeas.length]);

  useEffect(() => {
    setIdeaPage(1);
  }, [ideaQuery, ideas.length]);

  useEffect(() => {
    // Clamp
    setIdeaPage((p) => Math.min(Math.max(p, 1), totalPages));
  }, [totalPages]);

  const pageIdeas = useMemo(() => {
    const start = (ideaPage - 1) * PAGE_SIZE;
    return filteredIdeas.slice(start, start + PAGE_SIZE);
  }, [filteredIdeas, ideaPage]);

  const selectedIdeaInFiltered = useMemo(() => {
    if (!selectedUuid) return true;
    return filteredIdeas.some((i) => i.uuid === selectedUuid);
  }, [filteredIdeas, selectedUuid]);

  const selectedIdea = useMemo(() => {
    return ideas.find((i) => i.uuid === selectedUuid) || null;
  }, [ideas, selectedUuid]);

  const variations: string[] = useMemo(() => {
    const raw = selectedIdea?.thumbnail_variations;
    if (!Array.isArray(raw)) return [];
    return raw.filter((x) => typeof x === "string" && x.trim().length > 0);
  }, [selectedIdea]);

  useEffect(() => {
    setActiveIdx(0);
  }, [selectedUuid]);

  useEffect(() => {
    if (variations.length === 0) {
      setActiveIdx(0);
      return;
    }
    setActiveIdx((idx) => (idx >= 0 && idx < variations.length ? idx : 0));
  }, [variations.length]);

  const activeConcept = useMemo(() => {
    if (variations.length > 0) {
      const idx = Math.min(Math.max(activeIdx, 0), variations.length - 1);
      return variations[idx];
    }
    const c = (selectedIdea?.thumbnail_concept || "").trim();
    return c || "";
  }, [variations, activeIdx, selectedIdea]);

  const canNavigate = variations.length > 1;

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    setActiveIdx((i) => (i - 1 + variations.length) % variations.length);
  }, [canNavigate, variations.length]);

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    setActiveIdx((i) => (i + 1) % variations.length);
  }, [canNavigate, variations.length]);

  const handleGenerate = async () => {
    if (!selectedIdea) return;

    await onGenerate(selectedIdea, {
      activeIdx: variations.length > 0 ? activeIdx : undefined,
      thumbnailConcept: activeConcept || null,
    });
  };

  const goPrevPage = useCallback(() => {
    setIdeaPage((p) => Math.max(1, p - 1));
  }, []);

  const goNextPage = useCallback(() => {
    setIdeaPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-[#2E2D39] bg-[#14131C]/70 backdrop-blur-xl p-4 sm:p-5 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            Generate a Thumbnail
          </h3>
          <p className="text-sm text-neutral-400 leading-snug">
            Pick an idea, choose the active concept (left/right), then generate.
          </p>
        </div>

        {/* CTA: full width on mobile */}
        <div className="w-full md:w-auto">
          <PurpleActionButton
            label="Generate Thumbnail"
            onClick={handleGenerate}
            loading={loading}
            disabled={!selectedIdea || ideasLoading}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Idea selector */}
        <div className="rounded-xl border border-[#2E2D39] bg-[#0F0E17] p-4">
          <div className="flex items-center justify-between gap-3 mb-2 min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-500">Idea</p>
            <p className="text-xs text-neutral-500 shrink-0">
              {filteredIdeas.length}/{ideas.length}
            </p>
          </div>

          <input
            value={ideaQuery}
            onChange={(e) => setIdeaQuery(e.target.value)}
            placeholder={ideasLoading ? "Loading ideas..." : "Search ideas..."}
            disabled={ideasLoading}
            className="w-full rounded-lg border border-[#2E2D39] bg-[#14131C] px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-[#6C63FF]/60"
          />

          <div className="mt-3 rounded-lg border border-[#2E2D39] bg-[#14131C] overflow-hidden">
            {ideasLoading ? (
              <div className="px-3 py-3 text-sm text-neutral-500">Loading ideas…</div>
            ) : pageIdeas.length === 0 ? (
              <div className="px-3 py-3 text-sm text-neutral-500">
                No ideas match your search.
              </div>
            ) : (
              <ul className="max-h-56 sm:max-h-64 overflow-auto">
                {pageIdeas.map((idea) => {
                  const active = idea.uuid === selectedUuid;
                  return (
                    <li key={idea.uuid}>
                      <button
                        type="button"
                        onClick={() => setSelectedUuid(idea.uuid)}
                        className={`w-full text-left px-3 py-2.5 text-sm transition border-b border-[#2E2D39]/60 last:border-b-0 ${
                          active
                            ? "bg-[#6C63FF]/15 text-white"
                            : "bg-transparent text-neutral-200 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 min-w-0">
                          <span className="leading-snug break-words min-w-0">
                            {idea.title}
                          </span>
                          {active && (
                            <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full border border-[#6C63FF]/50 text-[#B9B5FF]">
                              Selected
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Simple pagination (mobile + desktop): Prev | Page X/Y | Next */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevPage}
              disabled={ideasLoading || ideaPage <= 1}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm border border-[#2E2D39] bg-[#14131C] transition ${
                ideaPage <= 1 || ideasLoading
                  ? "opacity-40 cursor-not-allowed text-neutral-400"
                  : "text-neutral-200 hover:border-[#6C63FF]/50"
              }`}
            >
              Prev
            </button>

            <span className="min-w-0 text-center text-xs sm:text-sm text-neutral-500">
              Page <span className="text-neutral-200">{ideaPage}</span> /{" "}
              <span className="text-neutral-200">{totalPages}</span>
            </span>

            <button
              type="button"
              onClick={goNextPage}
              disabled={ideasLoading || ideaPage >= totalPages}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm border border-[#2E2D39] bg-[#14131C] transition ${
                ideaPage >= totalPages || ideasLoading
                  ? "opacity-40 cursor-not-allowed text-neutral-400"
                  : "text-neutral-200 hover:border-[#6C63FF]/50"
              }`}
            >
              Next
            </button>
          </div>

          {selectedUuid && !selectedIdeaInFiltered && (
            <p className="mt-2 text-xs text-yellow-300/80">
              Selected idea is hidden by your search filter.
            </p>
          )}
        </div>

        {/* Concept carousel */}
        <div className="rounded-xl border border-[#2E2D39] bg-[#0F0E17] p-4">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Active concept
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Visual-only; no text overlays.
              </p>
            </div>

            {variations.length > 0 && (
              <div className="shrink-0 text-xs text-neutral-400">
                {activeIdx + 1}/{variations.length}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-stretch gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canNavigate}
              className={`shrink-0 w-10 rounded-lg border border-[#2E2D39] bg-[#14131C] flex items-center justify-center transition ${
                canNavigate ? "hover:border-[#6C63FF]/50" : "opacity-40 cursor-not-allowed"
              }`}
              aria-label="Previous concept"
            >
              <ChevronLeft size={18} className="text-neutral-200" />
            </button>

            <div className="flex-1 min-w-0 rounded-lg border border-[#2E2D39] bg-[#14131C] p-3">
              {selectedIdea ? (
                activeConcept ? (
                  <p className="text-sm text-neutral-200 leading-relaxed break-words">
                    {activeConcept}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No concepts available for this idea.
                  </p>
                )
              ) : (
                <p className="text-sm text-neutral-500">
                  Select an idea to see concepts.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canNavigate}
              className={`shrink-0 w-10 rounded-lg border border-[#2E2D39] bg-[#14131C] flex items-center justify-center transition ${
                canNavigate ? "hover:border-[#6C63FF]/50" : "opacity-40 cursor-not-allowed"
              }`}
              aria-label="Next concept"
            >
              <ChevronRight size={18} className="text-neutral-200" />
            </button>
          </div>

          {variations.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {variations.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className={`h-2.5 w-2.5 rounded-full border transition ${
                    i === activeIdx
                      ? "bg-[#6C63FF] border-[#6C63FF]"
                      : "bg-transparent border-[#2E2D39] hover:border-[#6C63FF]/60"
                  }`}
                  aria-label={`Select concept ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
