"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PurpleActionButton } from "@/components/PurpleActionButton";

type IdeaOption = {
  uuid: string;
  title: string;
  thumbnail_concept?: string | null;
  status?: string;
  trend_idea_id?: number | null;
  channel_name?: string | null;
  created_at?: string | null;
};

const PAGE_SIZE = 5;

export default function ThumbnailGenerateCard({
  onGenerate,
  loading,
  ideas,
  ideasLoading,
}: {
  onGenerate: (ideaUuid: string) => void | Promise<void>;
  loading: boolean;
  ideas: IdeaOption[];
  ideasLoading?: boolean;
}) {
  const [selectedUuid, setSelectedUuid] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const totalPages = useMemo(
    () => (ideas.length ? Math.ceil(ideas.length / PAGE_SIZE) : 0),
    [ideas.length]
  );

  // Clamp page if ideas change
  const currentPage = useMemo(() => {
    if (!totalPages) return 0;
    return Math.min(page, totalPages - 1);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    if (!ideas.length) return [];
    const start = currentPage * PAGE_SIZE;
    return ideas.slice(start, start + PAGE_SIZE);
  }, [ideas, currentPage]);

  const selectedIdea = useMemo(
    () => ideas.find((i) => i.uuid === selectedUuid) || null,
    [ideas, selectedUuid]
  );

  const canSubmit = !!selectedUuid && !loading && !ideasLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate(selectedUuid);
  }

  function handleSelect(idea: IdeaOption) {
    setSelectedUuid(idea.uuid);
    setOpen(false);
  }

  const dropdownDisabled = ideasLoading || loading || !ideas.length;

  const selectedLabel = useMemo(() => {
    if (!selectedIdea) return "Select an idea…";
    const parts: string[] = [selectedIdea.title];
    if (selectedIdea.channel_name) parts.push(`• ${selectedIdea.channel_name}`);
    return parts.join(" ");
  }, [selectedIdea]);

  return (
    <section className="rounded-3xl border border-[#2E2D39] bg-gradient-to-br from-[#171622] via-[#141320] to-[#10101A] p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-7 items-start shadow-[0_18px_40px_rgba(0,0,0,0.55)]">
      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-[#6C63FF]/15 border border-[#6C63FF]/50">
            <Sparkles size={14} className="text-[#C4C2FF]" />
          </span>
          <div>
            <h2 className="text-white text-lg md:text-xl font-semibold">
              Generate a thumbnail
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Use one of your existing ideas as the source.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">
              Idea
            </label>

            {/* Custom dropdown */}
            <div className="relative">
              <button
                type="button"
                disabled={dropdownDisabled}
                onClick={() => {
                  if (!dropdownDisabled) setOpen((o) => !o);
                }}
                className={[
                  "w-full flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-sm transition",
                  "bg-[#0F0E17] border-[#2E2D39] hover:border-[#6C63FF]/60",
                  dropdownDisabled ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <span className="truncate text-left text-white/90">
                  {ideasLoading
                    ? "Loading your ideas…"
                    : !ideas.length
                    ? "No ideas available yet. Generate ideas first."
                    : selectedLabel}
                </span>
                <div
                  className={[
                    "flex h-7 w-7 items-center justify-center rounded-xl border border-[#2E2D39] bg-[#15141F] transition-transform",
                    open ? "rotate-180" : "",
                  ].join(" ")}
                >
                  <ChevronDown size={14} className="text-neutral-400" />
                </div>
              </button>

              {open && !dropdownDisabled && (
                <div className="absolute z-30 mt-2 w-full rounded-2xl border border-[#2E2D39] bg-[#0F0E17] shadow-xl overflow-hidden">
                  {/* Header with pagination */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-[#2E2D39] bg-[#141320]">
                    <div className="text-xs text-neutral-300">
                      {ideas.length ? (
                        <>
                          Your ideas{" "}
                          <span className="text-neutral-500">
                            ({ideas.length} total)
                          </span>
                        </>
                      ) : (
                        "No ideas"
                      )}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setPage((p) => Math.max(0, p - 1))
                          }
                          disabled={currentPage === 0}
                          className={[
                            "h-7 w-7 flex items-center justify-center rounded-xl border text-xs",
                            currentPage === 0
                              ? "border-[#2E2D39] text-neutral-500 cursor-not-allowed opacity-60"
                              : "border-[#2E2D39] text-neutral-200 hover:border-[#6C63FF]/70",
                          ].join(" ")}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-[11px] text-neutral-400 px-1">
                          {currentPage + 1} / {totalPages}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setPage((p) =>
                              Math.min(totalPages - 1, p + 1)
                            )
                          }
                          disabled={currentPage >= totalPages - 1}
                          className={[
                            "h-7 w-7 flex items-center justify-center rounded-xl border text-xs",
                            currentPage >= totalPages - 1
                              ? "border-[#2E2D39] text-neutral-500 cursor-not-allowed opacity-60"
                              : "border-[#2E2D39] text-neutral-200 hover:border-[#6C63FF]/70",
                          ].join(" ")}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Idea list (max 5 per page) */}
                  <div className="max-h-72 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {pageItems.map((idea) => {
                      const isActive = idea.uuid === selectedUuid;
                      return (
                        <button
                          key={idea.uuid}
                          type="button"
                          onClick={() => handleSelect(idea)}
                          className={[
                            "w-full flex flex-col items-start px-3 py-2.5 text-left text-sm transition",
                            isActive
                              ? "bg-[#6C63FF]/15 border-l-2 border-l-[#6C63FF]"
                              : "hover:bg-[#1B1A24]",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="flex-1 truncate text-white">
                              {idea.title}
                            </span>
                            {idea.channel_name && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202031] text-neutral-300 shrink-0">
                                {idea.channel_name}
                              </span>
                            )}
                          </div>
                          {idea.thumbnail_concept && (
                            <p className="mt-0.5 text-[11px] text-neutral-400 line-clamp-1">
                              {idea.thumbnail_concept}
                            </p>
                          )}
                        </button>
                      );
                    })}

                    {!pageItems.length && ideas.length > 0 && (
                      <div className="px-3 py-3 text-xs text-neutral-500">
                        No ideas on this page.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedIdea && selectedIdea.thumbnail_concept ? (
              <div className="pt-1.5">
                <p className="text-xs text-neutral-400 line-clamp-2">
                  Thumbnail concept:{" "}
                  <span className="text-neutral-200">
                    {selectedIdea.thumbnail_concept}
                  </span>
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <PurpleActionButton
              label={loading ? "Generating…" : "Generate thumbnail"}
              size="sm"
              disabled={!canSubmit}
              loading={loading}
            />
          </div>
        </form>

        <p className="text-xs text-neutral-500">
          Tip: the dropdown shows your ideas in pages of 5. If you don’t see anything,
          generate some ideas first in your dashboard.
        </p>
      </div>
    </section>
  );
}
