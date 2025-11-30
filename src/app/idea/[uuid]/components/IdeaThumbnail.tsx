"use client";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";

type GenerateThumbnailResponse = { data: { image_url: string } };

export default function IdeaThumbnail({ v, ideaUuid }: any) {
  const [thumbLoading, setThumbLoading] = useState(false);
  const [newThumbnail, setNewThumbnail] = useState<string | null>(null);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "red" | "yellow" | "green",
  });

  const baseImageUrl = v.mocked_thumbnail_url
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/mocked-thumbnails/${v.mocked_thumbnail_url}`
    : null;

  const finalThumb = newThumbnail || baseImageUrl;

  async function handleGenerateThumbnail() {
    try {
      setThumbLoading(true);

      const res = (await apiFetch(`/api/v1/generate_thumbnail/${ideaUuid}`, {
        method: "POST",
      })) as GenerateThumbnailResponse;

      // Preload image for smooth transition
      const img = new Image();
      img.src = res.data.image_url;
      await img.decode();

      setNewThumbnail(res.data.image_url);
    } catch (err: any) {
      setModal({
        show: true,
        title: "Thumbnail Generation Failed",
        description:
          err?.detail ||
          err?.message ||
          "Something went wrong while generating the thumbnail.",
        color: "red",
      });
    } finally {
      setThumbLoading(false);
    }
  }

  return (
    <>
      <section className="flex flex-col items-center gap-4">
        {/* Thumbnail Container */}
        <div className="relative w-full max-w-2xl rounded-xl overflow-hidden border border-[#2E2D39] shadow-lg">
          {finalThumb ? (
            <img
              src={finalThumb}
              alt="Generated thumbnail"
              className={`w-full object-cover transition-all duration-500 ${
                thumbLoading ? "opacity-70 blur-md" : ""
              } ${
                !newThumbnail && baseImageUrl
                  ? "blur-md brightness-75 scale-[1.02]"
                  : "blur-0"
              }`}
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-[#1B1A24] text-neutral-500">
              No thumbnail available
            </div>
          )}
        </div>

        {/* Thumbnail Notes */}
        {v.thumbnail_notes && (
          <div className="max-w-2xl text-neutral-300 text-sm bg-[#1B1A24]/60 p-4 rounded-xl border border-[#2E2D39]">
            <strong className="text-[#6C63FF]">🖼️ Thumbnail Notes:</strong>{" "}
            {v.thumbnail_notes}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerateThumbnail}
          disabled={thumbLoading}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] text-black font-semibold hover:opacity-90 transition disabled:opacity-60"
        >
          <RefreshCw size={18} className={thumbLoading ? "animate-spin" : ""} />
          {thumbLoading ? "Generating..." : "Generate Thumbnail Idea"}
        </button>
      </section>

      {/* Error Modal */}
      <ConfirmModal
        show={modal.show}
        onCancel={() => setModal({ ...modal, show: false })}
        onConfirm={() => setModal({ ...modal, show: false })}
        confirmText="OK"
        title={modal.title}
        description={modal.description}
        confirmColor={modal.color}
      />
    </>
  );
}
