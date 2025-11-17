// app/calendar/components/UpcomingList.tsx
"use client";

import { BrandEvent } from "@/types/calendar";

interface UpcomingListProps {
  events: BrandEvent[];
}

export default function UpcomingList({ events }: UpcomingListProps) {
  // Filter out unassigned + archived
  const filtered = events.filter(
    (ev) =>
      ev.extendedProps.status !== "unassigned" &&
      ev.extendedProps.status !== "archived"
  );

  return (
    <div className="mt-6 rounded-xl border border-[#2A2835] bg-[#181624] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Upcoming
      </p>

      {filtered.length === 0 && (
        <p className="text-xs text-neutral-500">No upcoming events yet.</p>
      )}

      <div className="space-y-2">
        {filtered.map((ev) => (
          <div
            key={ev.id}
            className="flex items-center justify-between rounded-lg bg-[#1B1926] px-3 py-2 text-xs"
          >
            <div className="flex flex-col">
              <span className="line-clamp-1 text-[11px] text-neutral-200">
                {ev.title}
              </span>
              <span className="text-[10px] text-neutral-500">{ev.date}</span>
            </div>
            <div
              className="ml-2 h-2 w-2 rounded-full"
              style={{ background: ev.borderColor }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
