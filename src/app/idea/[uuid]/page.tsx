"use client";

import {
  useEffect,
  useState,
  Suspense,
  useMemo,
  useCallback,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

import {
  CardSection,
  TextCard,
  ListCard,
} from "./components/IdeaSections";
import ScriptViewer from "./components/ScriptViewer";
import { ScriptData, VideoContentDetailedResponse } from "@/types/idea";

// Lazy-loaded sections
const IdeaHeader = dynamic(() => import("./components/IdeaHeader"), { ssr: false });
const IdeaThumbnail = dynamic(() => import("./components/IdeaThumbnail"), { ssr: false });
const IdeaHook = dynamic(() => import("./components/IdeaHook"), { ssr: false });
const IdeaOpeningScene = dynamic(() => import("./components/IdeaOpeningScene"), { ssr: false });
const IdeaKeyQuote = dynamic(() => import("./components/IdeaKeyQuote"), { ssr: false });
const IdeaNarrativeArc = dynamic(() => import("./components/IdeaNarrativeArc"), { ssr: false });
const IdeaEmotions = dynamic(() => import("./components/IdeaEmotions"), { ssr: false });
const IdeaSecondaryTopics = dynamic(() => import("./components/IdeaSecondaryTopics"), { ssr: false });
const IdeaSEOKeywords = dynamic(() => import("./components/IdeaSEOKeywords"), { ssr: false });
const IdeaWhyThisIdea = dynamic(() => import("./components/IdeaWhyThisIdea"), { ssr: false });


// Prevents duplicate loads in Next strict mode
const fetchedIdeas = new Set<string>();

export default function IdeaDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const ideaUuid = (params.uuid as string) || "";
  const tag = searchParams.get("tag") || "@default";
  const version = Number(searchParams.get("version")) || 1;

  const [tab, setTab] = useState<"brief" | "script">("brief");
  const [data, setData] = useState<VideoContentDetailedResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  const [script, setScript] = useState<ScriptData | null>(null);
  const [scriptLoading, setScriptLoading] = useState(false);

  const [feedback, setFeedback] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "red" | "yellow" | "green",
  });

  const cancelRef = useRef(false);

  /** Normalize ANY backend or network error */
  const normalizeError = (err: any, fallback: string) => {
    if (!err) return fallback;
    if (typeof err === "string") return err;

    return (
      err?.detail ||
      err?.message ||
      err?.error ||
      fallback
    );
  };

  /** ------------------------------
   * Fetch detailed idea
   * ------------------------------ */
  useEffect(() => {
    const key = `${ideaUuid}-${tag}-${version}`;
    if (fetchedIdeas.has(key)) return;
    fetchedIdeas.add(key);

    cancelRef.current = false;
    setLoading(true);

    (async () => {
      try {
        const res = await apiFetch("/api/v1/video_content_detailed", {
          method: "POST",
          body: JSON.stringify({
            channel_tag: tag,
            idea_uuid: ideaUuid,
            version,
          }),
        });

        if (!res?.data?.video_detail) {
          throw new Error("Missing detailed video data.");
        }

        if (!cancelRef.current) setData(res.data);
      } catch (err: any) {
        const msg = normalizeError(err, "Failed to load idea details.");
        if (!cancelRef.current) {
          setFeedback({
            show: true,
            title: "Load Error",
            description: msg,
            color: "red",
          });
        }
      } finally {
        if (!cancelRef.current) setLoading(false);
      }
    })();

    return () => {
      cancelRef.current = true;
    };
  }, [ideaUuid, tag, version]);

  const v = useMemo(() => data?.video_detail || null, [data]);

  /** ------------------------------
   * Generate script
   * ------------------------------ */
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

      setScript(res.data || null);
    } catch (err: any) {
      const msg = normalizeError(err, "Failed to generate script.");
      setFeedback({
        show: true,
        title: "Script Error",
        description: msg,
        color: "red",
      });
    } finally {
      setScriptLoading(false);
    }
  }, [ideaUuid, tag, version]);

  /** ------------------------------
   * Loading state
   * ------------------------------ */
  if (loading) return <LoadingAnalysis message="Preparing your idea details…" />;

  /** ------------------------------
   * Missing data
   * ------------------------------ */
  if (!data || !v) {
    return (
      <>
        <main className="min-h-screen bg-[#0F0E17] text-white flex flex-col items-center justify-center px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">No Data Available</h2>
          <p className="text-neutral-400 max-w-md mb-6">
            We couldn’t find details for this idea. It may have expired or been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl bg-[#1B1A24] hover:bg-[#2E2D39] text-neutral-300 border border-[#2E2D39] transition-all"
          >
            ← Back
          </button>
        </main>

        <ConfirmModal
          show={feedback.show}
          title={feedback.title}
          description={feedback.description}
          confirmText="OK"
          confirmColor={feedback.color}
          onConfirm={() => setFeedback({ ...feedback, show: false })}
          onCancel={() => setFeedback({ ...feedback, show: false })}
        />
      </>
    );
  }

  /** ------------------------------
   * MAIN RENDER
   * ------------------------------ */
  return (
    <div className="min-h-screen bg-[#0F0E17] text-white flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl w-full mx-auto flex flex-col bg-[#14131C]/70 backdrop-blur-xl border border-[#2E2D39] rounded-2xl shadow-2xl p-6 sm:p-10 gap-8 opacity-0 translate-y-3 animate-[fadeInUp_400ms_ease-out_forwards]">

        {/* Header */}
        <Suspense fallback={<SectionLoader text="Loading header…" />}>
          <IdeaHeader data={data} />
        </Suspense>

        {/* Tabs */}
        <div className="flex justify-between gap-4 border-b border-[#2E2D39] pb-3 mt-2">
          <div className="flex gap-2 sm:gap-3">
            <TabButton label="Creative Brief" active={tab === "brief"} onClick={() => setTab("brief")} />
            <TabButton label="Script" active={tab === "script"} onClick={() => setTab("script")} />
          </div>
        </div>

        {/* TAB: BRIEF */}
        {tab === "brief" && (
          <>
            <Suspense fallback={<SectionLoader text="Loading visuals…" />}>
              <div className="flex justify-center flex-wrap gap-6">
                <IdeaThumbnail v={v} ideaUuid={ideaUuid} />
              </div>
            </Suspense>

            <Suspense fallback={<SectionLoader text="Loading creative details…" />}>
              <div className="flex flex-wrap gap-6 justify-center">
                <IdeaHook v={v} />
                <IdeaOpeningScene v={v} />
                <IdeaKeyQuote v={v} />
                <IdeaNarrativeArc v={v} />
              </div>
            </Suspense>

            <Suspense fallback={<SectionLoader text="Loading context…" />}>
              <div className="flex flex-wrap gap-6 justify-center">
                <IdeaEmotions v={v} />
                <IdeaSecondaryTopics v={v} />
                <IdeaSEOKeywords v={v} />
              </div>
            </Suspense>

            {/* Production Details */}
            <div className="grid sm:grid-cols-2 gap-6">
              <CardSection title="Shoot Locations" list={v.shoot_location || []} color="#00F5A0" />
              <CardSection title="Equipment" list={v.equipment_needed || []} color="#00F5A0" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <TextCard title="Editing Style" text={v.editing_style} color="#6C63FF" />
              <ListCard title="Music Mood" list={v.background_music_mood || []} color="#6C63FF" />
            </div>

            <Suspense fallback={<SectionLoader text="Loading insights…" />}>
              <IdeaWhyThisIdea v={v} />
            </Suspense>
          </>
        )}

        {/* TAB: SCRIPT */}
        {tab === "script" && (
          <div className="space-y-6">
            <ScriptHeader
              script={script}
              loading={scriptLoading}
              onGenerate={generateScript}
            />

            {scriptLoading && !script && <SectionLoader text="📝 The script is being generated..." />}

            <ScriptViewer script={script} />
          </div>
        )}
      </div>

      {/* GLOBAL ERROR MODAL */}
      <ConfirmModal
        show={feedback.show}
        title={feedback.title}
        description={feedback.description}
        confirmColor={feedback.color}
        confirmText="OK"
        onConfirm={() => setFeedback({ ...feedback, show: false })}
        onCancel={() => setFeedback({ ...feedback, show: false })}
      />

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/** Small UI helpers */
function SectionLoader({ text }: { text: string }) {
  return (
    <div className="text-center text-neutral-500 bg-[#1B1A24]/50 border border-[#2E2D39] rounded-xl py-6 text-sm animate-pulse w-full">
      {text}
    </div>
  );
}

function TabButton({ label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm sm:text-base transition
      ${active
        ? "bg-[#6C63FF]/20 text-white border border-[#6C63FF]/40"
        : "text-neutral-400 hover:text-white hover:bg-[#1B1A24]"
      }`}
    >
      {label}
    </button>
  );
}

function ScriptHeader({ script, loading, onGenerate }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold">Full Video Script & Shooting Plan</h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
          Get a production-ready script with timestamps, scenes, B-roll notes, and a Shorts version.
        </p>
      </div>

      <button
        onClick={onGenerate}
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition
        ${loading
          ? "bg-[#2E2D39] text-neutral-400 cursor-wait"
          : "bg-[#6C63FF] hover:bg-[#5a54d6] text-white"
        }`}
      >
        {loading
          ? "Generating Script…"
          : script
          ? "Regenerate Script"
          : "Generate Script"}
      </button>
    </div>
  );
}
