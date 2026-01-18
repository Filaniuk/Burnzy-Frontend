"use client";

import { PurpleActionButton } from "@/components/PurpleActionButton";
import { motion, easeOut } from "framer-motion";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
};

export default function ActionButtons({
  type,
  onShowInsights,
  onGenerateIdeas,
}: {
  type: "channel" | "topic";
  onShowInsights: () => void;
  onGenerateIdeas: () => void;
}) {
  const router = useRouter();

  return (
    <motion.div
      variants={fadeUp}
      className="flex justify-center gap-4 mt-10 flex-wrap"
    >
      <PurpleActionButton
        onClick={() => router.push("/dashboard")}
        label="Open Dashboard"
        size="md"
      />
    </motion.div>
  );
}
