export function formatNumber(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

export function formatNumberCompact(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "0";

  // Use Intl compact notation when supported.
  try {
    return new Intl.NumberFormat(undefined, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    // Fallback.
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return formatNumber(n);
  }
}

export function formatUtcIso(ts?: string): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toISOString().replace(".000Z", "Z");
}
