"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientActionButton } from "@/components/GradientActionButton";
import { useRouter } from "next/navigation";

export default function DashboardPlanModal({ channel, onClose }) {
  const router = useRouter();

  const [uploadsPerWeek, setUploadsPerWeek] = useState(2);
  const [weeks, setWeeks] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const totalVideos = uploadsPerWeek * weeks;

  // Close modal on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleGenerate = () => {
    if (uploadsPerWeek < 1 || uploadsPerWeek > 7) {
      setError("Uploads per week must be 1–7");
      return;
    }
    if (weeks < 1 || weeks > 4) {
      setError("Weeks must be 1–4");
      return;
    }

    setGenerating(true);

    router.push(
      `/plan/${encodeURIComponent(channel.tag)}/${channel.version}?weeks=${weeks}&uploads=${uploadsPerWeek}`
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-[#1B1A24] border border-[#2E2D39] rounded-2xl p-6 text-white shadow-xl"
        >
          <h2 className="text-xl font-semibold text-center mb-6">
            Generate Content Plan for{" "}
            <span className="text-[#00F5A0]">{channel.channel_name}</span>
          </h2>

          {/* Upload per week */}
          <div className="mb-4">
            <label className="text-sm text-neutral-400">Uploads per week</label>
            <input
              type="number"
              min={1}
              max={7}
              value={uploadsPerWeek}
              onChange={(e) => setUploadsPerWeek(Number(e.target.value))}
              className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* Weeks */}
          <div className="mb-4">
            <label className="text-sm text-neutral-400">Weeks to plan</label>
            <input
              type="number"
              min={1}
              max={4}
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 mt-1"
            />
          </div>

          <p className="text-center text-neutral-400 text-sm mb-4">
            🎬 Total videos:{" "}
            <span className="text-[#00F5A0] font-bold">{totalVideos}</span>
          </p>

          {error && (
            <p className="text-red-400 text-center text-sm mb-3">{error}</p>
          )}

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2E2D39] rounded-lg hover:bg-[#3B3A4A]"
            >
              Cancel
            </button>

            <GradientActionButton
              onClick={handleGenerate}
              label={generating ? "Generating..." : "Generate Plan"}
              size="md"
              disabled={generating}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
