export type BuilderOption = {
  id: string;
  label: string;
  value: string;
  is_custom?: boolean;
};

export type BuilderQuestionType = "single_select" | "multi_select" | "free_text";

export type BuilderQuestion = {
  id: string;
  text: string;
  help?: string | null;
  type: BuilderQuestionType;
  required: boolean;
  options: BuilderOption[];
  max_select?: number | null;
};

export type BuilderPayload = {
  estimated_minutes: number;
  question_count: number;
  questions: BuilderQuestion[];
};

export type BuilderAnswer = {
  question_id: string;
  value: string | string[];
  custom_text?: string | null;
};

export type BuilderApiResponse = {
  status: "success" | "error";
  message?: string;
  data: {
    idea_uuid: string;
    channel_name: string;
    builder: BuilderPayload;
  };
};

export type FinalIdeaApiResponse = {
  status: "success" | "error";
  message?: string;
  data: any; // matches your existing VideoContentDetailedResponse.data shape
  meta?: any;
};

export type SuggestFromBuilderRequest = {
  channel_tag: string;
  idea_uuid: string;
  version: number;
  trend_id?: number;
  explore_batch_uuid?: string;

  builder: BuilderPayload;
  answers: BuilderAnswer[];

  duration_override?: string; // NEW
};

