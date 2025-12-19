"use client";

import { motion } from "framer-motion";

import { formatNumberCompact } from "@/lib/format";

type Props = {
  probeVideos: any;
};

function toYouTubeHref(id?: string | null) {
  if (!id) return undefined;
  return `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
}

export default function NicheProbeVideosCard({ probeVideos }: Props) {
  const rows = Array.isArray(probeVideos) ? probeVideos : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#151326] to-[#0F0E17] p-6 shadow-lg"
    >
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#6C63FF] via-[#00F5A0] to-[#6C63FF] opacity-80" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Probe Videos</h3>
          <p className="mt-1 text-sm text-gray-300">
            The sample behind the score. Useful for validating relevance.
          </p>
        </div>
        <div className="text-xs text-gray-400">{rows.length} videos</div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
          No videos returned in the probe window.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-300">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((v) => {
                const href = toYouTubeHref(v.video_id);
                return (
                  <tr key={v.video_id ?? `${v.title}-${v.published_at}`} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-white hover:text-[#00F5A0]"
                        >
                          {v.title}
                        </a>
                      ) : (
                        <span className="font-semibold text-white">{v.title}</span>
                      )}
                      {v.video_id && (
                        <div className="mt-1 text-xs text-gray-400">{v.video_id}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-200">{v.channel}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {formatNumberCompact(v.view_count || 0)}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{v.published_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
