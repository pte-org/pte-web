import type { ApiClient } from "../../client/client";
import type { PlatformSettingRequest, PlatformSettingResponse } from "../../types/billing";

export const PLATFORM_SETTING_ENDPOINTS = {
  settings: "/api/v1/settings",
  setting: (key: string) => "/api/v1/settings/" + encodeURIComponent(key),
} as const;

export function listPlatformSettings(client: ApiClient): Promise<PlatformSettingResponse[]> {
  return client.request(PLATFORM_SETTING_ENDPOINTS.settings);
}

export function getPlatformSetting(
  client: ApiClient,
  key: string,
): Promise<PlatformSettingResponse> {
  return client.request(PLATFORM_SETTING_ENDPOINTS.setting(key));
}

export function updatePlatformSetting(
  client: ApiClient,
  key: string,
  payload: PlatformSettingRequest,
): Promise<PlatformSettingResponse> {
  return client.request(PLATFORM_SETTING_ENDPOINTS.setting(key), { method: "PUT", body: payload });
}
