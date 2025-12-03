/* ---------- Dashboard types ---------- */

export interface DashboardChannel {
  tag: string;
  channel_name: string;
  subscribers: number;
  avg_views: number;
  engagement_rate: number;
  upload_frequency: number;
  version: number;
  created_at: string | null;
}

export interface DashboardChannelInsights {
  channel_niche?: string;
  primary_language?: string;
  likely_audience_region?: string;
  tone?: string;
  content_style?: string;
  video_format?: string;
  avg_upload_frequency?: number;
  engagement_level?: string;
  top_keywords?: string[];
  audience_profile?: string;
}

export interface DashboardPrimaryChannel {
  id: number;
  tag: string;
  channel_name: string;
  subscribers: number | null;
  avg_views: number | null;
  engagement_rate: number | null;
  upload_frequency: number | null;
  version: number;
  created_at: string | null;
  is_topic?: boolean;
  insights?: DashboardChannelInsights;
}

export interface DashboardOverviewResponse {
  primary_channel: {
    id: number;
    is_topic : boolean;
    tag: string;
    channel_name: string;
    subscribers: number | null;
    avg_views: number | null;
    engagement_rate: number | null;
    upload_frequency: number | null;
    version: number;
    created_at: string | null;
  } | null;
  channels: {
    id: number;
    tag: string;
    channel_name: string;
    subscribers: number | null;
    avg_views: number | null;
    engagement_rate: number | null;
    upload_frequency: number | null;
    version: number;
    created_at: string | null;
    is_primary: boolean;
  }[];
  ideas_counts: {
    unassigned: number;
    to_film: number;
    to_publish: number;
    published: number;
    archived: number;
  };
  upcoming_ideas: {
    id: number;
    title: string;
    scheduled_for: string | null;
    status: string;
  }[];
  idea_activity: {
    days: { date: string; count: number }[];
  };
  latest_trend_ideas: {
    channel_tag: string;
    ideas: {
      title: string;
      hook?: string;
      trend_score?: number;
      uuid?: string;
    }[];
    created_at: string | null;
  }[];
  competitors: {
    id: number;
    tag: string;
    channel_name: string;
    channel_id: string;
    subscribers: number | null;
    avg_views: number | null;
    upload_frequency: number | null;
    engagement_rate: number | null;
    last_analysis_at: string | null;
  }[];
  plan: {
    name: string;
    usage: Record<string, { limit: number | null }>;
  };
}

export interface DashboardIdeaCounts {
  new: number;
  to_film: number;
  in_production: number;
  published: number;
}

export interface DashboardUpcomingIdea {
  id: number;
  title: string;
  scheduled_for: string | null;
  status: string;
  uuid?: string;
  is_manual?: boolean;
}

export interface DashboardTrendBlock {
  channel_tag: string;
  ideas: any[]; // you can refine this later
  created_at: string | null;
}

export interface DashboardPlanUsage {
  [endpoint: string]: {
    limit: number | null;
  };
}

export interface DashboardKpisResponse {
  weekly_views: number;
  weekly_growth_percent: number;
  best_video: {
    title: string | null;
    views: number;
  };
  upload_goal: {
    done: number;
    target: number;
  };
}

export interface DashboardChartsResponse {
  ideas_created: { date: string; count: number }[];
  ideas_scheduled: { date: string; count: number }[];
}

export interface DashboardCompetitor {
  tag: string;
  channel_name: string;
  avg_views: number | null;
  engagement_rate: number | null;
  upload_frequency: number | null;
  growth: number | null;
  trend_strength: number | null;
}

export interface DashboardCompetitorsResponse {
  competitors: DashboardCompetitor[];
}