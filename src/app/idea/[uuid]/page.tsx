"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Copy, CheckCircle2, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

import IdeaBuilderWizard from "./components/IdeaBuilderWizard";
import IdeaThumbnail from "./components/IdeaThumbnail";
import IdeaContentAdvice from "./components/IdeaContentAdvice";
import IdeaWhyWorks from "./components/IdeaWhyWorks";
import { PurpleActionButton } from "@/components/PurpleActionButton";

type Plan = {
  schema_id?: string;
  plan_version?: number;
  mode?: "suggestion" | "final";
  revision_note?: string;

  title: string;
  hook: string;
  duration: string;
  angle: string;
  reveal: string;
  cta: string;

  // plain text reused from trend service
  why_this_idea?: string;

  content_advice?: string[];

  must_do_today: string[];
  optional_if_time: string[];

  beats: string[];
  shots: string[];
  on_screen: string[];
  avoid: string[];

  mocked_thumbnail_url?: string | null;
  thumbnail_variations?: string[];
};

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#2E2D39] rounded-2xl p-5 bg-[#12111A]/70">
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {hint ? <div className="text-xs text-neutral-500">{hint}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChipRow({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((x, i) => (
        <span
          key={i}
          className="px-3 py-1 rounded-full text-xs border border-[#2E2D39] bg-[#14131C] text-neutral-200"
        >
          {x}
        </span>
      ))}
    </div>
  );
}

function NumberedList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <ol className="space-y-2 text-sm text-neutral-200">
      {items.map((x, i) => (
        <li key={i} className="flex gap-3">
          <span className="w-6 text-neutral-500">{i + 1}.</span>
          <span>{x}</span>
        </li>
      ))}
    </ol>
  );
}

