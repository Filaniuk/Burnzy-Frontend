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
    let text: any = null;

    try {
      text = await res.json();      // try json
    } catch {
      text = await res.text();      // fallback text
    }

    // Throw structured error (NOT Error object)
    throw {
      status: res.status,
      detail: text?.detail || text,
      raw: text,
      isApiError: true,
    };
  }
  const json = res.json() as Promise<T>;

  console.log(json)

  return json;
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
