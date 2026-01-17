"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";

import BuilderQuestionBlock from "./BuilderQuestionBlock";
import type {
  BuilderApiResponse,
  BuilderPayload,
  BuilderAnswer,
  FinalIdeaApiResponse,
  BuilderQuestion,
} from "@/types/builderTypes";
import { PurpleActionButton } from "@/components/PurpleActionButton";

type AnswerState = {
  value: string | string[];
  customText?: string;
};

type BuilderInitResponse = {
  status: "success" | "error";
  data?: {
    locked: {
      title: string;
      format: "short_form" | "long_form";
      duration_default: string;
    };
    duration_picker: {
      format: "short_form" | "long_form";
      min_seconds: number;
      max_seconds: number;
      presets: { label: string; value: string }[];
      recommended_default: string;
    };
  };
};

export default function IdeaBuilderWizard({
  ideaUuid,
  tag,
  version,
  trendId,
  exploreBatchUuid,
  onFinal,
}: {
  ideaUuid: string;
  tag: string;
  version: number;
  trendId?: number | null;
  exploreBatchUuid?: string | null;
  onFinal: (finalData: any) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [builder, setBuilder] = useState<BuilderPayload | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [error, setError] = useState<string>("");

  // Step 0 = duration screen
  const [stage, setStage] = useState<"duration" | "questions">("duration");

  const [lockedFormat, setLockedFormat] = useState<"short_form" | "long_form">("long_form");
  const [durationPresets, setDurationPresets] = useState<{ label: string; value: string }[]>([]);
  const [durationSelected, setDurationSelected] = useState<string>("");

  const storageKey = useMemo(
    () => `idea_builder:${ideaUuid}:${tag}:${version}`,
    [ideaUuid, tag, version]
  );

  // Load init (NO AI CALL)
  useEffect(() => {
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await apiFetch<BuilderInitResponse>("/api/v1/video_content_detailed/builder_init", {
          method: "POST",
          body: JSON.stringify({
            channel_tag: tag,
            idea_uuid: ideaUuid,
            version,
            ...(trendId ? { trend_id: trendId } : {}),
            ...(exploreBatchUuid ? { explore_batch_uuid: exploreBatchUuid } : {}),
          }),
        });

        const fmt = res?.data?.locked?.format || "long_form";
        const presets = res?.data?.duration_picker?.presets || [];
        const recommended = res?.data?.duration_picker?.recommended_default || "";

        setLockedFormat(fmt);
        setDurationPresets(presets);

        // default selection: use backend recommendation if present, else first preset
        if (recommended) {
          setDurationSelected(recommended);
        } else if (presets.length) {
          setDurationSelected(presets[0].value);
        } else {
          setDurationSelected(fmt === "short_form" ? "60 sec" : "12 min");
        }

        // Restore draft answers if they exist (questions stage only)
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") setAnswers(parsed);
          }
        } catch { }
      } catch (e: any) {
        setError(e?.message || "Failed to load builder init.");
      } finally {
        setLoading(false);
      }
    })();
  }, [ideaUuid, tag, version, trendId, exploreBatchUuid, storageKey]);

  // persist answers
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch { }
  }, [answers, storageKey]);

  const questions: BuilderQuestion[] = useMemo(() => builder?.questions || [], [builder]);
  const q = questions[currentStep];

  const isLast = currentStep === questions.length - 1;
  const progress = questions.length ? Math.round(((currentStep + 1) / questions.length) * 100) : 0;

  const setAnswer = (qid: string, v: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        ...prev[qid],
        value: v,
      },
    }));
  };

  const setCustom = (qid: string, txt: string) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: {
        ...prev[qid],
        customText: txt,
      },
    }));
  };

  const validateQuestion = (q: BuilderQuestion) => {
    if (!q.required) return true;

    const a = answers[q.id];

    if (q.type === "free_text") {
      return typeof a?.value === "string" && a.value.trim().length > 0;
    }

    const selected =
      Array.isArray(a?.value) ? a.value : typeof a?.value === "string" ? [a.value] : [];

    if (!selected.length) return false;

    if (selected.includes("custom")) {
      return (a?.customText || "").trim().length > 0;
    }

    return true;
  };

  const goNext = () => {
    setError("");
    if (!q) return;

    const ok = validateQuestion(q);
    if (!ok) {
      setError("Pick an option (or fill custom). Keep it short.");
      return;
    }

    setCurrentStep((s) => Math.min(s + 1, questions.length - 1));
  };

  const goBack = () => {
    setError("");
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const buildFinalPayload = (): BuilderAnswer[] => {
    return questions.map((q) => {
      const a = answers[q.id];

      if (!a) {
        return { question_id: q.id, value: q.type === "multi_select" ? [] : "" } as any;
      }

      const selected =
        Array.isArray(a.value) ? a.value : typeof a.value === "string" ? a.value : "";

      return {
        question_id: q.id,
        value: selected,
        custom_text: a.customText || null,
      } as any;
    });
  };

  // Step 0 submit (duration -> fetch builder with override)
  const continueFromDuration = async () => {
    setError("");
    setSubmitting(true);

    try {
      const res = await apiFetch<BuilderApiResponse>("/api/v1/video_content_detailed/builder", {
        method: "POST",
        body: JSON.stringify({
          channel_tag: tag,
          idea_uuid: ideaUuid,
          version,
          duration_estimate_override: durationSelected,
          ...(trendId ? { trend_id: trendId } : {}),
          ...(exploreBatchUuid ? { explore_batch_uuid: exploreBatchUuid } : {}),
        }),
      });

      const b = res?.data?.builder;
      if (!b?.questions?.length) throw new Error("Builder returned no questions.");

      setBuilder(b);
      setStage("questions");
      setCurrentStep(0);
    } catch (e: any) {
      setError(e?.message || "Failed to load builder questions.");
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    setError("");
    if (!builder) return;

    for (const q of questions) {
      if (!validateQuestion(q)) {
        setError("You missed a required question. Finish the flow.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = buildFinalPayload();

      const res = await apiFetch<FinalIdeaApiResponse>("/api/v1/video_content_detailed/from_builder", {
        method: "POST",
        body: JSON.stringify({
          channel_tag: tag,
          idea_uuid: ideaUuid,
          version,
          duration_override: durationSelected, // IMPORTANT: lock it
          ...(trendId ? { trend_id: trendId } : {}),
          ...(exploreBatchUuid ? { explore_batch_uuid: exploreBatchUuid } : {}),
          builder,
          answers: payload,
        }),
      });

      if (!res?.data?.video_detail) {
        throw new Error("Final idea generation returned invalid data.");
      }

      try {
        localStorage.removeItem(storageKey);
      } catch { }

      onFinal(res.data);
    } catch (e: any) {
      setError(e?.message || "Failed to generate final idea.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="border border-[#242335] rounded-2xl p-6 bg-[#12111A]/80">
        <div className="flex items-center gap-3 text-neutral-300">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading your idea builder…</span>
        </div>
      </section>
    );
  }

  if (stage === "duration") {
    return (
      <section className="w-full border border-[#242335] rounded-2xl p-6 bg-[#12111A]/80 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#00F5A0] flex items-center gap-2">
              <Sparkles size={18} />
              Build your video idea
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              First: lock your duration. Then we generate the right number of questions.
            </p>
          </div>

          <div className="text-xs text-neutral-400">
            Format:{" "}
            <span className="text-neutral-200 font-medium">
              {lockedFormat === "short_form" ? "Shorts" : "Long form"}
            </span>
          </div>
        </div>

        <div className="mt-6 border border-[#2E2D39] bg-[#14131C] rounded-2xl p-5">
          <div className="text-sm text-neutral-200 font-medium">
            How long should the video be?
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            {lockedFormat === "short_form"
              ? "Shorts max is 3 minutes."
              : "Pick a practical duration that you can actually deliver."}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {durationPresets.map((p) => (
              <button
                key={p.value}
                onClick={() => setDurationSelected(p.value)}
                className={[
                  "px-3 py-2 rounded-xl border text-sm transition",
                  durationSelected === p.value
                    ? "border-[#00F5A0] bg-[#00F5A0]/10 text-neutral-100"
                    : "border-[#2E2D39] bg-[#14131C] text-neutral-300 hover:border-[#6C63FF]/50",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
            <span>Selected:</span>
            <span className="text-neutral-200 font-medium">{durationSelected}</span>
          </div>
        </div>

        {error ? (
          <div className="mt-4 text-sm text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl p-3">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end">

          <PurpleActionButton
            label="Continue ->"
            onClick={continueFromDuration}
            disabled={submitting || !durationSelected}
            loading={submitting}
          />
        </div>
      </section>
    );
  }

  // stage === "questions"
  if (!builder || !questions.length) {
    return (
      <section className="border border-[#242335] rounded-2xl p-6 bg-[#12111A]/80">
        <p className="text-neutral-300">Builder not available.</p>
        {error ? <p className="text-sm text-red-400 mt-2">{error}</p> : null}
      </section>
    );
  }

  const currentAnswer = answers[q?.id || ""]?.value ?? (q?.type === "multi_select" ? [] : "");
  const currentCustom = answers[q?.id || ""]?.customText ?? "";

  return (
    <section className="w-full border border-[#242335] rounded-2xl p-6 bg-[#12111A]/80 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#00F5A0] flex items-center gap-2">
            <Sparkles size={18} />
            Build your video idea
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Duration locked: <span className="text-neutral-200">{durationSelected}</span>
          </p>
        </div>

        <div className="text-xs text-neutral-400">
          {builder.estimated_minutes} min video · {questions.length} questions
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
          <span>
            Step {currentStep + 1} / {questions.length}
          </span>
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-[#2E2D39] rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00F5A0]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <BuilderQuestionBlock
          q={q}
          value={currentAnswer}
          customText={currentCustom}
          onChange={(v) => setAnswer(q.id, v)}
          onCustomChange={(txt) => setCustom(q.id, txt)}
        />
      </div>

      {error ? (
        <div className="mt-4 text-sm text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl p-3">
          {error}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={goBack}
          disabled={currentStep === 0 || submitting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#2E2D39] bg-[#14131C] hover:border-[#6C63FF]/60 transition text-sm text-neutral-200 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {!isLast ? (
          <button
            onClick={goNext}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#2E2D39] bg-[#14131C] hover:border-[#00F5A0]/50 transition text-sm text-neutral-200"
          >
            Next
            <ArrowRight size={16} />
          </button>
        ) : (
          <PurpleActionButton
            onClick={submit}
            disabled={submitting}
            loading={submitting}
            label="Generate idea"
          />

        )}
      </div>
    </section>
  );
}
