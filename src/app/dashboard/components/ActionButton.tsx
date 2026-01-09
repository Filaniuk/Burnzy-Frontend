"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ActionButtonProps {
  icon: ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}

export default function ActionButton({
  icon,
  title,
  desc,
  onClick,
}: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      className="w-full text-left bg-[#1B1A24] border border-[#2E2D39]
                 rounded-xl p-6 cursor-pointer hover:bg-[#222031]
                 focus:outline-none"
      onClick={onClick}
    >
      <div className="mx-auto mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-neutral-400">{desc}</p>
    </motion.button>
  );
}
