
function stripTrailingSlashes(s: string) {
  return s.replace(/\/+$/, "");
}

export function thumbnailFileUrl(thumbnailId: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const path = `/api/v1/thumbnails/${thumbnailId}/file`;

  if (!base) return path;
  return `${stripTrailingSlashes(base)}${path}`;
}