"use client";

import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { motion } from "framer-motion";

interface Props {
  item: any;
  router: any;
  accentColor: string;
}

export default function HistoryCard({
  item,
  router,
  accentColor,
}: Props) {
  const isTopic = item.new_channel;
  const createdAtLabel = new Date(item.created_at).toLocaleDateString("en-CA");

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 160, damping: 15 }}
      className={`relative flex flex-col justify-between h-full rounded-2xl border shadow-lg overflow-hidden 
        ${isTopic
          ? "bg-gradient-to-br from-[#1B1A24] to-[#252436] border-[#3E3D4A] hover:border-[#6C63FF]/60"
          : "bg-gradient-to-br from-[#14131C] to-[#1E1D28] border-[#2E2D39] hover:border-[#00F5A0]/60"
        } transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-3">
          <h3
            className={`text-xl sm:text-2xl font-semibold leading-snug ${
              isTopic ? "text-[#6C63FF]" : "text-white"
            }`}
          >
            {item.channel_name || "Untitled"}
          </h3>
          <span className="text-[11px] text-neutral-400 bg-[#2E2D39]/60 px-2.5 py-0.5 rounded-full select-none">
            v{item.version}
          </span>
        </div>

        {!isTopic && (
          <p className="text-sm text-neutral-500 mb-3">{item.channel_tag}</p>
        )}

        <p className="text-neutral-300 text-sm leading-relaxed line-clamp-2 mb-5">
          {item.niche || "No niche description available."}
        </p>

        <span className="text-sm text-neutral-500">{createdAtLabel}</span>
      </div>

      {/* Buttons */}
      <div className="px-6 pb-6 mt-auto">
        <div className="flex flex-col sm:flex-row justify-center sm:justify-end items-center gap-3 sm:gap-2 flex-wrap">
          <PurpleActionButton
            onClick={() =>
              router.push(
                `/analyze?type=${isTopic ? "topic" : "channel"}&tag=${encodeURIComponent(
                  item.channel_tag
                )}&version=${item.version}`
              )
            }
            label="View Analysis"
            size="md"
          />
        </div>
      </div>

      {/* Footer (mobile date badge) */}
      <footer className="sm:hidden flex justify-center pb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm leading-none text-neutral-400 bg-[#1B1A24]/80 border border-[#2E2D39]">
          {createdAtLabel}
        </span>
      </footer>
    </motion.article>
  );
}
