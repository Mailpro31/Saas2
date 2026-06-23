/**
 * Turn an arbitrary string into a URL-safe slug matching the DB constraint
 * `^[a-z0-9-]{3,40}$`. Falls back to "espace" and pads short results.
 */
export function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  if (base.length >= 3) return base;
  return `espace-${Math.random().toString(36).slice(2, 6)}`;
}

/** Append a short random suffix, keeping within the 40-char limit. */
export function withRandomSuffix(slug: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  const trimmed = slug.slice(0, 40 - suffix.length - 1).replace(/-+$/g, "");
  return `${trimmed}-${suffix}`;
}
