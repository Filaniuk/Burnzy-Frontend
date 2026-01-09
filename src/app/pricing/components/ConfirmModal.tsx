"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { createPortal } from "react-dom";

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
  // ESC close
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onCancel]);

  if (!show) return null;

  const colorClass =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-700"
      : confirmColor === "yellow"
      ? "bg-yellow-500 hover:bg-yellow-600"
      : "bg-green-600 hover:bg-green-700";

  const modalContent = (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#1B1A24] p-6 sm:p-8 rounded-2xl border border-[#2E2D39] w-full max-w-md shadow-2xl text-center"
      >
        <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
        <p className="text-neutral-400 text-sm mb-6">{description}</p>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#2E2D39] text-neutral-300 hover:bg-[#3B3A4A]"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${colorClass}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
