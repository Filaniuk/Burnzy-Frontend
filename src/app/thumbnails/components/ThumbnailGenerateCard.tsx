"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, Sparkles } from "lucide-react";

type Props = {
  onGenerate: (ideaUuid: string) => Promise<void>;
  loading?: boolean;
};

export default function ThumbnailGenerateCard({ onGenerate, loading }: Props) {
  const [ideaUuid, setIdeaUuid] = useState("");

  const canSubmit = useMemo(() => ideaUuid.trim().length >= 4, [ideaUuid]);

  return (
    <section className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-[#6C63FF]/20 border border-[#6C63FF]/30 flex items-center justify-center">
          <ImageIcon size={18} className="text-[#6C63FF]" />
        </div>

        <div className="flex-1">
          <h2 className="text-white font-semibold">Generate a thumbnail</h2>
          <p className="mt-1 text-sm text-neutral-300">
            Enter an idea UUID (from your ideas page) and generate a new cinematic thumbnail. The result will be stored automatically.
          </p>

          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <input
              value={ideaUuid}
              onChange={(e) => setIdeaUuid(e.target.value)}
              placeholder="Idea UUID (e.g., 6f2a...)"
              className="flex-1 rounded-2xl bg-[#0F0E17] border border-[#2E2D39] px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/60"
            />

            <button
              disabled={!canSubmit || loading}
              onClick={() => onGenerate(ideaUuid.trim())}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-medium transition",
                canSubmit && !loading
                  ? "bg-[#6C63FF] text-white hover:brightness-110"
                  : "bg-[#2A2933] text-neutral-500 cursor-not-allowed",
              ].join(" ")}
            >
              <Sparkles size={16} />
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
