/**
 * Returns the image URL as-is for external URLs (R2/MinIO).
 * Kept as a thin wrapper so callers don't need to change.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return path;
}