function Checklist({
  items,
  selected,
  onToggle,
  max = 6,
  disabled = false,
}: {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
  max?: number;
  disabled?: boolean;
}) {
  if (!items?.length) return null;

  return (
    <div className="space-y-2">
      {items.map((x, i) => {
        const checked = selected.includes(x);

        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(x)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-sm transition
              ${checked
                ? "border-[#00F5A0]/60 bg-[#00F5A0]/10 text-neutral-100"
                : "border-[#2E2D39] bg-[#14131C] text-neutral-200 hover:border-[#6C63FF]/50"
              }
              ${disabled
                ? "opacity-60 cursor-not-allowed hover:border-[#2E2D39]"
                : ""
              }`}
          >
            <span className="text-left">{x}</span>
            <span className="text-xs text-neutral-500">
              {checked ? "Selected" : "Tap to add"}
            </span>
          </button>
        );
      })}

      <div className="pt-2 text-xs text-neutral-500">
        Selected: {selected.length} / {max}
      </div>
    </div>
  );
}

export default function IdeaPage() {
  const params = useParams<{ uuid: string }>();
  const searchParams = useSearchParams();

  const ideaUuid = params?.uuid || "";

  const tag = searchParams.get("tag") || searchParams.get("channel_tag") || "";
  const version = Number(searchParams.get("version") || 1);

  const trendIdRaw = searchParams.get("trend_id");
  const trendId = trendIdRaw ? Number(trendIdRaw) : null;

  const exploreBatchUuid =
    searchParams.get("explore_batch_uuid") ||
    searchParams.get("exploreBatchUuid");

  const [suggestionData, setSuggestionData] = useState<any | null>(null);
  const [isFinal, setIsFinal] = useState(false);

  // prevents flashing builder UI before cache bootstrap finishes
  const [booting, setBooting] = useState(true);

  const plan: Plan | null = useMemo(() => {
    const v = suggestionData?.video_detail;
    if (!v) return null;
    return v as Plan;
  }, [suggestionData]);

  const [editTitle, setEditTitle] = useState("");
  const [editHook, setEditHook] = useState("");
  const [editAngle, setEditAngle] = useState("");
  const [editReveal, setEditReveal] = useState("");
  const [editCta, setEditCta] = useState("");
  const [selectedShots, setSelectedShots] = useState<string[]>([]);
  const [changeRequest, setChangeRequest] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSuggestionLoaded = (data: any) => {
    setSuggestionData(data);
    setError("");

    const v = data?.video_detail as Plan;
    if (!v) return;

    const mode = v.mode === "final";
    setIsFinal(mode);

    setEditTitle(v.title || "");
    setEditHook(v.hook || "");
    setEditAngle(v.angle || "");
    setEditReveal(v.reveal || "");
    setEditCta(v.cta || "");
    setSelectedShots(Array.isArray(v.shots) ? v.shots.slice(0, 999) : []);
    setChangeRequest("");
  };

  useEffect(() => {
    let cancelled = false;

    async function bootstrapFromCache() {
      // If missing required params, don't block UI forever
      if (!ideaUuid || !tag) {
        setBooting(false);
        return;
      }

      try {
        const qs = new URLSearchParams({
          idea_uuid: ideaUuid,
          channel_tag: tag,
          version: String(version),
        });

        if (trendId) qs.set("trend_id", String(trendId));
        if (exploreBatchUuid) qs.set("explore_batch_uuid", exploreBatchUuid);

        const res = await apiFetch<any>(
          `/api/v1/video_content_detailed/cache?${qs.toString()}`,
          { method: "GET" }
        );

        if (cancelled) return;

        const cachedPlan = res?.data?.video_detail;
        if (cachedPlan) {
          onSuggestionLoaded({ video_detail: cachedPlan });
        }
      } catch (e: any) {
        // Cache lookup should never hard-fail the UX
        console.warn("Idea cache bootstrap failed:", e);
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    bootstrapFromCache();

    return () => {
      cancelled = true;
    };
  }, [ideaUuid, tag, version, trendId, exploreBatchUuid]);

  const toggleShot = (x: string) => {
    if (isFinal) return;

    // cap selection to the plan size (dynamic backend list)
    const cap = plan?.shots?.length || 6;

    setSelectedShots((prev) => {
      if (prev.includes(x)) return prev.filter((s) => s !== x);
      if (prev.length >= cap) return prev;
      return [...prev, x];
    });
  };

  const copyPlan = async () => {
    if (!plan) return;

    const lines = [
      `TITLE: ${editTitle || plan.title}`,
      `HOOK: ${editHook || plan.hook}`,
      `DURATION: ${plan.duration}`,
      ``,
      `ANGLE: ${editAngle || plan.angle}`,
      `REVEAL: ${editReveal || plan.reveal}`,
      `CTA: ${editCta || plan.cta}`,
      ``,
      `WHY THIS IDEA WORKS:`,
      `${(plan.why_this_idea || "").trim()}`,
      ``,
      `WHAT TO TALK ABOUT:`,
      ...(plan.content_advice || []).map((x) => `- ${x}`),
      ``,
      `MUST DO TODAY:`,
      ...(plan.must_do_today || []).map((x) => `- ${x}`),
      ``,
      `OPTIONAL IF TIME:`,
      ...(plan.optional_if_time || []).map((x) => `- ${x}`),
      ``,
      `BEATS:`,
      ...(plan.beats || []).map((x, i) => `${i + 1}. ${x}`),
      ``,
      `SELECTED SHOTS:`,
      ...(selectedShots || []).map((x) => `- ${x}`),
      ``,
      `ON SCREEN:`,
      ...(plan.on_screen || []).map((x) => `- ${x}`),
      ``,
      `AVOID:`,
      ...(plan.avoid || []).map((x) => `- ${x}`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
    } catch {
      // ignore
    }
  };

  const finalize = async () => {
    if (!plan) return;
    if (isFinal) return;

    setBusy(true);
    setError("");

    try {
      const adjustments = {
        title: editTitle,
        hook: editHook,
        angle: editAngle,
        reveal: editReveal,
        cta: editCta,
        shots: selectedShots,
        change_request: changeRequest.trim().slice(0, 200),
      };

      const res = await apiFetch<any>("/api/v1/video_content_detailed/finalize", {
        method: "POST",
        body: JSON.stringify({
          channel_tag: tag,
          idea_uuid: ideaUuid,
          version,
          ...(trendId ? { trend_id: trendId } : {}),
          ...(exploreBatchUuid ? { explore_batch_uuid: exploreBatchUuid } : {}),
          current_plan: plan,
          adjustments,
        }),
      });

      if (!res?.data?.video_detail) {
        throw new Error("Finalize returned invalid data.");
      }

      onSuggestionLoaded(res.data);
      setIsFinal(true);
    } catch (e: any) {
      setError(e?.message || "Finalize failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!ideaUuid) {
    return <div className="p-6 text-neutral-200">Missing idea uuid.</div>;
  }

  if (!tag) {
    return (
      <div className="p-6 text-neutral-200">
        Missing channel tag. Open with{" "}
        <span className="text-neutral-400">?tag=@your_channel_tag</span>.
      </div>
    );
  }

  if (booting) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="p-6 text-neutral-200 flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          Loading idea…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {!plan ? (
        <IdeaBuilderWizard
          ideaUuid={ideaUuid}
          tag={tag}
          version={version}
          trendId={trendId}
          exploreBatchUuid={exploreBatchUuid}
          onFinal={(data) => onSuggestionLoaded(data)}
        />
      ) : (
        <section className="grid lg:grid-cols-[1fr_420px] gap-6">
          <div className="border border-[#242335] rounded-2xl p-6 bg-[#12111A]/80 shadow-lg space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className={`text-xs px-2 py-1 rounded-full border ${isFinal
                        ? "border-[#00F5A0]/40 bg-[#00F5A0]/10 text-[#00F5A0]"
                        : "border-[#6C63FF]/40 bg-[#6C63FF]/10 text-[#6C63FF]"
                      }`}
                  >
                    {isFinal ? "Finalized" : "Idea Suggestion"}
                  </div>


                </div>

                <h1 className="text-2xl font-semibold text-white mt-2 break-words">
                  {plan.title}
                </h1>

                <p className="text-sm text-neutral-300 mt-2">{plan.hook}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={copyPlan}
                  className="px-3 py-2 rounded-xl border border-[#2E2D39] bg-[#14131C] hover:border-[#6C63FF]/60 transition text-sm text-neutral-200 flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copy
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="border border-[#2E2D39] rounded-xl p-3 bg-[#14131C]">
                <div className="text-neutral-400 text-xs">Duration</div>
                <div className="text-neutral-100 mt-1">{plan.duration}</div>
              </div>

              <div className="border border-[#2E2D39] rounded-xl p-3 bg-[#14131C]">
                <div className="text-neutral-400 text-xs">Angle</div>
                <div className="text-neutral-100 mt-1">{plan.angle}</div>
              </div>

              <div className="border border-[#2E2D39] rounded-xl p-3 bg-[#14131C]">
                <div className="text-neutral-400 text-xs">CTA</div>
                <div className="text-neutral-100 mt-1">{plan.cta}</div>
              </div>
            </div>

            {/* Plain text "why" reused from trend service */}
            <IdeaWhyWorks text={plan.why_this_idea} />

            {/* What to talk about */}
            <IdeaContentAdvice items={plan.content_advice || []} />

            <Section title="Adjust it (optional)" hint={isFinal ? "Locked" : "Short edits"}>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">Title</div>
                  <input
                    disabled={isFinal}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2E2D39] bg-[#14131C] text-neutral-100 text-sm disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">Hook</div>
                  <input
                    disabled={isFinal}
                    value={editHook}
                    onChange={(e) => setEditHook(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2E2D39] bg-[#14131C] text-neutral-100 text-sm disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">Angle</div>
                  <input
                    disabled={isFinal}
                    value={editAngle}
                    onChange={(e) => setEditAngle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2E2D39] bg-[#14131C] text-neutral-100 text-sm disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">Reveal</div>
                  <input
                    disabled={isFinal}
                    value={editReveal}
                    onChange={(e) => setEditReveal(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2E2D39] bg-[#14131C] text-neutral-100 text-sm disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <div className="text-xs text-neutral-500">CTA</div>
                  <input
                    disabled={isFinal}
                    value={editCta}
                    onChange={(e) => setEditCta(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2E2D39] bg-[#14131C] text-neutral-100 text-sm disabled:opacity-60"
                  />
                </div>
              </div>
            </Section>

            <div className="grid sm:grid-cols-2 gap-4">
              <Section title="Must do today" hint={`${plan.must_do_today?.length || 0} items`}>
                <ChipRow items={plan.must_do_today || []} />
              </Section>
              <Section title="Optional if time" hint={`${plan.optional_if_time?.length || 0} items`}>
                <ChipRow items={plan.optional_if_time || []} />
              </Section>
            </div>

            <Section title="Beats" hint={`${plan.beats?.length || 0} steps`}>
              <NumberedList items={plan.beats || []} />
            </Section>

            <Section
              title={`Shots (pick your ${plan.shots?.length || 6})`}
              hint={isFinal ? "Locked" : "Tap to select"}
            >
              <Checklist
                items={plan.shots || []}
                selected={selectedShots}
                onToggle={toggleShot}
                max={plan.shots?.length || 6}
                disabled={isFinal}
              />
            </Section>

            <div className="grid sm:grid-cols-2 gap-4">
              <Section title="On-screen numbers" hint={`${plan.on_screen?.length || 0} items`}>
                <ChipRow items={plan.on_screen || []} />
              </Section>

              <Section title="Avoid" hint={`${plan.avoid?.length || 0} items`}>
                <NumberedList items={plan.avoid || []} />
              </Section>
            </div> 
            {!isFinal && <>
            <Section title="What should change?" hint={`${changeRequest.length}/200`}>
              <textarea
                disabled={isFinal}
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value.slice(0, 200))}
                placeholder="Optional. Leave empty to finalize instantly without AI."
                className="w-full min-h-[90px] px-3 py-2 rounded-xl border border-[#2E2D39] bg-[#14131C] text-neutral-100 text-sm disabled:opacity-60"
              />
              <p className="mt-2 text-xs text-neutral-500">
                If this is empty, finalizing will NOT trigger an AI call.
              </p>
            </Section>

            {error ? (
              <div className="text-sm text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl p-3">
                {error}
              </div>
            ) : null}
            
            <div className="flex justify-center">
              <PurpleActionButton
                disabled={busy || isFinal}
                onClick={finalize}
                label="Finalize Idea"
                loading={busy}
              />
            </div>
            </>
            }

            {isFinal ? (
              <p className="text-xs text-neutral-500 text-center">
                This idea is finalized and locked.
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            <IdeaThumbnail v={plan} ideaUuid={ideaUuid} trendId={trendId} />
          </div>
        </section>
      )}
    </main>
  );
}
