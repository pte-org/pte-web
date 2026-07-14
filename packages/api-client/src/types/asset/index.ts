export type AssetType = "IMAGE_QUESTION" | "AUDIO_QUESTION" | "AUDIO_RECORDING";

export interface AssetResponse {
  id: string;
  assetType: AssetType;
  storageKey: string;
  cdnUrl: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
  createdAt?: string;
}
