"use client";

import { useState } from "react";
import { motion, AnimatePresence, easeOut } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GradientActionButton } from "@/components/GradientActionButton";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

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

  if (!validIdeas.length)
    return (
      <div className="text-center text-neutral-500 mt-6">
        No trend ideas found.
      </div>
    );

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

      // Only mark as saved if API succeeded
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

    } catch (rawErr: any) {
      console.error("Save trend idea failed:", rawErr);

      setErrorMessage(normalizeError(rawErr));
      setErrorOpen(true);

      // ❗ IMPORTANT: Do NOT show saved state on error
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
          className="relative w-full max-w-3xl mx-auto bg-[#16151E] rounded-2xl border border-[#2E2D39] shadow-xl px-6 py-8 mt-6"
        >
          {/* Arrows (Desktop Only) */}
          <div className="hidden md:block">
            <button
              onClick={prevIdea}
              className="absolute left-[-70px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] p-3 rounded-full text-white shadow-md"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={nextIdea}
              className="absolute right-[-70px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] p-3 rounded-full text-white shadow-md"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center text-center">
            {/* Thumbnail */}
            <div className="relative w-full max-w-xl h-[220px] rounded-xl overflow-hidden border border-[#3B3A4A] shadow-lg">
              {imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center blur-md brightness-[0.9]"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-[#1B1A24] text-neutral-500">
                  No Thumbnail
                </div>
              )}

              {idea.thumbnail_mockup_text && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-xl font-semibold drop-shadow">
                    {idea.thumbnail_mockup_text}
                  </p>
                </div>
              )}

              <div className="absolute top-3 right-3 bg-[#00F5A0]/20 text-[#00F5A0] px-3 py-1 rounded-full text-xs border border-[#00F5A0]/40">
                {idea.trend_score}/10
              </div>
            </div>

            <div className="mt-6 text-left w-full max-w-xl">
              <h3 className="text-xl font-bold">{idea.title}</h3>

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

              <div className="flex justify-center mt-5 gap-4">
                <GradientActionButton
                  label={saved ? "Saved!" : "Save Idea"}
                  size="md"
                  onClick={saveIdea}
                />

                <GradientActionButton
                  label="🔍 Explore Full Idea"
                  size="md"
                  onClick={() =>
                    window.open(
                      `/idea/${idea.uuid}?tag=${tag}&version=${version}`,
                      "_blank"
                    )
                  }
                />
              </div>

              <div className="mt-4 text-neutral-500 text-sm md:hidden">
                {currentIndex + 1} / {validIdeas.length}
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
