"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  tag: string;
  version: number;
}

const STATUS_OPTIONS = [
  { value: "unassigned", label: "Unassigned" },
  { value: "to_film", label: "To Film" },
  { value: "to_publish", label: "To Publish" },
];

export default function CreateIdeaModal({
  open,
  onClose,
  onCreated,
  tag,
  version,
}: Props) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("unassigned");

  // NOW REQUIRED
  const [scheduledFor, setScheduledFor] = useState("");

  const [titleError, setTitleError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const dateRef = useRef<HTMLInputElement | null>(null);

  // ConfirmModal state
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("An error occurred.");

  // ---------------------------
  // VALIDATION
  // ---------------------------
  const validateTitle = () => {
    if (!title.trim()) {
      setTitleError("Title is required.");
      return false;
    }
    setTitleError(null);
    return true;
  };

  const validateDate = () => {
    // REQUIRED now
    if (!scheduledFor) {
      setDateError("Date is required.");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(scheduledFor);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      setDateError("Date cannot be in the past.");
      return false;
    }

    setDateError(null);
    return true;
  };

  useEffect(() => {
    // Live-validate once user interacts
    if (scheduledFor) validateDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduledFor]);

  const normalizeError = (err: any): string => {
    if (!err) return "Unknown error.";
    return err.detail || err.message || "Unexpected error.";
  };

  // ---------------------------
  // SUBMIT
  // ---------------------------
  const submit = async () => {
    const validTitle = validateTitle();
    const validDate = validateDate();
    if (!validTitle || !validDate) return;

    setLoading(true);

    try {
      await apiFetch("/api/v1/ideas/create_manual", {
        method: "POST",
        body: JSON.stringify({
          title,
          status,
          // now always set (never null)
          scheduled_for: scheduledFor,
          channel_tag: tag,
          version,
        }),
      });

      onCreated();
      onClose();
    } catch (rawErr: any) {
      console.error("Create idea error:", rawErr);
      setErrorMessage(normalizeError(rawErr));
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const isFormInvalid =
    !title.trim() ||
    !scheduledFor ||
    titleError !== null ||
    dateError !== null;

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#1B1A24] border border-[#2E2D39] rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <h2 className="text-xl font-bold text-white text-center mb-6">
                Create New Idea
              </h2>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-neutral-400 text-sm mb-1 block">
                    Title *
                  </label>
                  <input
                    className={`w-full bg-[#14131C] border rounded-lg px-3 py-2 text-white outline-none focus:border-[#6C63FF] ${
                      titleError ? "border-red-500" : "border-[#2E2D39]"
                    }`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={validateTitle}
                    placeholder="Enter idea title"
                  />
                  {titleError && (
                    <span className="text-red-400 text-xs mt-1 block">
                      {titleError}
                    </span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="text-neutral-400 text-sm mb-1 block">
                    Status
                  </label>
                  <select
                    className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 text-white focus:border-[#6C63FF]"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date (REQUIRED) */}
                <div>
                  <label className="text-neutral-400 text-sm mb-1 block">
                    Schedule for *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      ref={(el) => {
                        dateRef.current = el;
                      }}
                      className={`w-full bg-[#14131C] border rounded-lg px-3 py-2 pr-10 text-white focus:border-[#6C63FF] ${
                        dateError ? "border-red-500" : "border-[#2E2D39]"
                      }`}
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      onBlur={validateDate}
                      required
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-white"
                      onClick={() => dateRef.current?.showPicker?.()}
                      aria-label="Pick a date"
                    >
                      📅
                    </button>
                  </div>

                  {dateError && (
                    <span className="text-red-400 text-xs mt-1 block">
                      {dateError}
                    </span>
                  )}

                  <style jsx>{`
                    input[type="date"]::-webkit-calendar-picker-indicator {
                      opacity: 0;
                      display: none;
                    }
                    input[type="date"] {
                      color-scheme: dark;
                    }
                  `}</style>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <PurpleActionButton label="Cancel" size="md" onClick={onClose} />
                <GradientActionButton
                  label={loading ? "Saving..." : "Create Idea"}
                  size="md"
                  onClick={submit}
                  disabled={loading || isFormInvalid}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR MODAL */}
      <ConfirmModal
        show={errorOpen}
        title="Create Idea Error"
        description={errorMessage}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setErrorOpen(false)}
        onCancel={() => setErrorOpen(false)}
      />
    </>
  );
}
