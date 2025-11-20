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

export async function getUpcomingIdeas() {
  return apiFetch("/api/v1/ideas/upcoming", {
    method: "GET",
  });
}
