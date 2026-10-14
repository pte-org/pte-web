import type { ApiClient } from "../../client/client";
import type { LocationOption } from "../../types/location";

export const VIETNAM_LOCATION_ENDPOINTS = {
  provinces: "/api/v1/locations/vietnam/provinces",
  wards: (provinceCode: string) =>
    `/api/v1/locations/vietnam/provinces/${encodeURIComponent(provinceCode)}/wards`,
} as const;

export function listVietnamProvinces(client: ApiClient): Promise<LocationOption[]> {
  return client.request<LocationOption[]>(VIETNAM_LOCATION_ENDPOINTS.provinces);
}

export function listVietnamWards(
  client: ApiClient,
  provinceCode: string,
): Promise<LocationOption[]> {
  return client.request<LocationOption[]>(VIETNAM_LOCATION_ENDPOINTS.wards(provinceCode));
}
