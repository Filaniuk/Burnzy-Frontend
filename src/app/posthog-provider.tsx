"use client";

import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
  defaults: "2025-11-30",
} as const;

export function PHProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!apiKey) return <>{children}</>; // avoid crashing build

  return (
    <PostHogProvider apiKey={apiKey} options={options}>
      {children}
    </PostHogProvider>
  );
}
