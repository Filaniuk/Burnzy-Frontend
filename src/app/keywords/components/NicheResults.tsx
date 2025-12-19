"use client";

import { motion } from "framer-motion";

import type { NicheAnalysisData } from "@/types/keywords";
import NicheScoreCard from "./NicheScoreCard";
import NicheHotTopicsCard from "./NicheHotTopicsCard";
import NicheProbeVideosTable from "./NicheProbeVideosTable";
import NicheMetricsCard from "./NicheMetricsCard";


type Props = {
  data: NicheAnalysisData | null; // <- allow null
  keyword: string;
};

export default function NicheResults({ data, keyword }: Props) {
  if (!data) {
    return null; // or a skeleton/loading state if you want
  }

  return (
    <div>
      <div className="block my-2">
        <NicheProbeVideosTable probeVideos={Array.isArray(data.probe_videos) ? data.probe_videos : []} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2 flex flex-col gap-6">
          <NicheScoreCard data={data} />
          <NicheHotTopicsCard hotTopics={Array.isArray(data.hot_topics) ? data.hot_topics : []} />
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <NicheMetricsCard metrics={data.metrics} metricNotes={data.metric_notes} />
        </div>

      </motion.div>
    </div>
  );
}
