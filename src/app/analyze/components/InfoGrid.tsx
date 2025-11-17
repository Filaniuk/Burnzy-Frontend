import { motion } from "framer-motion";
import InfoBox from "./InfoBox";

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


export default function InfoGrid({ data }: { data: AnalysisData }) {
  return (
    <motion.div
      className="grid md:grid-cols-2 gap-6 mb-10"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      <InfoBox label="Channel Niche" value={data.channel_niche} />
      <InfoBox label="Primary Language" value={data.primary_language} />
      <InfoBox label="Audience Region" value={data.likely_audience_region} />
      <InfoBox label="Tone" value={data.tone} />
      <InfoBox label="Content Style" value={data.content_style} />
      <InfoBox label="Video Format" value={data.video_format} />
      <InfoBox
        label="Average Upload Frequency"
        value={`${data.avg_upload_frequency} videos/week`}
      />
    </motion.div>
  );
}