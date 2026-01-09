/* ---------- Explore Ideas types ---------- */

export type ExploreAdvancedOptions = {
  budget?: string;
  location?: string;
  desired_length?: string;
  format?: "auto" | "shorts" | "long_form";
  platform?: "YouTube" | "TikTok" | "Instagram";
  constraints?: string;
};

export type ExploreIdeaSuggestion = {
  uuid: string;
  format?: string;
  title: string;
  hook?: string;
  outline?: string[];
  thumbnail_concept?: string;
  thumbnail_mockup_text?: string;
  call_to_action?: string;
  trend_score?: number;
  why_this_idea?: string;
  meaning_short?: string;
  mocked_thumbnail_url?: string | null;
};

export type ExploreIdeasSuggestionsResponse = {
  status: "success" | "error";
  message?: string;
  data?: {
    batch_uuid: string;
    channel_id?: number;
    channel_tag: string;
    version: number;
    ideas: ExploreIdeaSuggestion[];
  };
  meta?: any;
};
