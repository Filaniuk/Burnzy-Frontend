"use client";
import { motion } from "framer-motion";

interface Props {
  plan: any;
}

export default function ContentPlanHeader({ plan }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center space-y-2"
    >
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent leading-tight">
        Content Plan for {plan.channel_name}
      </h1>
      <p className="text-neutral-400 text-sm sm:text-base">
        {plan.upload_frequency} • {plan.niche}
      </p>
    </motion.header>
  );
}
