export const websiteStatuses = {
  live: "Live",
  temporarily_unavailable: "Temporarily Unavailable",
  domain_expired: "Domain Expired",
  permanently_offline: "Permanently Offline",
} as const;
export type WebsiteAvailability = keyof typeof websiteStatuses;
// Missing values are a legacy migration default, never evidence of verification.
export function isWebsiteLive(project: { websiteAvailability?: string }) {
  return (project.websiteAvailability ?? "live") === "live";
}
export function publicProject<T extends object>(project: T) {
  const {
    adminNotes: _notes,
    lastCheckedAt: _checked,
    lastCheckResult: _result,
    websiteStatusUpdatedAt: _updated,
    ...safe
  } = project as T & {
    adminNotes?: string;
    lastCheckedAt?: string;
    lastCheckResult?: string;
    websiteStatusUpdatedAt?: string;
  };
  return safe;
}
