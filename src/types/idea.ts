export type CreatorPlan = {
  _schema?: "creator_plan_v1";
  title: string;
  hook: string;
  angle: string;
  duration: string;
  structure: string[];
  must_get_shots: string[];
  reveal: string;
  CTA: string;
  avoid: string[];
  mocked_thumbnail_url?: string;
  thumbnail_variations?: string[];
};

export type VideoContentDetailedResponse = {
  data: {
    channel_name: string;
    niche?: string;
    tone?: string;
    audience?: string;
    video_detail: CreatorPlan;
    mocked_thumbnail_url?: string;
    thumbnail_variations?: string[];
  };
  meta?: any;
};
