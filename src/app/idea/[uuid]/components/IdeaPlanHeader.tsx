"use client";

export default function IdeaPlanHeader({ v }: { v: any }) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-3xl sm:text-4xl font-bold text-white">{v.title}</h1>
      <p className="text-neutral-300 italic max-w-2xl mx-auto">{v.hook}</p>

      <div className="mt-3 text-sm text-neutral-400">
        <span className="text-[#00F5A0] font-semibold">Angle:</span>{" "}
        {v.angle || "—"}{" "}
        <span className="mx-2">•</span>
        <span className="text-[#6C63FF] font-semibold">Duration:</span>{" "}
        {v.duration || "—"}
      </div>
    </div>
  );
}
