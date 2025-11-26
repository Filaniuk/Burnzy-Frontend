import { AnimatePresence, motion } from "framer-motion";
import ChannelInsights from "./ChannelInsights";
import TrendIdeas from "./TrendIdeas";

const sectionFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

export default function DynamicSection({
  activeSection,
  tag,
  version,
}: {
  activeSection: "insights" | "ideas" | null;
  tag: string;
  version: number;
}) {
  return (
    <div className="mt-10">
      <AnimatePresence mode="wait">
        {activeSection === "insights" && tag && (
          <motion.div
            key="insights"
            variants={sectionFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ChannelInsights tag={tag} version={version}/>
          </motion.div>
        )}
        {activeSection === "ideas" && (
          <motion.div
            key="ideas"
            variants={sectionFade}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <TrendIdeas tag={tag} version={version} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}