import { GradientActionButton } from "@/components/GradientActionButton";
import { PurpleActionButton } from "@/components/PurpleActionButton";
import { motion, easeOut } from "framer-motion";

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
  return (
    <motion.div variants={fadeUp} className="flex justify-center gap-4 mt-10 flex-wrap">
      {type === "channel" && (
        <PurpleActionButton onClick={onShowInsights} label="✨ Show Insights" size="md" />
      )}
      <PurpleActionButton
        onClick={onGenerateIdeas}
        label="🔥 Generate Trend Ideas"
        size="md"
      />
    </motion.div>
  );
}