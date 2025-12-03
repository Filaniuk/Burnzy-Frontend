import { motion, easeOut } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export default function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-[#1B1A24] rounded-2xl p-4 border border-[#2E2D39] hover:border-[#6C63FF]/40 transition-all duration-200"
    >
      <div className="text-sm text-neutral-500 mb-1">{label}</div>
      <div className="font-medium text-neutral-100 whitespace-pre-wrap break-words">
        {value}
      </div>
    </motion.div>
  );
}
