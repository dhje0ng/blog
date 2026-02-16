const MIN_REVALIDATE_SECONDS = 60 * 5;
const DEFAULT_REVALIDATE_SECONDS = 60 * 15;
const MAX_REVALIDATE_SECONDS = 60 * 60 * 6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseSyncInterval(rawValue: string | undefined): number {
  if (!rawValue) return DEFAULT_REVALIDATE_SECONDS;

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_REVALIDATE_SECONDS;
  }

  return clamp(Math.floor(parsed), MIN_REVALIDATE_SECONDS, MAX_REVALIDATE_SECONDS);
}

export const NOTION_REVALIDATE_SECONDS = parseSyncInterval(process.env.NOTION_SYNC_INTERVAL_SECONDS);

