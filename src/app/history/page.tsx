"use client";

import LoadingAnalysis from "@/components/LoadingAnalysis";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import HistorySection from "./components/HistorySection";

interface HistoryItem {
  id: number;
  tag: string;
  new_channel: boolean;
  channel_name?: string;
  version: number;
  created_at: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadsPerWeek, setUploadsPerWeek] = useState(2);
  const [weeks, setWeeks] = useState(3);
  const [generating, setGenerating] = useState(false);
  const loadedRef = useRef(false);

  const router = useRouter();

  // --- Fetch history ---
  const fetchHistory = useCallback(async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    setLoading(true);

    try {
      const res = await apiFetch<{ data: HistoryItem[] }>(
        "/api/v1/user/portfolio"
      );

      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  // --- Loading state ---
  if (loading)
    return (
      <div><LoadingAnalysis message="Loading your history" /></div>
    );

  // --- Empty state ---
  if (!items.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E17] text-center px-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent mb-4">
          No analyses yet
        </h1>
        <p className="text-neutral-400 max-w-md mb-8">
          You haven’t analyzed any channels or topics yet. Start by analyzing one to see it here!
        </p>
        <button
          onClick={() => router.push("/analyze")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] text-black font-semibold hover:opacity-90 transition"
        >
          🚀 Start Analyzing
        </button>
      </div>
    );

  // --- Separate data ---
  const channels = items.filter((i) => !i.new_channel);
  const topics = items.filter((i) => i.new_channel);

  // --- Render ---
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <main className="min-h-screen bg-[#0F0E17] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <header className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
              Analysis History
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base">
              Your analyzed channels and topic research history.
            </p>
          </header>

          {/* Channel Section */}
          {channels.length > 0 && (
            <HistorySection
              title="🌎 Analyzed Channels"
              color="#00F5A0"
              items={channels}
              router={router}
            />
          )}

          {/* Topic Section */}
          {topics.length > 0 && (
            <HistorySection
              title="💡 Analyzed Topics"
              color="#6C63FF"
              items={topics}
              router={router}
            />
          )}
        </div>
      </main>
    </motion.div>
  );
}
