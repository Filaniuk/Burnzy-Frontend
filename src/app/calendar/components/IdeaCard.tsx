"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

export default function IdeaCard({
  idea,
  tag,
  version,
  dragOverlay = false,
  onDelete,
}: {
  idea: any;
  tag: string | null;
  version: number | null;
  dragOverlay?: boolean;
  onDelete?: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  // NEW — Error modal state
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("Something went wrong while deleting this idea.");

  async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();

    if (deleting) return;
    setDeleting(true);

    try {
      await apiFetch<any>("/api/v1/ideas/delete", {
        method: "POST",
        body: JSON.stringify({ idea_id: idea.id }),
      });

      onDelete?.(idea.id);
    } catch (err: any) {
      console.error("Delete failed", err);
      setErrorMsg(err?.message || "Failed to delete idea.");
      setShowError(true);
    } finally {
      setDeleting(false);
    }
  }

  const openIdea = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const url = `/idea/${idea.uuid}${`?trend_id=${idea.trend_id}`}${
      tag ? `&tag=${encodeURIComponent(tag)}${version ? `&version=${version}` : ""}` : ""
    }`;
    window.open(url, "_blank");
  };

  return (
    <>
      <div
        className={`
          relative rounded-xl px-3 py-3 text-sm 
          bg-[#1B1A24] border border-[#2E2D39] shadow-sm 
          transition-transform duration-150
          ${dragOverlay ? "scale-[1.05] opacity-95" : ""}
        `}
      >
        {/* Buttons in top-right */}
        <div className="absolute top-2 right-2 flex gap-1 z-20 pointer-events-auto">
          {/* Open idea button */}
          {!idea.is_manual && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={openIdea}
              className="p-1 bg-[#2E2D39] hover:bg-[#3E3D4A] rounded-md text-neutral-300 hover:text-white transition"
            >
              <ExternalLink size={14} />
            </button>
          )}

          {/* Delete button */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={handleDelete}
            disabled={deleting}
            className="p-1 bg-[#2E2D39] hover:bg-red-600/70 rounded-md text-red-300 hover:text-white transition disabled:opacity-40"
          >
            <Trash2 size={14} className={deleting ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Title */}
        <p className="font-medium text-[0.9rem] text-white line-clamp-2 pr-7">
          {idea.title}
        </p>

        {/* Trend score */}
        {idea.trend_score != null && (
          <div className="mt-1 text-[0.7rem] text-neutral-500">
            Score <span className="text-[#00F5A0]">{idea.trend_score}/10</span>
          </div>
        )}
      </div>

      {/* Error Modal */}
      <ConfirmModal
        show={showError}
        title="Error"
        description={errorMsg}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setShowError(false)}
        onCancel={() => setShowError(false)}
      />
    </>
  );
}
