"use client";

import { useState, useEffect, useRef } from "react";
import { GradientActionButton } from "@/components/GradientActionButton";
import { useRouter } from "next/navigation";

interface DashboardPlanModalProps {
  channel: any;
  onClose: () => void;
  open: boolean;
}

export default function DashboardPlanModal({
  channel,
  onClose,
  open,
}: DashboardPlanModalProps) {
  const router = useRouter();

  const [uploadsPerWeek, setUploadsPerWeek] = useState(2);
  const [weeks, setWeeks] = useState(3);

  // REQUIRED
  const [startDate, setStartDate] = useState<string>("");

  const [generating, setGenerating] = useState(false);

  // Separate errors (CreateIdeaModal style)
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const dateRef = useRef<HTMLInputElement | null>(null);

  const totalVideos = uploadsPerWeek * weeks;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // ---------------------------
  // VALIDATION (start date required)
  // ---------------------------
  const validateStartDate = () => {
    if (!startDate) {
      setStartDateError("Start date is required.");
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selected = new Date(startDate);
    selected.setHours(0, 0, 0, 0);

    if (selected < today) {
      setStartDateError("Start date cannot be in the past.");
      return false;
    }

    setStartDateError(null);
    return true;
  };

  useEffect(() => {
    // live validate once user starts interacting
    if (startDate) validateStartDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  const handleGenerate = () => {
    setFormError(null);

    if (uploadsPerWeek < 1 || uploadsPerWeek > 7) {
      setFormError("Uploads per week must be 1–7.");
      return;
    }
    if (weeks < 1 || weeks > 4) {
      setFormError("Weeks must be 1–8.");
      return;
    }
    if (!validateStartDate()) return;

    setGenerating(true);

    const params = new URLSearchParams();
    params.set("weeks", String(weeks));
    params.set("uploads", String(uploadsPerWeek));
    params.set("start_date", startDate); // mandatory

    router.push(
      `/plan/${encodeURIComponent(channel.tag)}/${channel.version}?${params.toString()}`
    );
  };

  const isFormInvalid =
    generating ||
    uploadsPerWeek < 1 ||
    uploadsPerWeek > 7 ||
    weeks < 1 ||
    weeks > 8 ||
    !startDate ||
    startDateError !== null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1B1A24] border border-[#2E2D39] rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-md font-semibold text-center mb-6">
          Content Plan for{" "}
          <span className="text-[#00F5A0]">{channel.channel_name}</span>
        </h2>

        {/* Uploads per week */}
        <div className="mb-4">
          <label className="text-sm text-neutral-400">Uploads per week</label>
          <input
            type="number"
            min={1}
            max={7}
            value={uploadsPerWeek}
            onChange={(e) => setUploadsPerWeek(Number(e.target.value))}
            className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 mt-1 text-white outline-none focus:border-[#6C63FF]"
          />
        </div>

        {/* Weeks */}
        <div className="mb-4">
          <label className="text-sm text-neutral-400">Weeks to plan</label>
          <input
            type="number"
            min={1}
            max={8}
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="w-full bg-[#14131C] border border-[#2E2D39] rounded-lg px-3 py-2 mt-1 text-white outline-none focus:border-[#6C63FF]"
          />
        </div>

        {/* Start date (REQUIRED) */}
        <div className="mb-4">
          <label className="text-neutral-400 text-sm mb-1 block">
            Start date *
          </label>

          <div className="relative">
            <input
              type="date"
              ref={(el) => {
                dateRef.current = el;
              }}
              className={`w-full bg-[#14131C] border rounded-lg px-3 py-2 pr-10 text-white outline-none focus:border-[#6C63FF] ${
                startDateError ? "border-red-500" : "border-[#2E2D39]"
              }`}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onBlur={validateStartDate}
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

          {startDateError && (
            <span className="text-red-400 text-xs mt-1 block">
              {startDateError}
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

        <p className="text-center text-neutral-400 text-sm mb-4">
          🎬 Total videos:{" "}
          <span className="text-[#00F5A0] font-bold">{totalVideos}</span>
        </p>

        {formError && (
          <p className="text-red-400 text-center text-sm mb-3">{formError}</p>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2E2D39] rounded-lg hover:bg-[#3B3A4A]"
            disabled={generating}
          >
            Cancel
          </button>

          <GradientActionButton
            onClick={handleGenerate}
            label={generating ? "Generating..." : "Generate Plan"}
            size="md"
            disabled={isFormInvalid}
          />
        </div>
      </div>
    </div>
  );
}
