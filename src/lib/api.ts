export class APIError extends Error {
  status?: number;
  detail?: any;
  raw?: any;
  isApiError: boolean = true;
  path?: string;

  constructor(message: string, options?: { status?: number; detail?: any; raw?: any; path?: string }) {
    super(message);
    this.name = "APIError";
    if (options) {
      this.status = options.status;
      this.detail = options.detail;
      this.raw = options.raw;
      this.path = options.path;
    }
  }
}

// Generic fetch wrapper
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) {
    // Fails fast in dev if env is misconfigured
    throw new APIError("API base URL is not configured (NEXT_PUBLIC_API_BASE_URL missing).", {
      status: 0,
      detail: "Missing NEXT_PUBLIC_API_BASE_URL",
      path,
    });
  }

  let res: Response;

  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
  } catch (err) {
    // Network / CORS / DNS errors never hit res.ok
    throw new APIError("Network error. Please check your connection and try again.", {
      status: 0,
      detail: err instanceof Error ? err.message : String(err),
      raw: err,
      path,
    });
  }
  // Non-2xx HTTP statuses
  if (!res.ok) {
    let raw: any = null;
    let detail: any = null;

    try {
      raw = await res.json();
      detail = raw?.detail || raw?.message || raw;
    } catch {
      try {
        raw = await res.text();
        detail = raw;
      } catch {
        raw = null;
        detail = null;
      }
    }

    const message =
      typeof detail === "string" && detail.length > 0
        ? detail
        : `Request failed with status ${res.status}`;

    throw new APIError(message, {
      status: res.status,
      detail,
      raw,
      path,
    });
  }

  // Happy path: parse JSON safely
  try {
    const json = (await res.json()) as T;
    return json;
  } catch (err) {
    throw new APIError("Failed to parse server response.", {
      status: res.status,
      detail: err instanceof Error ? err.message : String(err),
      raw: err,
      path,
    });
  }
}
