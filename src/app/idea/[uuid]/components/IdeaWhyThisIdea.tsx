"use client";

export default function IdeaWhyThisIdea({ v }: { v: any }) {
  if (!v.why_this_idea) return null;

  return (
    <section className="bg-gradient-to-r from-[#1E1D29] to-[#171621] border border-[#2E2D39] rounded-xl p-5 shadow-inner">
      <h3 className="text-[#6C63FF] font-semibold mb-2 flex items-center gap-2">
        🤔 Why This Idea Works
      </h3>
      <p className="text-neutral-300 leading-relaxed">{v.why_this_idea}</p>
    </section>
  );
}
