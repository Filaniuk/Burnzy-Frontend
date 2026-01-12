"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";
import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";

type Idea = {
  title: string;
  trend_score: number;
  uuid: string;
  why_this_idea: string;
  mocked_thumbnail_url?: string;
  thumbnail_mockup_text?: string;
};

type TrendIdeasResponse = {
  status: string;
  data: {
    channel_name: string;
    channel_tag: string;
    niche: string;
    video_ideas: Idea[];
  };
  meta: { version: number };
};

// avoid duplicate fetches on same (tag, version)
const fetchedTags = new Set<string>();

function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function TrendIdeas({ tag, version }: { tag: string; version: number }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [response, setResponse] = useState<TrendIdeasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const variants = {
    enter: (dir: "left" | "right") => ({
      x: dir === "right" ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: "left" | "right") => ({
      x: dir === "right" ? -60 : 60,
      opacity: 0,
      scale: 0.98,
    }),
  };

  const fetchIdeas = useCallback(async () => {
    const key = `${tag}-${version}`;
    if (fetchedTags.has(key)) return;
    fetchedTags.add(key);

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<TrendIdeasResponse>("/api/v1/trend_ideas", {
        method: "POST",
        body: JSON.stringify({ tag, version }),
      });

      setResponse(data);
      setIdeas(data.data.video_ideas || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error("[TrendIdeas] Fetch error:", err);
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  }, [tag, version]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const nextIdea = () => {
    if (!ideas.length) return;
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % ideas.length);
  };

  const prevIdea = () => {
    if (!ideas.length) return;
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + ideas.length) % ideas.length);
  };

  // -----------------------------
  // UI States: Loading / Error / Empty
  // -----------------------------
  if (loading) {
    return (
      <div className="text-center text-neutral-400 mt-6 animate-pulse">
        🧠 Generating trend ideas...
        <br />
        <span className="text-sm">It can take a few minutes.</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 text-red-400 bg-red-950/30 border border-red-900 rounded-xl p-4 text-sm text-center">
        {error}
      </div>
    );
  }

  if (!ideas.length) {
    return (
      <div className="text-center text-neutral-500 mt-6">
        No trend ideas found.
      </div>
    );
  }

  // -----------------------------
  // Normal state
  // -----------------------------
  const idea = ideas[currentIndex];
  const imageUrl = idea.mocked_thumbnail_url
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/mocked-thumbnails/${idea.mocked_thumbnail_url}`
    : null;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.section
        key={idea.uuid}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.35, ease: easeInOut }}
        className="relative w-full max-w-3xl mx-auto bg-[#0F0E17] rounded-2xl border border-[#2E2D39] shadow-2xl py-8 sm:py-10"
      >
        {/* DESKTOP NAV */}
        <div className="hidden md:block">
          <button
            onClick={prevIdea}
            aria-label="Previous idea"
            className="absolute left-[-60px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] text-white rounded-full p-3 shadow-lg transition"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextIdea}
            aria-label="Next idea"
            className="absolute right-[-60px] top-1/2 -translate-y-1/2 bg-[#2E2D39] hover:bg-[#3B3A4A] text-white rounded-full p-3 shadow-lg transition"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* MOBILE NAV */}
        <div className="flex justify-between items-center mb-4 md:hidden px-5 sm:px-6">
          <button
            onClick={prevIdea}
            className="bg-[#2E2D39] hover:bg-[#3B3A4A] text-white rounded-full p-2 shadow-md"
            aria-label="Previous idea"
          >
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm text-neutral-400">
            {currentIndex + 1} / {ideas.length}
          </span>

          <button
            onClick={nextIdea}
            className="bg-[#2E2D39] hover:bg-[#3B3A4A] text-white rounded-full p-2 shadow-md"
            aria-label="Next idea"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col w-full">
          {/* EDGE-TO-EDGE THUMBNAIL (no borders) */}
          <div className="px-0">
            <div className="relative w-full h-[220px] sm:h-[280px] overflow-hidden shadow-lg">
              {imageUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center blur-md brightness-95 scale-110"
                  style={{ backgroundImage: `url(${imageUrl})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-[#1B1A24] flex items-center justify-center text-neutral-500 text-sm">
                  No Thumbnail
                </div>
              )}

              {/* Readability gradient (kept lighter so glow is visible) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Bottom “light spill” (visible drop like your reference screenshot) */}
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

              {/* Soft rounding mask matching card style */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" />
            </div>
          </div>

          {/* PADDED TEXT CONTENT */}
          <div className="px-5 sm:px-6 mt-6 text-left w-full">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 leading-snug">
              {idea.title}
            </h3>

            <p className="text-sm text-neutral-400 mb-3">
              {response?.data.channel_name}
            </p>

            <div className="bg-[#14131C] border border-[#2E2D39] rounded-xl p-4 mb-5">
              <h4 className="text-[#6C63FF] font-semibold mb-1">
                🤔 Why this idea works
              </h4>
              <p className="text-neutral-300 text-sm leading-relaxed">
                {idea.why_this_idea}
              </p>
            </div>

            <div className="flex justify-center">
              <PurpleActionButton
                label="Explore Full Idea"
                onClick={() =>
                  window.open(
                    `/idea/${idea.uuid}?tag=${response?.data.channel_tag}&version=${response?.meta?.version}`,
                    "_blank"
                  )
                }
              />
            </div>
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}
