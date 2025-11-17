"use client";
import { Layers } from "lucide-react";

export default function IdeaSecondaryTopics({ v }: { v: any }) {
  if (!v.secondary_topics?.length) return null;

  return (
    <section className="bg-[#12111A]/90 border border-[#242335] rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Layers className="text-[#00F5A0]" size={20} />
        <h2 className="text-xl font-semibold text-[#00F5A0]">Secondary Topics</h2>
      </div>
      <ul className="list-disc list-inside text-neutral-300 space-y-1">
        {v.secondary_topics.map((topic: string, i: number) => (
          <li key={i}>{topic}</li>
        ))}
      </ul>
    </section>
  );
}
