import { easeOut, motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export default function KeywordSection({ keywords }: { keywords: string[] }) {
  return (
    <motion.div variants={fadeUp} className="mb-10">
      <h3 className="text-[#00F5A0] text-lg font-semibold mb-4">🔍 Top Keywords</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw) => (
          <motion.span
            key={kw}
            className="bg-[#1B1A24] px-3 py-1 rounded-full text-sm border border-[#2E2D39] text-neutral-300 hover:border-[#00F5A0]/40 transition-all"
            whileHover={{ scale: 1.05 }}
          >
            {kw}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
