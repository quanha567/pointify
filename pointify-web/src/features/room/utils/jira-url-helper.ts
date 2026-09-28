/**
 * Normalizes a Jira issue URL to ensure it is always an absolute, external URL.
 * Prevents relative paths like `/browse/SCRUM-4` from navigating internally within the web app.
 */
export function normalizeJiraUrl(
  rawUrl?: string | null,
  siteUrl?: string | null,
  issueKey?: string | null,
): string {
  if (rawUrl && /^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  const base = siteUrl?.replace(/\/+$/, '') || '';
  const key = issueKey?.trim();
  const path = rawUrl && rawUrl.startsWith('/') ? rawUrl : key ? `/browse/${key}` : '';

  if (!path) return '#';

  if (base) {
    return `${base}${path}`;
  }

  // Fallback to Atlassian domain if no base URL is known to prevent local host hijacking
  return `https://atlassian.net${path}`;
}
