"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ConfirmModalProps {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
  title: string;
  description: string;
  loading?: boolean;
  confirmColor?: "red" | "yellow" | "green";
}

export default function ConfirmModal({
  show,
  onCancel,
  onConfirm,
  confirmText,
  title,
  description,
  loading = false,
  confirmColor = "green",
}: ConfirmModalProps) {
  // ESC key to close modal
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onCancel]);

  const colorClass =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-400"
      : confirmColor === "yellow"
      ? "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-300"
      : "bg-green-600 hover:bg-green-700 focus:ring-green-400";

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-[#1B1A24] p-6 sm:p-8 rounded-2xl border border-[#2E2D39] w-full max-w-md shadow-2xl text-center"
          >
            {/* Title */}
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white">
              {title}
            </h3>

            {/* Description */}
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed mb-6">
              {description}
            </p>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-[#2E2D39] text-neutral-300 hover:bg-[#3B3A4A] transition focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2.5 rounded-lg ${colorClass} text-white font-medium transition focus:outline-none focus:ring-2 disabled:opacity-60`}
              >
                {loading ? "Processing..." : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
