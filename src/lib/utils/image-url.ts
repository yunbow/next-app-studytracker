/**
 * Convert image path to API URL
 * @param path - Image path (e.g., "/uploads/studies/image.jpg")
 * @returns API URL (e.g., "/api/images/uploads/studies/image.jpg") or original URL for external images
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // If it's an external URL (http/https), return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Convert /uploads/ path to API route
  if (path.startsWith("/uploads/")) {
    return `/api/images${path}`;
  }

  // For other paths, prepend /api/images/
  return `/api/images${path.startsWith("/") ? "" : "/"}${path}`;
}
