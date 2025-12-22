export type ThumbnailStatus = "succeeded" | "failed";

export interface GeneratedThumbnail {
  id: string;
  idea_uuid: string;
  trend_id?: number | null;

  title?: string
  thumbnail_text?: string | null;

  provider: string;
  status: ThumbnailStatus;
  error_message?: string | null;

  parent_id?: string | null;
  operation?: string | null;
  storage_url? : string | null;
  mime_type?: string | null;
  width?: number | null;
  height?: number | null;
  file_size_bytes?: number | null;

  version: number;
  generated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ThumbnailsListResponse {
  status: string;
  message: string;
  data: GeneratedThumbnail[];
  meta: {
    endpoint: string;
    limit: number;
    offset: number;
    total: number;
    timestamp: string;
  };
}
