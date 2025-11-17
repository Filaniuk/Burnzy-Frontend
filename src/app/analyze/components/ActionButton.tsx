import { GradientActionButton } from "@/components/GradientActionButton";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
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
        <GradientActionButton onClick={onShowInsights} label="✨ Show Insights" size="md" />
      )}
      <GradientActionButton
        onClick={onGenerateIdeas}
        label="🔥 Generate Trend Ideas"
        size="md"
      />
    </motion.div>
  );
}