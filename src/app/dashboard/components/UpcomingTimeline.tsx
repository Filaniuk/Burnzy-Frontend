// src/app/dashboard/components/UpcomingTimeline.tsx
"use client";

import { DashboardUpcomingIdea } from "@/types/dashboard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Props {
  upcoming: DashboardUpcomingIdea[];
}

export default function UpcomingTimeline({ upcoming }: Props) {
  const router = useRouter();

  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-xl p-4 sm:p-5">
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {upcoming.map((u) => (
          <motion.div
            key={u.id}
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between bg-[#0F0E17] border border-[#2E2D39] rounded-lg px-3 py-3 cursor-pointer"
            onClick={() => router.push(`/idea/${u.id}`)}
          >
            <div>
              <p className="text-sm font-semibold">{u.title}</p>
              <p className="text-xs text-neutral-400 mt-1">
                {u.scheduled_for
                  ? new Date(u.scheduled_for).toLocaleString()
                  : "Not scheduled"}
              </p>
            </div>
            <span className="text-[11px] uppercase tracking-wide text-neutral-400 border border-[#2E2D39] rounded-full px-2 py-1">
              {u.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
