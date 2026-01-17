"use client";

export default function IdeaPlanList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (!Array.isArray(items) || !items.length) return null;

  return (
    <section className="border border-[#2E2D39] rounded-2xl p-5 bg-[#12111A]/70">
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      <ul className="space-y-2 text-neutral-200 text-sm leading-relaxed">
        {items.map((x, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1 w-2 h-2 rounded-full bg-[#00F5A0] shrink-0" />
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
