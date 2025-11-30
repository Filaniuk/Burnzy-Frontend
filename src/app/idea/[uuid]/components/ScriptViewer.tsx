"use client";

import { ScriptData } from "@/types/idea";
import { useState } from "react";

type Props = {
  script: ScriptData | null;
};

type SectionKey = "hooks" | "timeline" | "shots" | "shorts";

export default function ScriptViewer({ script }: Props) {
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    hooks: true,
    timeline: true,
    shots: false,
    shorts: false,
  });

  if (!script) {
    return (
      <div className="border border-dashed border-[#2E2D39] rounded-xl py-10 px-4 text-center text-sm text-neutral-400 bg-[#14131C]/60">
        <p className="font-medium mb-1 text-neutral-300">
          No script generated yet.
        </p>
        <p>
          Switch to the Script tab and click{" "}
          <span className="text-[#00F5A0] font-medium">
            “Generate Script”
          </span>{" "}
          to create a full, timestamped video script.
        </p>
      </div>
    );
  }

  const toggle = (key: SectionKey) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-5 mt-4">
      {/* Title */}
      <div className="bg-[#1B1A24] border border-[#2E2D39] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Generated Script For
          </p>
          <h2 className="text-lg font-semibold text-white">
            {script.title}
          </h2>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-[#2E2D39] bg-[#16151E] text-neutral-300">
          🧠 Draft · edit freely
        </span>
      </div>

      {/* Hooks */}
      <Section
        title="Alternate Hooks"
        subtitle="3 variants to test in title/intro or Shorts"
        color="#6C63FF"
        open={open.hooks}
        onToggle={() => toggle("hooks")}
      >
        <ul className="list-disc list-inside text-neutral-200 space-y-1 text-sm">
          {script.three_alternate_hooks.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </Section>

      {/* Timeline */}
      <Section
        title="Timestamped Script"
        subtitle="Scene-by-scene breakdown with VO and B-roll notes"
        color="#00F5A0"
        open={open.timeline}
        onToggle={() => toggle("timeline")}
      >
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scroll">
          {script.timestamped_script.map((line, i) => (
            <div
              key={`${line.time}-${i}`}
              className="border-b border-[#2E2D39] pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[0.75rem] font-semibold text-[#00F5A0]">
                  {line.time}
                </span>
                <span className="text-[0.7rem] text-neutral-500">
                  Scene {i + 1}
                </span>
              </div>
              <p className="font-medium text-sm text-white mb-1">
                {line.scene}
              </p>
              <p className="text-neutral-300 text-[0.85rem] leading-relaxed">
                {line.voiceover}
              </p>
              {line.visuals && (
                <p className="text-[0.75rem] text-neutral-400 mt-1">
                  <span className="font-semibold text-neutral-300">
                    Visuals:
                  </span>{" "}
                  {line.visuals}
                </p>
              )}
              {!!line.b_roll?.length && (
                <p className="text-[0.75rem] text-neutral-500 mt-1">
                  <span className="font-semibold text-neutral-300">
                    B-roll:
                  </span>{" "}
                  {line.b_roll.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Shot list */}
      <Section
        title="Shot List"
        subtitle="What you actually need to film"
        color="#FFFFFF"
        open={open.shots}
        onToggle={() => toggle("shots")}
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {script.shot_list.map((s, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-[#16151E] border border-[#2E2D39]"
            >
              <p className="font-semibold text-sm text-white">
                {s.shot_type}
              </p>
              <p className="text-[0.85rem] text-neutral-300 mt-1">
                {s.description}
              </p>
              <p className="text-[0.7rem] text-neutral-500 mt-2">
                Duration:{" "}
                <span className="text-neutral-300">
                  {s.estimated_duration}
                </span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Shorts Version */}
      <Section
        title="Shorts Version"
        subtitle="Vertical cut: hook + beats + CTA"
        color="#FF6C6C"
        open={open.shorts}
        onToggle={() => toggle("shorts")}
      >
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Hook
            </p>
            <p className="text-neutral-200">{script.shorts_version.hook}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">
              Script Beats
            </p>
            <ul className="list-decimal list-inside space-y-1 text-neutral-200">
              {script.shorts_version.script.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              CTA
            </p>
            <p className="text-neutral-200">
              {script.shorts_version.cta}
            </p>
          </div>
        </div>
      </Section>

      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #262533;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}

// -------------------------------------
// Collapsible Section component
// -------------------------------------
function Section({
  title,
  subtitle,
  color,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  color: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#1B1A24] border border-[#2E2D39] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#181722] transition"
      >
        <div>
          <h3
            className="text-sm sm:text-base font-semibold"
            style={{ color }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-[0.75rem] text-neutral-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <span className="text-neutral-400 text-xs flex items-center gap-1">
          {open ? "Hide" : "Show"}
          <span
            className={`inline-block transform transition-transform ${
              open ? "rotate-180" : "rotate-0"
            }`}
          >
            ⌃
          </span>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[#2E2D39]">
          {children}
        </div>
      )}
    </section>
  );
}
