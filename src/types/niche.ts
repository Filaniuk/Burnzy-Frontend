export type TopicEngagement =
  | "Extremely high"
  | "Very high"
  | "High"
  | "Medium"
  | "Low"
  | string;

export interface NicheToday {
  demand: number;
  momentum: number;
  opportunity: number;
  competition: number;
  ease: number;
}

export interface NicheProbeVideo {
  video_id: string;
  title: string;
  channel: string;
  published_at: string; // RFC3339 string from YouTube (e.g., 2025-12-18T10:00:00Z)
  view_count: number;
}

export interface NicheMetrics {
  window_days: number;
  recent_days: number;

  total_views_21d_sample: number;
  views_per_day_21d_sample: number;

  total_views_7d_sample: number;
  views_per_day_7d_sample: number;

  videos_sampled: number;
  search_results_count_21d: number;
  filtered_out_videos: number;
}

export interface NicheMetricNotes {
  demand?: string;
  momentum?: string;
  opportunity?: string;
  competition?: string;
  [k: string]: string | undefined;
}

export interface NicheAnalysisData {
  score: number;
  today: NicheToday;

  avg_video_views: number;
  probe_videos: NicheProbeVideo[];

  topic_engagement: TopicEngagement;
  hot_topics: string[];

  metrics: NicheMetrics;
  metric_notes: NicheMetricNotes;
}

export interface NicheApiMeta {
  endpoint: string;
  keyword: string;
  cached: boolean;
  id?: number | null;
  version?: number | null;
  timestamp: string;
}

export interface NicheApiResponse {
  status: "success" | "error";
  message: string;
  data: NicheAnalysisData;
  meta: NicheApiMeta;
}
