"use client";

import HistoryCard from "./HistoryCard";

interface Props {
  title: string;
  color: string;
  items: any[];
  router: any;
}

export default function HistorySection({
  title,
  color,
  items,
  router,
}: Props) {
  return (
    <section aria-label={title}>
      <h2
        className="text-2xl font-semibold mb-6 border-b border-[#2E2D39] pb-2"
        style={{ color }}
      >
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <HistoryCard
            key={`${item.channel_tag}-${item.version}-${i}`}
            item={item}
            router={router}
            accentColor={color}
          />
        ))}
      </div>
    </section>
  );
}
