// src/lib/api.ts

import { DashboardChartsResponse, DashboardCompetitorsResponse, DashboardKpisResponse, DashboardOverviewResponse } from "@/types/dashboard";

export async function apiFetch<T>(path: string, init?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL!;

  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  const resJson = res.json() as Promise<T>;
  console.log(resJson);
  return resJson;
}


/* ---------- Dashboard API helpers ---------- */

export async function getDashboardOverview() {
  return apiFetch<DashboardOverviewResponse>("/api/v1/dashboard/overview");
}

export async function getDashboardKpis() {
  return apiFetch<DashboardKpisResponse>("/api/v1/dashboard/kpis");
}

export async function getDashboardCharts(days = 14) {
  return apiFetch<DashboardChartsResponse>(`/api/v1/dashboard/charts?days=${days}`);
}

export async function getDashboardCompetitors() {
  return apiFetch<DashboardCompetitorsResponse>("/api/v1/dashboard/competitors");
}


/* ---------------------------------------------------------
   COMPETITORS
--------------------------------------------------------- */

export async function addCompetitor(channel_url: string) {
  return apiFetch("/api/v1/competitors", {
    method: "POST",
    body: JSON.stringify({ channel_url }),
  });
}

export async function getCompetitors() {
  return apiFetch("/api/v1/competitors");
}

export async function deleteCompetitor(id: number) {
  return apiFetch(`/api/v1/competitors/${id}`, { method: "DELETE" });
}

export async function getCompetitorSummary(id: number) {
  return apiFetch(`/api/v1/competitors/${id}/summary`);
}

/* ---------------------------------------------------------
   IDEAS
--------------------------------------------------------- */

export async function createIdeaFromTrend(
  trend_idea_uuid: string,
  channel_tag: string,
  version: number
) {
  return apiFetch("/api/v1/ideas/from_trend", {
    method: "POST",
    body: JSON.stringify({ trend_idea_uuid, channel_tag, version }),
  });
}

export async function getIdeas(params?: {
  status?: string;
  channel_tag?: string;
}) {
  const qs = new URLSearchParams(params as any).toString();
  return apiFetch(`/api/v1/ideas${qs ? `?${qs}` : ""}`);
}

export async function getIdea(id: number) {
  return apiFetch(`/api/v1/ideas/${id}`);
}

export async function updateIdea(id: number, payload: any) {
  return apiFetch(`/api/v1/ideas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteIdea(id: number) {
  return apiFetch(`/api/v1/ideas/${id}`, {
    method: "DELETE",
  });
}

/* ---------------------------------------------------------
   SCORING (Title + Thumbnail)
--------------------------------------------------------- */

export async function scoreTitle(payload: {
  title: string;
  channel_tag: string;
  version: number;
  idea_id?: number;
}) {
  return apiFetch("/api/v1/score_title", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function scoreThumbnail(payload: {
  thumbnail_concept: string;
  channel_tag: string;
  version: number;
  idea_id?: number;
}) {
  return apiFetch("/api/v1/score_thumbnail", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ---------------------------------------------------------
   CALENDAR
--------------------------------------------------------- */

export async function getCalendarEvents(fromISO: string, toISO: string) {
  const qs = new URLSearchParams({ from: fromISO, to: toISO }).toString();
  return apiFetch(`/api/v1/calendar?${qs}`);
}

/* ---------------------------------------------------------
   CHANNEL ANALYSIS (existing)
--------------------------------------------------------- */

export async function analyzeChannel(channel_url: string, user_query?: string) {
  return apiFetch("/api/v1/analyze_channel", {
    method: "POST",
    body: JSON.stringify({ channel_url, user_query }),
  });
}

export async function getTrendIdeas(tag: string, version: number) {
  return apiFetch("/api/v1/trend_ideas", {
    method: "POST",
    body: JSON.stringify({ tag, version }),
  });
}
