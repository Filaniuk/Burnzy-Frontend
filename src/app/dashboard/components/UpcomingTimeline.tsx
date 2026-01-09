"use client";

import { useState } from "react";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { DashboardUpcomingIdea } from "@/types/dashboard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CreateIdeaModal from "./CreateIdeaModal";
import SectionTitle from "./SectionTitle";

const STATUS_LABELS: Record<string, string> = {
  unassigned: "Unassigned",
  to_film: "To Film",
  to_publish: "To Publish",
  published: "Published",
  archived: "Archived",
};

const STATUS_STYLES: Record<string, string> = {
  unassigned: "text-neutral-400 border border-neutral-600 bg-[#14131C]/30",
  to_film:
    "text-[#00F5A0] border border-[#00F5A0]/40 bg-[#00F5A0]/5 shadow-[0_0_8px_#00F5A044]",
  to_publish:
    "text-[#F8E45C] border border-[#F8E45C]/40 bg-[#F8E45C]/5 shadow-[0_0_8px_#F8E45C44]",
  published:
    "text-[#6C63FF] border border-[#6C63FF]/40 bg-[#6C63FF]/5 shadow-[0_0_8px_#6C63FF44]",
  archived: "text-neutral-500 border border-neutral-700 bg-[#14131C]/20",
};

// ⭐ OWN badge style
const OWN_STYLE =
  "text-[#6C63FF] border border-[#6C63FF]/40 bg-[#6C63FF]/10 shadow-[0_0_8px_#6C63FF55]";

interface Props {
  upcoming: DashboardUpcomingIdea[];
  tag: string;
  version: number;
  onRefreshUpcoming: () => void;
}

export default function UpcomingTimeline({
  upcoming,
  tag,
  version,
  onRefreshUpcoming,
}: Props) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🚀 Filter out unassigned ideas
  const filteredUpcoming = upcoming.filter((u) => u.status !== "unassigned");

  return (
    <div className="bg-[#16151E] border border-[#2E2D39] rounded-2xl p-5 shadow-lg w-full overflow-hidden">
      <div className="max-h-80 overflow-y-auto overflow-x-hidden pr-2 custom-scroll">

        {/* CREATE BUTTON (always visible) */}
        <div className="mb-4 flex justify-end">
          <PurpleActionButton
            label="Append Own Idea"
            size="md"
            onClick={() => setShowCreateModal(true)}
          />
        </div>

        {/* EMPTY STATE WHEN NO UPCOMING IDEAS */}
        {filteredUpcoming.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-500 text-sm">
            <p>Nothing scheduled yet.</p>
            <p className="opacity-70 mt-2">
              Change an idea’s status in the calendar or add your own to start building your timeline.
            </p>
          </div>
        )}

        {/* RENDER ONLY SCHEDULED IDEAS */}
        {filteredUpcoming.map((u) => {
          const label = STATUS_LABELS[u.status] || u.status;
          const style = STATUS_STYLES[u.status] || STATUS_STYLES["unassigned"];
          const isManual = u.is_manual === true;

          const date = u.scheduled_for
            ? new Date(u.scheduled_for).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            : "Not scheduled";

          return (
            <motion.div
              key={u.id}
              whileHover={{
                scale: isManual ? 1 : 1.01,
                translateX: isManual ? 0 : 4,
              }}
              transition={{ duration: 0.15 }}
              className={`flex items-center justify-between bg-[#0F0E17] border border-[#2E2D39] rounded-xl px-4 py-4 mb-3 ${isManual
                ? "cursor-default opacity-95"
                : "cursor-pointer hover:border-[#6C63FF]/40 hover:shadow-[0_0_10px_#6C63FF33]"
                }`}
              onClick={() => {
                if (isManual) return;
                window.open(
                  `/idea/${u.uuid}?tag=${tag}&version=${version}`,
                  "_blank"
                );
              }}
            >
              <div className="flex flex-col overflow-hidden pr-4">
                <p className="text-white text-[15px] font-semibold leading-snug break-words">
                  {u.title}
                </p>

                <p className="text-neutral-400 text-xs mt-1 tracking-wide whitespace-nowrap">
                  {date}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isManual && (
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${OWN_STYLE}`}
                  >
                    OWN IDEA
                  </span>
                )}

                <span
                  className={`text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${style}`}
                >
                  {label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <CreateIdeaModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          onRefreshUpcoming();
        }}
        tag={tag}
        version={version}
      />

      {/* SCROLLBAR */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #0f0e17;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #2e2d39;
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #6c63ff;
        }
      `}</style>
    </div>
  );
}
