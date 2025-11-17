"use client";

import { useState, useEffect } from "react";
import { GradientActionButton } from "@/components/GradientActionButton";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  activeItem: any;
  uploadsPerWeek: number;
  setUploadsPerWeek: (n: number) => void;
  weeks: number;
  setWeeks: (n: number) => void;
  generating: boolean;
  setActiveItem: (v: any) => void;
  handleGeneratePlanRedirect: (tag: string, version: number) => void;
}

export default function PlanModal({
  activeItem,
  uploadsPerWeek,
  setUploadsPerWeek,
  weeks,
  setWeeks,
  generating,
  setActiveItem,
  handleGeneratePlanRedirect,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const totalVideos = uploadsPerWeek * weeks;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveItem(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setActiveItem]);

  const handleSubmit = () => {
    setError(null);

    if (uploadsPerWeek < 1 || uploadsPerWeek > 7) {
      setError("Uploads per week must be between 1 and 7");
      return;
    }

    if (weeks < 1 || weeks > 4) {
      setError("Weeks to plan must be between 1 and 4");
      return;
    }

    handleGeneratePlanRedirect(activeItem.channel_tag, activeItem.version);
  };

  return (
    <AnimatePresence>
      {activeItem && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md bg-[#1B1A24] border border-[#2E2D39] rounded-2xl shadow-2xl p-6 sm:p-8 text-white"
          >
            {/* Header */}
            <h3 className="text-lg sm:text-xl font-semibold text-center mb-6">
              Generate Content Plan for{" "}
              <span className="text-[#00F5A0] block sm:inline">
                {activeItem.channel_name || activeItem.channel_tag}
              </span>
            </h3>

            {/* Inputs */}
            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Uploads per week <span className="text-neutral-500">(1–7)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={uploadsPerWeek}
                  onChange={(e) => setUploadsPerWeek(Number(e.target.value))}
                  className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Weeks to plan <span className="text-neutral-500">(1–4)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={weeks}
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#6C63FF] transition"
                />
              </div>

              <motion.p
                key={totalVideos}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-neutral-400 mt-2"
              >
                🎬 You’ll generate{" "}
                <span className="text-[#00F5A0] font-semibold">{totalVideos}</span>{" "}
                videos total
              </motion.p>
            </div>

            {/* Error message */}
            {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-lg bg-[#2E2D39] text-neutral-300 hover:bg-[#3B3A4A] transition text-sm font-medium"
              >
                Cancel
              </button>

              <GradientActionButton
                onClick={handleSubmit}
                label={generating ? "Generating..." : "Generate Plan"}
                size="md"
                disabled={generating}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
