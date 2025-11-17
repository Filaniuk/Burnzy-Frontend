"use client";

import PortfolioCard from "./PortfolioCard";

interface Props {
  title: string;
  color: string;
  items: any[];
  onSelectPlan: (item: any) => void;
  router: any;
}

export default function PortfolioSection({
  title,
  color,
  items,
  onSelectPlan,
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
          <PortfolioCard
            key={`${item.channel_tag}-${item.version}-${i}`}
            item={item}
            onSelectPlan={onSelectPlan}
            router={router}
            accentColor={color}
          />
        ))}
      </div>
    </section>
  );
}
