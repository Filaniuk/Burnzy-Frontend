"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { IdeaStatus } from "@/types/calendar";

interface ScheduleModalProps {
  close: () => void;
  date: string | null;
  ideaId: number | null;
  reload: () => void;
}

// Allowed statuses for scheduling (NO unassigned)
const SCHEDULABLE_STATUSES: IdeaStatus[] = [
  "to_film",
  "to_publish",
  "published",
  "archived",
];

const statusLabelMap: Record<IdeaStatus, string> = {
  unassigned: "Unassigned",
  to_film: "To Film",
  to_publish: "To Publish",
  published: "Published",
  archived: "Archived",
};

export default function ScheduleModal({
  close,
  date,
  ideaId,
  reload,
}: ScheduleModalProps) {
  const [status, setStatus] = useState<IdeaStatus>("to_publish");
  const [loading, setLoading] = useState(false);

  if (!date || !ideaId) return null;

  async function submit() {
    setLoading(true);

    await apiFetch("/api/v1/calendar/schedule", {
      method: "POST",
      body: JSON.stringify({
        idea_id: Number(ideaId),
        date,
        status,
      }),
    });

    await reload();
    close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="animate-pop-in w-80 rounded-xl border border-[#2E2D39] bg-[#1B1A24] p-6 shadow-2xl shadow-black/70">
        <h3 className="mb-4 text-lg font-semibold">Schedule Idea</h3>

        <p className="mb-3 text-sm text-neutral-400">
          Date: <span className="text-white">{date}</span>
        </p>

        {/* Status Dropdown */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-neutral-400">
            Status
          </label>
          <select
            className="w-full rounded-md bg-[#181624] px-3 py-2 text-xs text-neutral-100 outline-none ring-1 ring-[#2E2D39]"
            value={status}
            onChange={(e) => setStatus(e.target.value as IdeaStatus)}
          >
            {SCHEDULABLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabelMap[s]}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-[#6C63FF] py-2 text-sm font-medium text-white transition hover:bg-[#7C75FF] disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={close}
          className="mt-2 w-full py-2 text-sm text-neutral-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
