/** Formats an ISO timestamp as "YYYY-MM-DD HH:MM" (UTC), identical on server and client. */
export function formatDateTime(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ')
}
