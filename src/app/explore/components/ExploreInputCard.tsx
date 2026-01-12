"use client";

import { motion, AnimatePresence } from "framer-motion";
import ToggleSwitch from "@/components/ToggleSwitch";
import Link from "next/link";
import { GradientActionButton } from "@/components/GradientActionButton";

type Advanced = {
  budget: string;
  location: string;
  desired_length: string;
  format: "auto" | "shorts" | "long_form";
  constraints: string;
};

const controlBase =
  "w-full rounded-2xl bg-[#0F0E17] text-white placeholder:text-white/30 text-sm outline-none " +
  "ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset ring-offset-0";

export default function ExploreInputCard({
  creatorInput,
  setCreatorInput,
  advancedOpen,
  setAdvancedOpen,
  advanced,
  setAdvanced,
  isLoading,
  onSubmit,
  inputError,
  inputErrorText,
}: {
  creatorInput: string;
  setCreatorInput: (v: string) => void;

  advancedOpen: boolean;
  setAdvancedOpen: (v: boolean) => void;

  advanced: Advanced;
  setAdvanced: (updater: (prev: Advanced) => Advanced) => void;

  isLoading: boolean;
  onSubmit: () => void;

  // NEW
  inputError?: boolean;
  inputErrorText?: string;
}) {
  const canSubmit = !isLoading && creatorInput.trim().length >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-white/10 bg-[#14131C] shadow-xl p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Your idea</h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Add a rough concept, angle, or topic. We will come up with high-leverage variations.
          </p>
        </div>

        <div className="shrink-0">
          <GradientActionButton onClick={onSubmit} disabled={!canSubmit} loading={isLoading} label="Explore Ideas" />
        </div>
      </div>

      <div className="mt-5">
        <textarea
          value={creatorInput}
          onChange={(e) => setCreatorInput(e.target.value)}
          rows={5}
          placeholder='Example: "I want to make a video about how I trained for a half marathon while working full time."'
          className={[
            controlBase,
            "p-4 leading-relaxed",
            inputError ? "ring-red-500 focus:ring-red-500" : "focus:ring-white/20",
          ].join(" ")}
        />

        {inputError && (
          <span className="mt-2 block text-xs text-red-400">
            {inputErrorText || "Please enter at least 8 characters."}
          </span>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Tailored to your primary channel</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Hot trends</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Short meaning summary</span>
        </div>

        <p className="text-xs text-neutral-400 mt-5 max-w-2xl">
          Each explored idea is stored in your{" "}
          <Link href="/dashboard" className="text-[#00F5A0] hover:text-emerald-400">
            dashboard
          </Link>
          .
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <ToggleSwitch enabled={advancedOpen} onToggle={() => setAdvancedOpen(!advancedOpen)} label="Advanced options" />

        <div className="w-full">
          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mx-auto w-full max-w-2xl">
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="Budget"
                      value={advanced.budget}
                      placeholder='Example: "low", "$0-$300", "medium"'
                      onChange={(v) => setAdvanced((p) => ({ ...p, budget: v }))}
                    />

                    <Field
                      label="Location"
                      value={advanced.location}
                      placeholder='Example: "New York"'
                      onChange={(v) => setAdvanced((p) => ({ ...p, location: v }))}
                    />

                    <Field
                      label="Desired length"
                      value={advanced.desired_length}
                      placeholder='Example: "30-45s", "8-10 min"'
                      onChange={(v) => setAdvanced((p) => ({ ...p, desired_length: v }))}
                    />

                    <div className="flex flex-col gap-2 min-w-0">
                      <label className="text-xs text-white/70">Format</label>
                      <select
                        value={advanced.format}
                        onChange={(e) =>
                          setAdvanced((p) => ({
                            ...p,
                            format: e.target.value as Advanced["format"],
                          }))
                        }
                        className={`${controlBase} p-3 focus:ring-white/20`}
                      >
                        <option value="auto">Auto</option>
                        <option value="shorts">Shorts</option>
                        <option value="long_form">Long-form</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 min-w-0">
                      <label className="text-xs text-white/70">Constraints</label>
                      <textarea
                        value={advanced.constraints}
                        onChange={(e) => setAdvanced((p) => ({ ...p, constraints: e.target.value }))}
                        rows={3}
                        placeholder='Example: "No gym footage. Focus on city running + routine."'
                        className={`${controlBase} mt-2 p-4 leading-relaxed focus:ring-white/20`}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-white/40 mt-4">Advanced options improve the quality of explored ideas.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <label className="text-xs text-white/70">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${controlBase} p-3 focus:ring-white/20`} />
    </div>
  );
}
