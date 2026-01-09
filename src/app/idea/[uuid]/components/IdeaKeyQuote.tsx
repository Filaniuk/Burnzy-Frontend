"use client";
import { Quote } from "lucide-react";

export default function IdeaKeyQuote({ v }: { v: any }) {
  return (
    <section className="bg-gradient-to-r from-[#1E1D29] to-[#171621] border border-[#2E2D39] rounded-xl p-5 shadow-inner">
      <div className="flex items-center gap-2 mb-3">
        <Quote className="text-[#6C63FF]" size={20} />
        <h3 className="text-lg font-semibold text-[#6C63FF]">Key Quote</h3>
      </div>
      <blockquote className="italic text-neutral-200 text-base leading-relaxed border-l-4 border-[#6C63FF] pl-4">
        “{v.key_quote_or_line}”
      </blockquote>
    </section>
  );
}
