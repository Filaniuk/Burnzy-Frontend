import { motion, easeOut } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export default function AudienceProfileSection({ profile }: { profile: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-[#1B1A24] border border-[#2E2D39] rounded-2xl p-6 shadow-inner"
    >
      <h3 className="text-[#6C63FF] text-lg font-semibold mb-2">🎯 Audience Profile</h3>
      <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap break-words">
        {profile}
      </p>
    </motion.div>
  );
}