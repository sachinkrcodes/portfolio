/**
 * The public address of the site. Link previews, the sitemap and the structured data all use it.
 *
 * Set NEXT_PUBLIC_SITE_URL (for example https://sachinkumar.dev) once you have a final domain.
 * On Vercel, without it, the production address Vercel gives the project is used, so the site works
 * from the first deploy. On your own computer it is http://localhost:3000.
 */
export function siteUrl(): string {
  const set = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (set) return (/^https?:\/\//i.test(set) ? set : `https://${set}`).replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
