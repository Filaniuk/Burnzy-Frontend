"use client";
import { Search } from "lucide-react";

export default function IdeaSEOKeywords({ v }: { v: any }) {
  if (!v.seo_keywords?.length) return null;

  return (
    <section className="bg-gradient-to-r from-[#1A1925] to-[#13121C] border border-[#2E2D39] rounded-xl p-6 shadow-inner">
      <div className="flex items-center gap-2 mb-3">
        <Search className="text-[#6C63FF]" size={20} />
        <h2 className="text-xl font-semibold text-[#6C63FF]">SEO Keywords</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {v.seo_keywords.map((kw: string, i: number) => (
          <span
            key={i}
            className="bg-[#2A2936] border border-[#3C3B47] px-3 py-1 rounded-full text-sm text-white/90"
          >
            {kw}
          </span>
        ))}
      </div>
    </section>
  );
}
