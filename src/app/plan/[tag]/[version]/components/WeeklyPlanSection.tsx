"use client";

import { motion } from "framer-motion";
import VideoCard from "./VideoCard";

interface Props {
  week: any;
  plan: any;
}

export default function WeeklyPlanSection({ week, plan }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: week.week * 0.1 }}
      className="space-y-5"
    >
      <h2 className="text-xl sm:text-2xl font-semibold text-[#6C63FF]">
        Week {week.week}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {week.videos.map((v: any) => (
          <VideoCard key={v.uuid} v={v} plan={plan} />
        ))}
      </div>
    </motion.section>
  );
}
