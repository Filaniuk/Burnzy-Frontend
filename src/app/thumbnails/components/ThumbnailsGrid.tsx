import type { GeneratedThumbnail } from "@/types/thumbnail";
import ThumbnailCard from "./ThumbnailCard";

export default function ThumbnailsGrid({
  items,
  onMutate,
}: {
  items: GeneratedThumbnail[];
  onMutate?: () => Promise<void> | void;
}) {
  if (!items.length) {
    return (
      <section className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] p-8 text-center">
        <p className="text-white font-semibold">No thumbnails yet</p>
        <p className="mt-2 text-sm text-neutral-400">
          Generate your first thumbnail from an idea to populate this library.
        </p>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4">
      {items.map((t) => (
        <ThumbnailCard key={t.id} item={t} onMutate={onMutate} />
      ))}
    </section>
  );
}
