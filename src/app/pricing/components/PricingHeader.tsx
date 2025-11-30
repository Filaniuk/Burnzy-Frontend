"use client";

import { motion } from "framer-motion";

interface PricingHeaderProps {
  currentPlan: string | null;
  expiresAt: string | null;
  formatDate: (dateStr: string | null | undefined) => string;
}

export default function PricingHeader({
  currentPlan,
  expiresAt,
  formatDate,
}: PricingHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12 max-w-2xl"
    >
      <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-[#6C63FF] to-[#00F5A0] bg-clip-text text-transparent">
        Pricing Plans
      </h1>
      <p className="text-neutral-400 mt-3 text-sm sm:text-base">
        Choose the plan that fits your content creation needs.
      </p>
      {currentPlan && (
        <p className="mt-2 text-sm text-neutral-400">
          Current plan:{" "}
          <span className="text-[#00F5A0] font-medium capitalize">
            {currentPlan}
          </span>
          {expiresAt && (
            <>
              {" "}
              · Renewal / End:{" "}
              <span className="text-[#00F5A0] font-medium">
                {formatDate(expiresAt)}
              </span>
            </>
          )}
        </p>
      )}
    </motion.header>
  );
}
