"use client";

import {
  useEffect,
  useState,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

import { CardSection, TextCard, ListCard } from "./components/IdeaSections";
import ScriptViewer from "./components/ScriptViewer";

// ✅ Lazy-load heavier sections
const IdeaHeader = dynamic(() => import("./components/IdeaHeader"), {
  ssr: false,
});
const IdeaThumbnail = dynamic(() => import("./components/IdeaThumbnail"), {
  ssr: false,
});
const IdeaHook = dynamic(() => import("./components/IdeaHook"), {
  ssr: false,
});
const IdeaOpeningScene = dynamic(
  () => import("./components/IdeaOpeningScene"),
  { ssr: false }
);
const IdeaKeyQuote = dynamic(() => import("./components/IdeaKeyQuote"), {
  ssr: false,
});
const IdeaNarrativeArc = dynamic(
  () => import("./components/IdeaNarrativeArc"),
  { ssr: false }
);
const IdeaEmotions = dynamic(() => import("./components/IdeaEmotions"), {
  ssr: false,
});
const IdeaSecondaryTopics = dynamic(
  () => import("./components/IdeaSecondaryTopics"),
  { ssr: false }
);
const IdeaSEOKeywords = dynamic(
  () => import("./components/IdeaSEOKeywords"),
  { ssr: false }
);
const IdeaWhyThisIdea = dynamic(
  () => import("./components/IdeaWhyThisIdea"),
  { ssr: false }
);

// ----------------------
// Types
// ----------------------
type VideoDetail = {
  title: string;
  hook: string;
  opening_scene: string;
  key_quote_or_line: string;
  narrative_arc: Array<{ act: string; content: string }>;
  duration_estimate?: string;
  video_type?: string;
  trend_score?: number;
  mocked_thumbnail_url?: string;
  thumbnail_notes?: string;
  target_emotion?: string[];
  secondary_topics?: string[];
  seo_keywords?: string[];
  shoot_location: string[];
  equipment_needed: string[];
  editing_style: string;
  background_music_mood: string[];
  why_this_idea?: string;
};

type VideoContentDetailedResponse = {
  data: {
    channel_name: string;
    niche: string;
    tone: string;
    video_detail: VideoDetail;
  };
};

type ScriptData = {
  title: string;
  three_alternate_hooks: string[];
  timestamped_script: {
    time: string;
    scene: string;
    voiceover: string;
    visuals: string;
    b_roll: string[];
  }[];
  shot_list: {
    shot_type: string;
    description: string;
    estimated_duration: string;
  }[];
  thumbnail_options?: {
    a: string;
    b: string;
  };
  shorts_version: {
    hook: string;
    script: string[];
    cta: string;
  };
};

const fetchedIdeas = new Set<string>();

export default function IdeaDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const ideaUuid = params.uuid as string;
  const tag = searchParams.get("tag") || "@default";
  const version = Number(searchParams.get("version")) || 1;

  const [tab, setTab] = useState<"brief" | "script">("brief");
  const [data, setData] =
    useState<VideoContentDetailedResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const [script, setScript] = useState<ScriptData | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);

  const [feedback, setFeedback] = useState<{
    show: boolean;
    title: string;
    description: string;
    color?: "red" | "yellow" | "green";
  }>({
    show: false,
    title: "",
    description: "",
    color: "red",
  });

  // --------------------------
  // Fetch detailed brief
  // --------------------------
  useEffect(() => {
    const key = `${ideaUuid}-${tag}-${version}`;
    if (fetchedIdeas.has(key)) return;
    fetchedIdeas.add(key);

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = (await apiFetch("/api/v1/video_content_detailed", {
          method: "POST",
          body: JSON.stringify({
            channel_tag: tag,
            idea_uuid: ideaUuid,
            version,
          }),
        })) as VideoContentDetailedResponse;

        if (!res?.data || !res.data.video_detail) {
          throw new Error("Invalid or missing video data received.");
        }

        if (!cancelled) setData(res.data);
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setFeedback({
            show: true,
            title: "Failed to Load Idea",
            description:
              err?.message ||
              "Something went wrong while fetching the video idea details. Please try again later.",
            color: "red",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ideaUuid, tag, version]);

  const v = useMemo(() => data?.video_detail, [data]);

  // --------------------------
  // Generate / fetch script
  // --------------------------
  const generateScript = useCallback(async () => {
    try {
      setScriptLoading(true);
      const res = await apiFetch("/api/v1/video_script", {
        method: "POST",
        body: JSON.stringify({
          channel_tag: tag,
          idea_uuid: ideaUuid,
          version,
        }),
      });

      // backend returns { status, cached, data }
      setScript(res.data as ScriptData);
    } catch (err: any) {
      console.error(err);
      setFeedback({
        show: true,
        title: "Failed to Generate Script",
        description:
          err?.message ||
          "Something went wrong while generating the full script. Please try again later.",
        color: "red",
      });
    } finally {
      setScriptLoading(false);
    }
  }, [ideaUuid, tag, version]);

  // --------------------------
  // Loading / missing data
  // --------------------------
  if (loading) {
    return <LoadingAnalysis message="Preparing your idea details…" />;
  }

  if (!data || !v) {
    return (
      <main className="min-h-screen bg-[#0F0E17] text-white flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold mb-3">
          No Data Available
        </h2>
        <p className="text-neutral-400 max-w-md mb-6">
          We couldn’t find details for this idea. It might have expired or been
          removed.
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39] text-neutral-300 border border-[#2E2D39] transition-all"
        >
          ← Back
        </button>

        <ConfirmModal
          show={feedback.show}
          onCancel={() => setFeedback({ ...feedback, show: false })}
          onConfirm={() => setFeedback({ ...feedback, show: false })}
          confirmText="OK"
          title={feedback.title}
          description={feedback.description}
          confirmColor={feedback.color}
        />
      </main>
    );
  }

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl w-full mx-auto flex flex-col bg-[#14131C]/70 backdrop-blur-xl border border-[#2E2D39] rounded-2xl shadow-2xl p-6 sm:p-10 gap-8 opacity-0 translate-y-3 animate-[fadeInUp_400ms_ease-out_forwards]">
        {/* Header */}
        <Suspense fallback={<SectionLoader text="Loading header…" />}>
          <IdeaHeader data={data} />
        </Suspense>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-[#2E2D39] pb-3 mt-2">
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => setTab("brief")}
              className={`px-3 py-1.5 rounded-lg text-sm sm:text-base transition ${
                tab === "brief"
                  ? "bg-[#6C63FF]/20 text-white border border-[#6C63FF]/40"
                  : "text-neutral-400 hover:text-white hover:bg-[#1B1A24]"
              }`}
            >
              Creative Brief
            </button>

            <button
              onClick={() => setTab("script")}
              className={`px-3 py-1.5 rounded-lg text-sm sm:text-base transition ${
                tab === "script"
                  ? "bg-[#6C63FF]/20 text-white border border-[#6C63FF]/40"
                  : "text-neutral-400 hover:text-white hover:bg-[#1B1A24]"
              }`}
            >
              Script
            </button>
          </div>

          {/* Simple chip showing which view */}
          <span className="hidden sm:inline-flex items-center gap-2 text-xs text-neutral-400 bg-[#1B1A24] px-3 py-1 rounded-full border border-[#2E2D39]">
            {tab === "brief" ? "✨ Creative overview" : "📝 Full script mode"}
          </span>
        </div>

        {/* ------------------------ */}
        {/* Tab: Creative Brief      */}
        {/* ------------------------ */}
        {tab === "brief" && (
          <>
            {/* Thumbnail */}
            <Suspense fallback={<SectionLoader text="Loading visuals…" />}>
              <div className="flex justify-center flex-wrap gap-6">
                <IdeaThumbnail v={v} ideaUuid={ideaUuid} />
              </div>
            </Suspense>

            {/* Core creative sections */}
            <Suspense
              fallback={<SectionLoader text="Loading creative details…" />}
            >
              <div className="flex flex-wrap gap-6 justify-center">
                <IdeaHook v={v} />
                <IdeaOpeningScene v={v} />
                <IdeaKeyQuote v={v} />
                <IdeaNarrativeArc v={v} />
              </div>
            </Suspense>

            {/* Context sections */}
            <Suspense fallback={<SectionLoader text="Loading context…" />}>
              <div className="flex flex-wrap gap-6 justify-center">
                <IdeaEmotions v={v} />
                <IdeaSecondaryTopics v={v} />
                <IdeaSEOKeywords v={v} />
              </div>
            </Suspense>

            {/* Production details */}
            <div className="grid sm:grid-cols-2 gap-6">
              <CardSection
                title="Shoot Locations"
                list={v.shoot_location || []}
                color="#00F5A0"
              />
              <CardSection
                title="Equipment"
                list={v.equipment_needed || []}
                color="#00F5A0"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <TextCard
                title="Editing Style"
                text={v.editing_style}
                color="#6C63FF"
              />
              <ListCard
                title="Music Mood"
                list={v.background_music_mood || []}
                color="#6C63FF"
              />
            </div>

            {/* Why this idea */}
            <Suspense
              fallback={<SectionLoader text="Loading insights…" />}
            >
              <IdeaWhyThisIdea v={v} />
            </Suspense>
          </>
        )}

        {/* ------------------------ */}
        {/* Tab: Script              */}
        {/* ------------------------ */}
        {tab === "script" && (
          <div className="space-y-6">
            {/* Script actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  Full Video Script & Shooting Plan
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
                  Get a production-ready script with timestamps, scenes, B-roll
                  notes, and a Shorts version — generated from this idea’s
                  creative brief.
                </p>
              </div>

              <button
                onClick={generateScript}
                disabled={scriptLoading}
                className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-medium transition ${
                  scriptLoading
                    ? "bg-[#2E2D39] text-neutral-400 cursor-wait"
                    : "bg-[#6C63FF] hover:bg-[#5a54d6] text-white shadow-[0_0_20px_rgba(108,99,255,0.4)]"
                }`}
              >
                {scriptLoading
                  ? "Generating Script…"
                  : script
                  ? "Regenerate Script"
                  : "Generate Script"}
              </button>
            </div>

            {/* Script content */}
            {scriptLoading && !script && (
              <SectionLoader text="📝 The script is being generated..." />
            )}

            <ScriptViewer script={script} />
          </div>
        )}
      </div>

      {/* Error Feedback Modal */}
      <ConfirmModal
        show={feedback.show}
        onCancel={() => setFeedback({ ...feedback, show: false })}
        onConfirm={() => setFeedback({ ...feedback, show: false })}
        confirmText="OK"
        title={feedback.title}
        description={feedback.description}
        confirmColor={feedback.color}
      />

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function SectionLoader({ text }: { text: string }) {
  return (
    <div className="text-center text-neutral-500 bg-[#1B1A24]/50 border border-[#2E2D39] rounded-xl py-6 text-sm animate-pulse w-full">
      {text}
    </div>
  );
}
