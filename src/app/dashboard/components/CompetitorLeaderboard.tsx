// src/app/dashboard/components/CompetitorLeaderboard.tsx
"use client";

interface Competitor {
  id: number;
  tag: string;
  channel_name: string;
  channel_id: string;
  subscribers: number | null;
  avg_views: number | null;
  upload_frequency: number | null;
  engagement_rate: number | null;
  last_analysis_at: string | null;
}

export default function CompetitorLeaderboard({
  competitors,
}: {
  competitors: Competitor[];
}) {
  if (!competitors.length) return null;

  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#1F1E29] text-neutral-400">
          <tr>
            <th className="text-left px-4 py-2">Competitor</th>
            <th className="text-right px-4 py-2">Subs</th>
            <th className="text-right px-4 py-2">Avg Views</th>
            <th className="text-right px-4 py-2">Uploads / week</th>
            <th className="text-right px-4 py-2">Engagement</th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c) => (
            <tr
              key={c.id}
              className="border-t border-[#2E2D39] hover:bg-[#1D1C27]"
            >
              <td className="px-4 py-2">
                <div className="flex flex-col">
                  <span className="font-medium">
                    {c.channel_name || c.tag}
                  </span>
                  <span className="text-xs text-neutral-500">
                    {c.tag}
                  </span>
                </div>
              </td>
              <td className="px-4 py-2 text-right text-neutral-200">
                {c.subscribers != null
                  ? c.subscribers.toLocaleString()
                  : "—"}
              </td>
              <td className="px-4 py-2 text-right text-neutral-200">
                {c.avg_views != null ? c.avg_views.toLocaleString() : "—"}
              </td>
              <td className="px-4 py-2 text-right text-neutral-200">
                {c.upload_frequency != null
                  ? c.upload_frequency.toFixed(1)
                  : "—"}
              </td>
              <td className="px-4 py-2 text-right text-neutral-200">
                {c.engagement_rate != null
                  ? `${c.engagement_rate.toFixed(2)}%`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-neutral-500 px-4 py-2">
        Metrics based on your last analysis for each competitor.
      </p>
    </div>
  );
}
