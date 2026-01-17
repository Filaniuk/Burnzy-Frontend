"use client";

import IdeaPlanHeader from "./IdeaPlanHeader";
import IdeaPlanList from "./IdeaPlanList";

export default function IdeaPlan({ v }: { v: any }) {
  return (
    <div className="space-y-6">
      <IdeaPlanHeader v={v} />

      <IdeaPlanList title="Structure (5–8 beats)" items={v.structure || []} />

      <IdeaPlanList title="Must-get shots" items={v.must_get_shots || []} />

      <section className="border border-[#2E2D39] rounded-2xl p-5 bg-[#12111A]/70 space-y-3">
        <div className="text-sm text-neutral-200">
          <span className="text-[#6C63FF] font-semibold">Reveal:</span>{" "}
          {v.reveal || "—"}
        </div>

        <div className="text-sm text-neutral-200">
          <span className="text-[#00F5A0] font-semibold">CTA:</span>{" "}
          {v.CTA || "—"}
        </div>
      </section>

      <IdeaPlanList title="Avoid (keep it clean)" items={v.avoid || []} />
    </div>
  );
}
