"use client";

import { apiFetch } from "@/lib/api";
import { useState } from "react";

export default function ScheduleModal({ close, date, ideaId, reload }) {
  const [type, setType] = useState("publish");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);

    await apiFetch("/api/v1/calendar/schedule", {
      method: "POST",
      body: JSON.stringify({
        idea_id: Number(ideaId),
        filming_date: type === "filming" ? date : null,
        publish_date: type === "publish" ? date : null
      })
    });

    reload();
    close();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1B1A24] p-6 rounded-xl w-80 border border-[#2E2D39]">
        <h3 className="text-lg font-semibold mb-4">Schedule Idea</h3>

        <p className="text-sm text-neutral-400 mb-3">
          Date: <span className="text-white">{date}</span>
        </p>

        <div className="space-y-2 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={type === "filming"}
              onChange={() => setType("filming")}
            />
            Filming date (yellow)
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={type === "publish"}
              onChange={() => setType("publish")}
            />
            Publish date (green)
          </label>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-2 bg-[#6C63FF] rounded-lg hover:bg-[#7C75FF]"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          onClick={close}
          className="w-full mt-2 py-2 text-neutral-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
