"use client";

export default function IdeaHeader({ data }: { data: any }) {
  const v = data.video_detail;
  return (
    <div className="text-center">
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent mb-2">
        {v.title}
      </h1>
      <p className="text-neutral-400">{data.channel_name}</p>
      <div className="mt-3 text-sm text-neutral-500">{data.niche} · {data.tone}</div>
    </div>
  );
}
