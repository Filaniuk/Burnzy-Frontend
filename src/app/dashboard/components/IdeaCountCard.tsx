export default function IdeaCountCard({ label, count, color }) {
  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-6 text-center">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>
        {count}
      </p>
    </div>
  );
}
