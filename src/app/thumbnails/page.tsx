"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import ConfirmModal from "@/app/pricing/components/ConfirmModal";
import { apiFetch } from "@/lib/api";
import { extractApiError } from "@/lib/errors";

import ThumbnailsHero from "./components/ThumbnailsHero";
import ThumbnailGenerateCard from "./components/ThumbnailGenerateCard";
import ThumbnailsGrid from "./components/ThumbnailsGrid";
import LoadingThumbnails from "./components/LoadingThumbnails";

import type { GeneratedThumbnail } from "@/types/thumbnail";
import { useAuth } from "@/context/AuthContext";
import Unauthorized from "@/components/Unauthorized";

type ThumbnailsResponse = {
  status: string;
  message?: string;
  data: GeneratedThumbnail[];
  meta?: any;
};

type IdeaSummary = {
  uuid: string;
  title: string;
  thumbnail_concept?: string | null;
  thumbnail_variations?: string[] | null;
  status?: string;
  trend_idea_id?: number | null;
  channel_name?: string | null;
  created_at?: string | null;
};

export default function ThumbnailsPage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<GeneratedThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "red" | "yellow" | "green",
  });

  const openModal = useCallback(
    (title: string, description: string, color: "red" | "yellow" | "green" = "red") => {
      setModal({ show: true, title, description, color });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModal((m) => ({ ...m, show: false }));
  }, []);

  const fetchThumbnails = useCallback(async () => {
    // Only run when logged in
    if (!user) return;

    try {
      setLoading(true);
      const res = await apiFetch<ThumbnailsResponse>("/api/v1/thumbnails?limit=90&offset=0");
      setItems(res.data || []);
    } catch (err: any) {
      openModal("Failed to load thumbnails", extractApiError(err), "red");
    } finally {
      setLoading(false);
    }
  }, [user, openModal]);

  const fetchIdeas = useCallback(async () => {
    // Only run when logged in
    if (!user) return;

    try {
      setIdeasLoading(true);
      const res = await apiFetch<any>("/api/v1/trend_ideas/latest_full", { method: "GET" });
      setIdeas(res.data.ideas || []);
    } catch (err: any) {
      openModal("Failed to load thumbnails", extractApiError(err), "red");
    } finally {
      setIdeasLoading(false);
    }
  }, [user, openModal]);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchThumbnails();
    fetchIdeas();
  }, [authLoading, user, fetchThumbnails, fetchIdeas]);

  async function onGenerate(
    idea: IdeaSummary,
    opts?: { activeIdx?: number; thumbnailConcept?: string | null }
  ) {
    if (!user) return; // extra safety
    if (!idea?.uuid) return;

    const activeIdx = typeof opts?.activeIdx === "number" ? opts.activeIdx : null;
    const thumbnailConcept = (opts?.thumbnailConcept || "").trim() || null;

    try {
      setGenerating(true);

      await apiFetch(`/api/v1/generate_thumbnail/${idea.uuid}`, {
        method: "POST",
        body: JSON.stringify({
          trend_id: idea.trend_idea_id ?? null,
          active_idx: activeIdx,
          thumbnail_concept: thumbnailConcept,
        }),
      });

      await fetchThumbnails();
    } catch (err: any) {
      openModal("Thumbnail generation failed", extractApiError(err), "red");
    } finally {
      setGenerating(false);
    }
  }

  if (authLoading) return null;

  if (!user) {
    return <Unauthorized title="Login Required" description="Login is required to access this page." />;
  }

  return (
    <>
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-6"
      >
        <ThumbnailsHero />

        <ThumbnailGenerateCard
          onGenerate={onGenerate}
          loading={generating}
          ideas={ideas}
          ideasLoading={ideasLoading}
        />

        {loading ? <LoadingThumbnails /> : <ThumbnailsGrid items={items} onMutate={fetchThumbnails} />}
      </motion.main>

      <ConfirmModal
        show={modal.show}
        title={modal.title}
        description={modal.description}
        onCancel={closeModal}
        onConfirm={closeModal}
        confirmText="OK"
        confirmColor={modal.color}
      />
    </>
  );
}
