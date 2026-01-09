import { GradientActionButton } from "@/components/GradientActionButton";
import { easeOut, motion } from "framer-motion";

type AnalysisData = {
    channel_niche: string;
    primary_language: string;
    likely_audience_region: string;
    tone: string;
    content_style: string;
    video_format: string;
    avg_upload_frequency: number;
    engagement_level: string;
    top_keywords: string[];
    audience_profile: string;
    meta: { tag: string; version: number };
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export default function ReportHeader({
    data,
    type,
    reanalyzing,
    onReanalyze,
}: {
    data: AnalysisData;
    type: "channel" | "topic";
    reanalyzing: boolean;
    onReanalyze: () => void;
}) {
    const engagementColors: Record<string, string> = {
        high: "bg-[#00F5A0]/20 text-[#00F5A0] border-[#00F5A0]/30",
        medium: "bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]/30",
        low: "bg-red-800/30 text-red-400 border-red-900/30",
    };

    return (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-6">
            <motion.div variants={fadeUp}>
                <h2 className="text-3xl font-bold mb-2">
                    {type === "channel" ? "Channel Analysis" : "Topic Strategy Overview"}
                </h2>
                <p className="text-neutral-400 text-sm">
                    {type === "channel"
                        ? "Data-driven insights for an existing YouTube channel."
                        : "AI-powered analysis for your new content idea."}
                </p>
            </motion.div>

            <motion.div
                className="flex flex-col sm:items-end gap-3"
                variants={fadeUp}
                transition={{ delay: 0.15 }}
            >
                <GradientActionButton
                    onClick={onReanalyze}
                    loading={reanalyzing}
                    label="🔁 Reanalyze"
                    size="md"
                />
                <div
                    className={`border rounded-full px-4 py-2 text-sm font-semibold ${engagementColors[data.engagement_level]}`}
                >
                    Engagement: {data.engagement_level.toUpperCase()}
                </div>
            </motion.div>
        </div>
    );
}