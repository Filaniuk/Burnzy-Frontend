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

import type { GeneratedThumbnail, ThumbnailsListResponse } from "@/types/thumbnail";

type GenerateThumbnailResponse = {
  status: string;
  message: string;
  data: {
    thumbnail_url?: string;
    thumbnail_id?: string;
    version?: number;
    created_at?: string;
  };
};

export default function ThumbnailsPage() {
  const [items, setItems] = useState<GeneratedThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    description: "",
    color: "red" as "red" | "yellow" | "green",
  });

  const closeModal = () => setModal((m) => ({ ...m, show: false }));

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams();
      qs.set("limit", "60");
      qs.set("offset", "0");

      const res = (await apiFetch<ThumbnailsListResponse>(`/api/v1/thumbnails?${qs.toString()}`)) as any;
      setItems(res.data || []);
    } catch (err: any) {
      setModal({
        show: true,
        title: "Failed to Load Thumbnails",
        description: extractApiError(err),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const onGenerate = useCallback(
    async (ideaUuid: string) => {
      try {
        setGenerating(true);

        await apiFetch<GenerateThumbnailResponse>(`/api/v1/generate_thumbnail/${ideaUuid}`, {
          method: "POST",
        });

        await fetchList();

        setModal({
          show: true,
          title: "Thumbnail generated",
          description: "Your thumbnail was generated and stored successfully.",
          color: "green",
        });
      } catch (err: any) {
        setModal({
          show: true,
          title: "Thumbnail Generation Failed",
          description: extractApiError(err),
          color: "red",
        });
      } finally {
        setGenerating(false);
      }
    },
    [fetchList]
  );

  return (
    <>
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-6xl mx-auto px-4 md:px-6 py-10 space-y-6"
      >
        <ThumbnailsHero />

        <ThumbnailGenerateCard onGenerate={onGenerate} loading={generating} />

        {loading ? <LoadingThumbnails /> : <ThumbnailsGrid items={items} />}
      </motion.main>

      <ConfirmModal
        show={modal.show}
        title={modal.title}
        description={modal.description}
        onCancel={closeModal}
        onConfirm={closeModal}
        confirmColor={modal.color} confirmText={"Ok"}      />
    </>
  );
}
