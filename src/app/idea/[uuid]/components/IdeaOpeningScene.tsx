"use client";
import { PlayCircle } from "lucide-react";

export default function IdeaOpeningScene({ v }: { v: any }) {
  return (
    <section className="bg-[#12111A]/90 border border-[#242335] rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <PlayCircle className="text-[#00F5A0]" size={22} />
        <h2 className="text-xl font-semibold text-[#00F5A0]">Opening Scene</h2>
      </div>
      <p className="text-neutral-300 leading-relaxed italic">{v.opening_scene}</p>
    </section>
  );
}
