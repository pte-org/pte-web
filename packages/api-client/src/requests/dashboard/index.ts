import type { ApiClient } from "../../client/client";
import type {
  AdminDashboardResponse,
  DashboardWindowDays,
  HostDashboardResponse,
} from "../../types/dashboard";

export const DASHBOARD_ENDPOINTS = {
  host: "/api/v1/dashboard/host",
  admin: "/api/v1/dashboard/admin",
} as const;

/** Rolling windows the backend accepts; any other value is rejected with a 400. */
export const DASHBOARD_WINDOW_OPTIONS = [7, 30, 90] as const satisfies readonly DashboardWindowDays[];

/** The window the backend applies when `windowDays` is omitted. */
export const DEFAULT_DASHBOARD_WINDOW_DAYS: DashboardWindowDays = 30;

/** Appends `?windowDays=` only when a window is requested; omitting it lets the backend default apply. */
function withWindow(path: string, windowDays?: DashboardWindowDays): string {
  if (windowDays === undefined) return path;
  return `${path}?${new URLSearchParams({ windowDays: String(windowDays) }).toString()}`;
}

/** Host (tenant) overview aggregate; HOST_ADMIN only. Returns the unwrapped payload. */
export function getHostDashboard(
  client: ApiClient,
  windowDays?: DashboardWindowDays,
): Promise<HostDashboardResponse> {
  return client.request<HostDashboardResponse>(withWindow(DASHBOARD_ENDPOINTS.host, windowDays));
}

/** Platform admin overview aggregate; sections the caller may not see arrive as `FORBIDDEN`. */
export function getAdminDashboard(
  client: ApiClient,
  windowDays?: DashboardWindowDays,
): Promise<AdminDashboardResponse> {
  return client.request<AdminDashboardResponse>(withWindow(DASHBOARD_ENDPOINTS.admin, windowDays));
}
