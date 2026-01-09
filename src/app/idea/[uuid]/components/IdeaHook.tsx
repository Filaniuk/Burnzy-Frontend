"use client";
import { Film, Clock, Sparkles } from "lucide-react";

export default function IdeaHook({ v }: { v: any }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="text-[#00F5A0]" size={20} />
        <h2 className="text-xl font-semibold text-[#00F5A0]">Hook</h2>
      </div>
      <p className="text-neutral-300 italic">{v.hook}</p>

      <div className="grid sm:grid-cols-3 gap-4 mt-4 text-sm text-neutral-300">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#6C63FF]" />
          Duration: {v.duration_estimate}
        </div>
        <div className="flex items-center gap-2">
          <Film size={18} className="text-[#6C63FF]" />
          Type: {v.video_type}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-neutral-400">🎯 Trend Score: {v.trend_score}/10</span>
          <div className="w-full bg-[#2E2D39] rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] transition-[width] duration-500"
              style={{ width: `${(v.trend_score || 0) * 10}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
