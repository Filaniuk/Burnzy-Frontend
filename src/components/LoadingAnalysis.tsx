"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingAnalysis({
  message = "Analyzing your content...",
  secondary_message = "This can take up to a few minutes."
}: {
  message?: string;
  secondary_message?: string
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0E17] text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="mb-6"
        >
          <Loader2 size={48} className="text-[#00F5A0]" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-300 text-lg font-medium"
        >
          {message}
        </motion.p>

        <p className="text-neutral-500 text-sm mt-2">
          {secondary_message}
        </p>
      </motion.div>
    </div>
  );
}
