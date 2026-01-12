"use client";

import LoadingAnalysis from "@/components/LoadingAnalysis";
import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import HistorySection from "./components/HistorySection";
import Unauthorized from "@/components/Unauthorized";
import { useAuth } from "@/context/AuthContext";

// MATCHES BACKEND SHAPE EXACTLY
interface HistoryItem {
  channel_tag: string;
  channel_name?: string;
  new_channel: boolean;
  version: number;
  created_at: string;
  niche?: string;
  is_latest?: boolean;
  analysis_type: "channel" | "topic";
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Failed to load your history.");
  const loadedRef = useRef(false);
  const router = useRouter();

  if (!user) {
    return <Unauthorized title="Login Required" description="Login is required to access this page." />;
  }

  // --- Fetch history ---
  const fetchHistory = useCallback(async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    setLoading(true);

    try {
      const res = await apiFetch<{ data: HistoryItem[] }>("/api/v1/history");
      setItems(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch history:", err);
      setErrorMessage(err?.message || "Failed to load your history.");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // --- Loading ---
  if (loading)
    return (
      <div>
        <LoadingAnalysis message="Loading your history" />
      </div>
    );

  // --- If empty ---
  if (!items.length)
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E17] text-center px-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent mb-4">
            No analyses yet
          </h1>
          <p className="text-neutral-400 max-w-md mb-8">
            You haven’t analyzed any channels or topics yet. Start by analyzing one to see it
            here!
          </p>
          <button
            onClick={() => router.push("/analyze")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#00F5A0]
                       text-black font-semibold hover:opacity-90 transition"
          >
            🚀 Start Analyzing
          </button>
        </div>

        <ConfirmModal
          show={errorOpen}
          title="History Error"
          description={errorMessage}
          confirmText="OK"
          confirmColor="red"
          onConfirm={() => setErrorOpen(false)}
          onCancel={() => setErrorOpen(false)}
        />
      </>
    );

  // --- Partition data ---
  const channels = items.filter((i) => i.analysis_type === "channel");
  const topics = items.filter((i) => i.analysis_type === "topic");

  // --- Page ---
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <main className="min-h-screen bg-[#0F0E17] text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-16">
            <header className="text-center space-y-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
                Analysis History
              </h1>
              <p className="text-neutral-400 text-sm sm:text-base">
                Your analyzed channels and topic research history.
              </p>
            </header>

            {channels.length > 0 && (
              <HistorySection title="🌎 Analyzed Channels" color="#00F5A0" items={channels} router={router} />
            )}

            {topics.length > 0 && (
              <HistorySection title="💡 Analyzed Topics" color="#6C63FF" items={topics} router={router} />
            )}
          </div>
        </main>
      </motion.div>

      <ConfirmModal
        show={errorOpen}
        title="History Error"
        description={errorMessage}
        confirmText="OK"
        confirmColor="red"
        onConfirm={() => setErrorOpen(false)}
        onCancel={() => setErrorOpen(false)}
      />
    </>
  );
}
