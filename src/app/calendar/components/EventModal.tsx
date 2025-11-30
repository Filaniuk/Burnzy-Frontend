"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { IdeaStatus } from "@/types/calendar";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

interface EventModalProps {
  close: () => void;
  ideaId: number | null;
  reload: () => void;
}

interface IdeaResponse {
  id: number;
  uuid: string;
  title: string;
  status: IdeaStatus;
  scheduled_for: string | null;
}

const statusLabelMap: Record<IdeaStatus, string> = {
  unassigned: "Unassigned",
  to_film: "To film",
  to_publish: "To publish",
  published: "Published",
  archived: "Archived",
};

export default function EventModal({ close, ideaId, reload }: EventModalProps) {
  const [idea, setIdea] = useState<IdeaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<IdeaStatus>("to_publish");
  const [saving, setSaving] = useState(false);

  // NEW: Error modal state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!ideaId) return;

    setLoading(true);
    apiFetch(`/api/v1/ideas/${ideaId}`)
      .then((res) => {
        const data = res.data as IdeaResponse;
        setIdea(data);
        setNewStatus(data.status);
      })
      .catch((err: any) => {
        setErrorMsg(err?.message || "Failed to load idea.");
        setShowError(true);
      })
      .finally(() => setLoading(false));
  }, [ideaId]);

  // Show error modal *instead of crashing*
  if (showError) {
    return (
      <ConfirmModal
        show={true}
        title="Error Loading Idea"
        description={errorMsg || "Something went wrong."}
        confirmText="Close"
        confirmColor="red"
        onConfirm={() => {
          setShowError(false);
          close();
        }}
        onCancel={() => {
          setShowError(false);
          close();
        }}
      />
    );
  }

  if (!ideaId || loading || !idea) return null;

  async function saveStatus() {
    setSaving(true);
    try {
      await apiFetch("/api/v1/ideas/update_status", {
        method: "POST",
        body: JSON.stringify({
          idea_id: ideaId,
          status: newStatus,
        }),
      });

      await reload();
      close();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update status.");
      setShowError(true);
    } finally {
      setSaving(false);
    }
  }

  const statusDotColor =
    idea.status === "to_publish"
      ? "#00F5A0"
      : idea.status === "to_film"
      ? "#6C63FF"
      : idea.status === "published"
      ? "#FFFFFF"
      : "rgba(255,255,255,0.5)";

  const statusOptions: IdeaStatus[] = [
    "to_film",
    "to_publish",
    "published",
    "archived",
    "unassigned",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="animate-pop-in w-full max-w-sm rounded-xl border border-[#2E2D39] bg-[#1B1A24] p-6 shadow-2xl shadow-black/60">
        <h2 className="mb-2 text-xl font-semibold">📅 Scheduled Idea</h2>

        <p className="mb-1 text-sm text-neutral-400">Idea</p>
        <p className="mb-3 font-medium text-white">{idea.title}</p>

        <p className="mb-1 text-sm text-neutral-400">Date</p>
        <p className="mb-3 text-sm text-neutral-200">
          {idea.scheduled_for ?? "Not scheduled"}
        </p>

        <p className="mb-1 text-sm text-neutral-400">Current Status</p>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#181624] px-3 py-1 text-xs text-neutral-200">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: statusDotColor }}
          />
          <span>{statusLabelMap[idea.status]}</span>
        </div>

        {/* STATUS SELECT */}
        <div className="mb-4">
          <label className="mb-1 block text-xs text-neutral-400">
            Change status
          </label>
          <select
            className="w-full rounded-md bg-[#181624] px-3 py-2 text-xs text-neutral-100 outline-none ring-1 ring-[#2E2D39]"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as IdeaStatus)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {statusLabelMap[s]}
              </option>
            ))}
          </select>
        </div>

        {/* SAVE STATUS */}
        <button
          onClick={saveStatus}
          disabled={saving}
          className="mb-3 w-full rounded-lg bg-[#00F5A0] py-2 text-sm font-semibold text-[#0F0E17] transition hover:bg-[#00f7b0] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Status"}
        </button>

        <button
          onClick={close}
          className="mt-2 w-full py-2 text-sm text-neutral-400 transition hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
