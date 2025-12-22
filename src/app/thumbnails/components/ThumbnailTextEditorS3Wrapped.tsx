"use client";

import React, { forwardRef, useEffect, useState } from "react";
import ThumbnailTextEditor, { ThumbnailTextEditorHandle } from "./ThumbnailTextEditor";
import { apiFetch } from "@/lib/api";

type UrlResponse = { url: string };

type Props = {
  thumbnailId: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
};

const ThumbnailTextEditorS3Wrapped = forwardRef<ThumbnailTextEditorHandle, Props>(
  function ThumbnailTextEditorS3Wrapped({ thumbnailId, className, maxWidth, maxHeight  }: Props, ref) {
    const [resolvedUrl, setResolvedUrl] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;

      setResolvedUrl("");
      setError(null);

      async function run() {
        try {
          const res = await apiFetch<UrlResponse>(`/api/v1/thumbnails/${thumbnailId}/url`);
          if (cancelled) return;

          if (!res?.url) {
            setError("Failed to resolve thumbnail URL.");
            return;
          }

          setResolvedUrl(res.url);
        } catch (e: any) {
          if (cancelled) return;
          setError(e?.message || "Failed to resolve thumbnail URL.");
        }
      }

      run();
      return () => {
        cancelled = true;
      };
    }, [thumbnailId]);

    if (error) return <div className="text-sm text-red-300">{error}</div>;
    if (!resolvedUrl) return <div className="text-sm text-neutral-400">Loading image…</div>;

    return <ThumbnailTextEditor
      ref={ref}
      className={className}
      imageUrl={resolvedUrl}
      maxWidth={maxWidth}
      maxHeight={maxHeight} />;
  }
);

export default ThumbnailTextEditorS3Wrapped;
