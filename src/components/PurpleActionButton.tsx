"use client";

import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

interface PurpleActionButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    label: string;
    icon?: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg";
    gradientFrom?: string;
    gradientTo?: string;
    underline?: boolean;
}

export const PurpleActionButton: React.FC<PurpleActionButtonProps> = ({
    onClick,
    disabled = false,
    loading = false,
    label,
    icon,
    className = "",
    size = "md",
    gradientFrom = "#6C63FF",
    gradientTo = "#4C2AFF",
    underline = false,
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
            style={{
                background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
            }}
            className={`rounded-xl font-semibold shadow-lg transition-all text-white flex items-center justify-center gap-2 ${baseSize} ${disabled || loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
                } ${underline ? "underline" : ""} ${className}`}
        >

            {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
            ) : (
                icon && <span className="text-lg">{icon}</span>
            )}
            {loading ? "Loading..." : label}
        </motion.button>
    );
};