import type { ApiClient } from "../../client/client";
import type { AssetResponse, AssetType } from "../../types/asset";

export const ASSET_ENDPOINTS = {
  upload: "/api/v1/assets/upload",
} as const;

export function uploadAsset(
  client: ApiClient,
  file: File,
  assetType: AssetType = "IMAGE_QUESTION",
): Promise<AssetResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("assetType", assetType);
  return client.upload<AssetResponse>(ASSET_ENDPOINTS.upload, formData);
}
