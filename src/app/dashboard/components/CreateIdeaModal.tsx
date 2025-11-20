"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { apiFetch } from "@/lib/api";

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
  const [scheduledFor, setScheduledFor] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title.trim()) return alert("Title is required!");

    setLoading(true);

    try {
      await apiFetch("/api/v1/ideas/create_manual", {
        method: "POST",
        body: JSON.stringify({
          title,
          status,
          scheduled_for: scheduledFor || null,
          channel_tag: tag,
          version,
        })
      });


      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create idea");
    } finally {
      setLoading(false);
    }
  };

  return (
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
                  className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 text-white outline-none focus:border-[#6C63FF]"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter idea title"
                />
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

              {/* Date */}
              <div>
                <label className="text-neutral-400 text-sm mb-1 block">
                  Schedule for (optional)
                </label>
                <input
                  type="date"
                  className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 text-white focus:border-[#6C63FF]"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <PurpleActionButton label="Cancel" size="md" onClick={onClose} />
              <GradientActionButton
                label={loading ? "Saving..." : "Create Idea"}
                size="md"
                onClick={submit}
                disabled={loading}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
