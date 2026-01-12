"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GradientActionButton } from "@/components/GradientActionButton";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { PurpleActionButton } from "@/components/PurpleActionButton";

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
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

  // ConfirmModal state
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
    return (
      <div className="text-center text-neutral-500 mt-6">
        No trend ideas found.
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, validIdeas.length - 1);
  const idea = validIdeas[safeIndex];

  const imageUrl = idea.mocked_thumbnail_url
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/mocked-thumbnails/${idea.mocked_thumbnail_url}`
    : null;

  async function saveIdea() {
    try {
      await apiFetch<any>("/api/v1/ideas/save_from_trend", {
        method: "POST",
        body: JSON.stringify({
          idea_uuid: idea.uuid,
          channel_tag: tag,
          version,
          user_title: idea.title,
        }),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (rawErr: any) {
      console.error("Save trend idea failed:", rawErr);
      setErrorMessage(normalizeError(rawErr));
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
          className="relative w-full max-w-3xl mx-auto bg-[#0F0E17] rounded-2xl border border-[#2E2D39] shadow-2xl py-8 sm:py-10 mt-6"
        >
          {/* Arrows (Desktop Only) */}
          <div className="hidden md:block">
            <button
              onClick={prevIdea}
              aria-label="Previous idea"
              className="absolute left-[-70px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] p-3 rounded-full text-white shadow-lg transition"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextIdea}
              aria-label="Next idea"
              className="absolute right-[-70px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] p-3 rounded-full text-white shadow-lg transition"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Mobile counter */}
          <div className="md:hidden px-6 mb-3 text-sm text-neutral-500">
            {safeIndex + 1} / {validIdeas.length}
          </div>

          {/* Content */}
          <div className="flex flex-col w-full">
            {/* EDGE-TO-EDGE THUMBNAIL (no border) */}
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

              {/* Readability gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Bottom light spill */}
              <div className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none">
                <div
                  className="absolute inset-0 blur-2xl opacity-95"
                  style={{
                    background:
                      "radial-gradient(90% 80% at 50% 100%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.14) 35%, rgba(255,255,255,0) 70%)",
                  }}
                />
              </div>

              {/* Centered thumbnail text */}
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

              {/* Score chip */}
              <div className="absolute top-4 right-4 bg-[#00F5A0]/20 text-[#00F5A0] px-3 py-1 text-xs rounded-full border border-[#00F5A0]/40 font-semibold shadow-sm">
                {idea.trend_score}/10
              </div>
            </div>

            {/* PADDED TEXT */}
            <div className="px-6 mt-6 text-left w-full">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {idea.title}
              </h3>

              <div className="bg-[#14131C] border border-[#2E2D39] rounded-xl p-4 mt-4">
                <h4 className="text-[#6C63FF] font-semibold mb-1">
                  🤔 Why this idea works
                </h4>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  {idea.why_this_idea}
                </p>
              </div>

              {saved && (
                <p className="text-[#00F5A0] text-sm font-medium mt-3">
                  ✓ Saved to your calendar
                </p>
              )}

              <div className="flex flex-wrap justify-center mt-5 gap-4">
                <PurpleActionButton
                  label={saved ? "Saved!" : "Save Idea"}
                  size="md"
                  onClick={saveIdea}
                />

                <PurpleActionButton
                  label="Explore Full Idea"
                  size="md"
                  onClick={() =>
                    window.open(
                      `/idea/${idea.uuid}?tag=${tag}&version=${version}`,
                      "_blank"
                    )
                  }
                />
              </div>

              <div className="mt-4 text-neutral-500 text-sm md:hidden text-center">
                {safeIndex + 1} / {validIdeas.length}
              </div>
            </div>
          </div>
        </motion.section>
      </AnimatePresence>

      {/* ERROR MODAL */}
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
