"use client";

export default function IdeaNarrativeArc({ v }: { v: any }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-[#00F5A0] mb-3">Narrative Arc</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {v.narrative_arc?.map((arc: any, i: number) => (
          <div
            key={i}
            className="bg-[#12111A]/80 border border-[#242335] rounded-2xl p-5 shadow-md hover:shadow-[#6C63FF]/10 transition-shadow"
          >
            <h4 className="text-[#6C63FF] font-semibold mb-1 text-sm uppercase tracking-wide">
              {arc.act}
            </h4>
            <p className="text-neutral-300 text-sm leading-relaxed">{arc.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
