// Publishing requires an explicit opt-in. Missing, draft and unknown values stay private.
export function normalizeStatus(status: string): "public" | "private" {
  return status.trim().toLowerCase() === "public" ? "public" : "private";
}

// A Notion slug represents one route segment, never a URL, query or parent path.
export function normalizePostSlug(value: string, fallbackId: string): string {
  const slug = value.trim();
  return /^[\p{L}\p{N}_-]+$/u.test(slug) ? slug : fallbackId.replace(/-/g, "");
}
