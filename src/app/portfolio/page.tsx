"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import PortfolioSection from "../portfolio/components/PortfolioSection";
import dynamic from "next/dynamic";

// Lazy load modal for performance (only when opened)
const PlanModal = dynamic(() => import("../portfolio/components/PlanModal"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 text-neutral-300 text-sm">
      Opening planner...
    </div>
  ),
});

interface PortfolioItem {
  id: number;
  tag: string;
  new_channel: boolean;
  channel_name?: string;
  version: number;
  created_at: string;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);
  const [uploadsPerWeek, setUploadsPerWeek] = useState(2);
  const [weeks, setWeeks] = useState(3);
  const [generating, setGenerating] = useState(false);

  const router = useRouter();

  // --- Fetch portfolio ---
  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await apiFetch<{ data: PortfolioItem[] }>("/api/v1/user/portfolio");
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch portfolio:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // --- Handle plan redirect ---
  const handleGeneratePlanRedirect = (tag: string, version: number) => {
    setGenerating(true);
    const url = `/plan/${encodeURIComponent(tag)}/${version}?weeks=${weeks}&uploads=${uploadsPerWeek}`;
    router.push(url);
  };

  // --- Loading state ---
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0E17] text-neutral-400 text-lg animate-pulse">
        Loading your portfolio...
      </div>
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
    <main className="min-h-screen bg-[#0F0E17] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
            My Portfolio
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            Your analyzed channels and topic research history.
          </p>
        </header>

        {/* Channel Section */}
        {channels.length > 0 && (
          <PortfolioSection
            title="🌎 Analyzed Channels"
            color="#00F5A0"
            items={channels}
            onSelectPlan={setActiveItem}
            router={router}
          />
        )}

        {/* Topic Section */}
        {topics.length > 0 && (
          <PortfolioSection
            title="💡 Analyzed Topics"
            color="#6C63FF"
            items={topics}
            onSelectPlan={setActiveItem}
            router={router}
          />
        )}
      </div>

      {/* Lazy-loaded Modal */}
      <Suspense>
        {activeItem && (
          <PlanModal
            activeItem={activeItem}
            uploadsPerWeek={uploadsPerWeek}
            setUploadsPerWeek={setUploadsPerWeek}
            weeks={weeks}
            setWeeks={setWeeks}
            generating={generating}
            setActiveItem={setActiveItem}
            handleGeneratePlanRedirect={handleGeneratePlanRedirect}
          />
        )}
      </Suspense>
    </main>
  );
}
