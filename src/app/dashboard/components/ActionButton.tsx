import { motion } from "framer-motion";

export default function ActionButton({ icon, title, desc, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-[#1B1A24] border border-[#2E2D39] rounded-xl p-6 cursor-pointer hover:bg-[#222031]"
      onClick={onClick}
    >
      <div className="mx-auto mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-neutral-400">{desc}</p>
    </motion.div>
  );
}