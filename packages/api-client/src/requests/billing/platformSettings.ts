import type { ApiClient } from "../../client/client";
import type {
  PlatformSettingBatchRequest,
  PlatformSettingResponse,
} from "../../types/billing";

export const PLATFORM_SETTING_ENDPOINTS = {
  settings: "/api/v1/settings",
  batch: "/api/v1/settings/batch",
} as const;

export function listPlatformSettings(client: ApiClient): Promise<PlatformSettingResponse[]> {
  return client.request(PLATFORM_SETTING_ENDPOINTS.settings);
}

export function updatePlatformSettings(
  client: ApiClient,
  payload: PlatformSettingBatchRequest,
): Promise<PlatformSettingResponse[]> {
  return client.request(PLATFORM_SETTING_ENDPOINTS.batch, { method: "PUT", body: payload });
}
