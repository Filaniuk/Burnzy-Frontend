export type VideoDetail = {
  title: string;
  hook: string;
  opening_scene: string;
  key_quote_or_line: string;
  narrative_arc: Array<{ act: string; content: string }>;
  duration_estimate?: string;
  video_type?: string;
  trend_score?: number;
  mocked_thumbnail_url?: string;
  thumbnail_notes?: string;
  target_emotion?: string[];
  secondary_topics?: string[];
  seo_keywords?: string[];
  shoot_location: string[];
  equipment_needed: string[];
  editing_style: string;
  background_music_mood: string[];
  why_this_idea?: string;
};

export type VideoContentDetailedResponse = {
  data: {
    channel_name: string;
    niche: string;
    tone: string;
    video_detail: VideoDetail;
  };
  meta: {
    trend_id: number | null;
  }
};

export type ScriptData = {
  title: string;
  three_alternate_hooks: string[];
  timestamped_script: {
    time: string;
    scene: string;
    voiceover: string;
    visuals: string;
    b_roll: string[];
  }[];
  shot_list: {
    shot_type: string;
    description: string;
    estimated_duration: string;
  }[];
  thumbnail_options?: {
    a: string;
    b: string;
  };
  shorts_version: {
    hook: string;
    script: string[];
    cta: string;
  };
};