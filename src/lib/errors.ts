// lib/errors.ts

import { APIError } from "./api";

export function extractApiError(err: any): string {
  // APIError (our custom error class)
  if (err instanceof APIError) {
    if (typeof err.detail === "string" && err.detail.length > 0) {
      return err.detail;
    }
    return err.message || "An unexpected API error occurred.";
  }

  // FastAPI style error → { detail: "...message..." }
  if (err?.detail) return String(err.detail);

  // Errors thrown directly as strings
  if (typeof err === "string") return err;

  // JS Error
  if (err?.message) return err.message;

  // Network issues
  if (err?.name === "FetchError" || err?.code === "ECONNREFUSED") {
    return "Cannot reach the server. Please try again.";
  }

  return "Something went wrong. Please try again.";
}
