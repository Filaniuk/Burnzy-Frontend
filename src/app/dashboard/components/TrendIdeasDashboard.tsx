"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GradientActionButton } from "@/components/GradientActionButton";

type Idea = {
    uuid: string;
    title: string;
    trend_score: number;
    why_this_idea: string;
    mocked_thumbnail_url?: string;
    thumbnail_mockup_text?: string;
};

type LatestTrendResponse = {
    status: string;
    data: {
        channel_tag: string;
        channel_name: string;
        last_generated: string;
        ideas: Idea[];
    };
};

export default function TrendIdeasDashboard({
    tag,
    version,
}: {
    tag: string;
    version: number;
}) {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [meta, setMeta] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<"left" | "right">("right");

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

    const fetchIdeas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await apiFetch<LatestTrendResponse>(
                "/api/v1/trend_ideas/latest_full",
                {
                    method: "POST",
                    body: JSON.stringify({
                        channel_tag: tag,
                        version,
                    }),
                }
            );

            setIdeas(res.data.ideas);
            setMeta({
                channel_name: res.data.channel_name,
                channel_tag: res.data.channel_tag,
                last_generated: res.data.last_generated,
            });
        } catch (err: any) {
            setError(err.message || "Failed to load trend ideas.");
        } finally {
            setLoading(false);
        }
    }, [tag, version]);

    useEffect(() => {
        fetchIdeas();
    }, [fetchIdeas]);

    const nextIdea = () => {
        setDirection("right");
        setCurrentIndex((prev) => (prev + 1) % ideas.length);
    };

    const prevIdea = () => {
        setDirection("left");
        setCurrentIndex((prev) => (prev - 1 + ideas.length) % ideas.length);
    };

    if (loading)
        return (
            <div className="text-center text-neutral-400 mt-6 animate-pulse">
                🧠 Loading trend ideas...
            </div>
        );

    if (error)
        return (
            <div className="text-red-400 bg-red-950/30 border border-red-900 rounded-xl p-4 text-sm text-center mt-6">
                {error}
            </div>
        );

    if (!ideas.length)
        return (
            <div className="text-center text-neutral-500 mt-6">
                No trend ideas found.
            </div>
        );

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
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="relative w-full max-w-3xl mx-auto bg-[#16151E] rounded-2xl border border-[#2E2D39] shadow-xl px-6 py-8 mt-6"
            >
                {/* Desktop Arrows */}
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

                    {/* Text */}
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

                        <div className="flex justify-center mt-5 gap-4">
                            <GradientActionButton
                                label="Save Idea"
                                size="md"
                                onClick={async () => {
                                    await apiFetch("/api/v1/ideas/save_from_trend", {
                                        method: "POST",
                                        body: JSON.stringify({
                                            idea_uuid: idea.uuid,
                                            channel_tag: tag,
                                            version,
                                            user_title: idea.title,
                                        }),
                                    });
                                }}
                            />
                            <GradientActionButton
                                size="md"
                                label="🔍 Explore Full Idea"
                                onClick={() =>
                                    window.open(
                                        `/idea/${idea.uuid}?tag=${meta?.channel_tag}&version=${version}`,
                                        "_blank"
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-4 text-neutral-500 text-sm md:hidden">
                        {currentIndex + 1} / {ideas.length}
                    </div>
                </div>
            </motion.section>
        </AnimatePresence>
    );
}
