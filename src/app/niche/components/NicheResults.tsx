"use client";

import { motion } from "framer-motion";

import type { NicheAnalysisData } from "@/types/niche";
import NicheScoreCard from "@/app/niche/components/NicheScoreCard";
import NicheHotTopicsCard from "@/app/niche/components/NicheHotTopicsCard";
import NicheMetricsCard from "@/app/niche/components/NicheMetricsCard";
import NicheProbeVideosTable from "@/app/niche/components/NicheProbeVideosTable";

type Props = {
  data: NicheAnalysisData | null; // <- allow null
  keyword: string;
};

export default function NicheResults({ data, keyword }: Props) {
  if (!data) {
    return null; // or a skeleton/loading state if you want
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <div className="lg:col-span-2 flex flex-col gap-6">
        <NicheScoreCard data={data} />
        <NicheHotTopicsCard hotTopics={Array.isArray(data.hot_topics) ? data.hot_topics : []} />
        <NicheProbeVideosTable probeVideos={Array.isArray(data.probe_videos) ? data.probe_videos : []} />
      </div>

      <div className="lg:col-span-1 flex flex-col gap-6">
        <NicheMetricsCard metrics={data.metrics} metricNotes={data.metric_notes} />
      </div>
    </motion.div>
  );
}
