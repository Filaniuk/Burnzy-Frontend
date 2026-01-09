"use client";
import { Heart } from "lucide-react";

export default function IdeaEmotions({ v }: { v: any }) {
  if (!v.target_emotion?.length) return null;

  return (
    <section className="bg-[#12111A]/90 border border-[#2E2D39] rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="text-[#FF5E5E]" size={20} />
        <h2 className="text-xl font-semibold text-[#FF5E5E]">Target Emotions</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {v.target_emotion.map((emotion: string, i: number) => (
          <span
            key={i}
            className="bg-[#2A2936] text-white/90 px-3 py-1 rounded-full text-sm border border-[#3C3B47]"
          >
            {emotion}
          </span>
        ))}
      </div>
    </section>
  );
}
