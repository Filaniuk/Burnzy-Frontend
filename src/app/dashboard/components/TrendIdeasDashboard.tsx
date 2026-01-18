"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { extractApiError } from "@/lib/errors";
import posthog from "posthog-js";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function formatLabel(format?: string) {
  const f = (format || "").toLowerCase();
  if (f === "shorts" || f === "short") return "Shorts";
  if (f === "long_form" || f === "longform" || f === "long") return "Long-form";
  return f
    ? f.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Format";
}

export default function TrendIdeasDashboard({
  tag,
  version,
  ideas,
}: {
  tag: string;
  version: number;
  ideas: any[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [saved, setSaved] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Something went wrong.");

  const normalizeError = (err: any): string => {
    if (!err) return "Unknown error.";
    return err.detail || err.message || "Unexpected error occurred.";
  };

  function isValidIdea(idea: any): boolean {
    return (
      idea &&
      typeof idea.title === "string" &&
      idea.title.trim() &&
      typeof idea.thumbnail_mockup_text === "string" &&
      typeof idea.why_this_idea === "string" &&
      idea.why_this_idea.trim() &&
      typeof idea.trend_score === "number"
    );
  }

  const variants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "right" ? 60 : -60,
      opacity: 0,
      scale: 0.97,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: "left" | "right") => ({
      x: dir === "right" ? -60 : 60,
      opacity: 0,
      scale: 0.97,
    }),
  };

  const validIdeas = ideas.filter(isValidIdea);

  if (!validIdeas.length) {
    return <div className="text-center text-neutral-500 mt-6">No trend ideas found.</div>;
  }

  const safeIndex = Math.min(currentIndex, validIdeas.length - 1);
  const idea = validIdeas[safeIndex];

  const imageUrl = idea.mocked_thumbnail_url
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/mocked-thumbnails/${idea.mocked_thumbnail_url}`
    : null;

  async function saveIdea() {
    try {
      posthog.capture("trend_idea_save_requested", {
        idea_uuid: idea.uuid,
        tag,
        version,
        trend_score: idea.trend_score ?? null,
        format: idea.format ?? null,
      });

      await apiFetch<any>("/api/v1/ideas/save_from_trend", {
        method: "POST",
        body: JSON.stringify({
          idea_uuid: idea.uuid,
          channel_tag: tag,
          version,
          user_title: idea.title,
        }),
      });

      posthog.capture("trend_idea_save_succeeded", {
        idea_uuid: idea.uuid,
        tag,
        version,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (rawErr: any) {
      console.error("Save trend idea failed:", rawErr);

      posthog.capture("trend_idea_save_failed", {
        idea_uuid: idea.uuid,
        tag,
        version,
        status_code: rawErr?.status ?? null,
        is_api_error: Boolean(rawErr?.isApiError),
      });

      setErrorMessage(extractApiError(rawErr) || "Unexpected error occurred.");
      setErrorOpen(true);
      setSaved(false);
    }
  }


  const nextIdea = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % validIdeas.length);
  };

  const prevIdea = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + validIdeas.length) % validIdeas.length);
  };

  return (
    <>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.section
          key={idea.uuid}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: easeOut }}
          className="relative w-full max-w-3xl mx-auto bg-[#0F0E17] rounded-2xl border border-[#2E2D39] shadow-2xl py-6 sm:py-8 mt-6"
        >
          {/* DESKTOP NAV (outside card) */}
          <div className="hidden md:block">
            <button
              onClick={prevIdea}
              aria-label="Previous idea"
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] p-3 rounded-full text-white shadow-lg transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextIdea}
              aria-label="Next idea"
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] p-3 rounded-full text-white shadow-lg transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* MOBILE NAV (visible + simple) */}
          <div className="flex items-center justify-between gap-3 md:hidden px-5 sm:px-6 mb-4">
            <button
              onClick={prevIdea}
              aria-label="Previous idea"
              className="shrink-0 bg-[#2E2D39] hover:bg-[#3B3A4A] text-white rounded-full p-2 shadow-md transition"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-sm text-neutral-400">
              {safeIndex + 1} / {validIdeas.length}
            </span>

            <button
              onClick={nextIdea}
              aria-label="Next idea"
              className="shrink-0 bg-[#2E2D39] hover:bg-[#3B3A4A] text-white rounded-full p-2 shadow-md transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col w-full">
            {/* Thumbnail */}
            <div className="relative w-full h-[220px] sm:h-[280px] overflow-hidden shadow-lg">
              {imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center blur-lg brightness-95 scale-110"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-[#1B1A24] flex items-center justify-center text-neutral-500 text-sm">
                  No Thumbnail
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none">
                <div
                  className="absolute inset-0 blur-2xl opacity-95"
                  style={{
                    background:
                      "radial-gradient(90% 80% at 50% 100%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.14) 35%, rgba(255,255,255,0) 70%)",
                  }}
                />
              </div>

              {idea.thumbnail_mockup_text ? (
                <div className="absolute inset-0 flex items-center justify-center px-6">
                  <div
                    className={cn(
                      "text-center font-extrabold uppercase tracking-tight",
                      "text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]",
                      "text-3xl sm:text-2xl leading-none"
                    )}
                  >
                    {idea.thumbnail_mockup_text}
                  </div>
                </div>
              ) : null}

              <div className="absolute top-4 left-4 bg-white/10 text-white px-3 py-1 text-xs rounded-full border border-white/15 font-semibold shadow-sm backdrop-blur">
                {formatLabel(idea.format)}
              </div>

              <div className="absolute top-4 right-4 bg-[#00F5A0]/20 text-[#00F5A0] px-3 py-1 text-xs rounded-full border border-[#00F5A0]/40 font-semibold shadow-sm">
                {idea.trend_score}/10
              </div>
            </div>

            {/* Text */}
            <div className="px-5 sm:px-6 mt-6 text-left w-full">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug break-words">
                {idea.title}
              </h3>

              <div className="bg-[#14131C] border border-[#2E2D39] rounded-xl p-4 mt-4">
                <h4 className="text-[#6C63FF] font-semibold mb-1">🤔 Why this idea works</h4>
                <p className="text-neutral-300 text-sm leading-relaxed break-words">
                  {idea.why_this_idea}
                </p>
              </div>

              {saved && (
                <p className="text-[#00F5A0] text-sm font-medium mt-3">
                  ✓ Saved to your calendar
                </p>
              )}

              {/* Actions: stack on mobile, row on sm+; size sm on mobile */}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
                <div className="w-full sm:w-auto">
                  <div className="sm:hidden">
                    <PurpleActionButton
                      label={saved ? "Saved!" : "Save Idea"}
                      size="sm"
                      onClick={saveIdea}
                    />
                  </div>
                  <div className="hidden sm:block">
                    <PurpleActionButton
                      label={saved ? "Saved!" : "Save Idea"}
                      size="md"
                      onClick={saveIdea}
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <div className="sm:hidden">
                    <PurpleActionButton
                      label="Explore Full Idea"
                      size="sm"
                      onClick={() =>
                        window.open(`/idea/${idea.uuid}?tag=${tag}&version=${version}`, "_blank")
                      }
                    />
                  </div>
                  <div className="hidden sm:block">
                    <PurpleActionButton
                      label="Explore Full Idea"
                      size="md"
                      onClick={() =>
                        window.open(`/idea/${idea.uuid}?tag=${tag}&version=${version}`, "_blank")
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Optional: counter at bottom (mobile) */}
              <div className="mt-4 text-neutral-500 text-sm md:hidden text-center">
                {safeIndex + 1} / {validIdeas.length}
              </div>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      <ConfirmModal
        show={errorOpen}
        title="Trend Idea Error"
        description={errorMessage}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setErrorOpen(false)}
        onCancel={() => setErrorOpen(false)}
      />
    </>
  );
}
