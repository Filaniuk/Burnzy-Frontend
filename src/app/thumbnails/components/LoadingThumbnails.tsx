export default function LoadingThumbnails() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-[#2E2D39] bg-[#1B1A24] overflow-hidden animate-pulse"
        >
          <div className="aspect-[16/9] bg-[#0F0E17]" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-2/3 bg-[#0F0E17] rounded-xl" />
            <div className="h-3 w-1/2 bg-[#0F0E17] rounded-xl" />
            <div className="h-3 w-full bg-[#0F0E17] rounded-xl" />
            <div className="h-3 w-5/6 bg-[#0F0E17] rounded-xl" />
          </div>
        </div>
      ))}
    </section>
  );
}
