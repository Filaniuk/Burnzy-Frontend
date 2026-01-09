"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface GradientActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  label: string;
  className?: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const GradientActionButton: React.FC<GradientActionButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  label,
  icon,
  className = "",
  size = "md",
}) => {
  const baseSize =
    size === "sm"
      ? "px-4 py-2 text-sm"
      : size === "lg"
      ? "px-7 py-3 text-base"
      : "px-6 py-2.5 text-md";

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled || loading}
      className={`rounded-xl font-semibold shadow-lg transition-all bg-gradient-to-r from-[#00F5A0] to-[#6C63FF] text-black flex items-center justify-center gap-2 ${baseSize} ${
        disabled || loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="animate-spin w-4 h-4" />
      ) : (
        icon && <span className="text-lg">{icon}</span>
      )}
      {loading ? "Reanalyzing..." : label}
    </motion.button>
  );
};
