export type BlueprintStatus = "DRAFT" | "PUBLISHED";

/** Matches authoring's real `BlueprintResponse` record exactly. */
export interface BlueprintResponse {
  publicId: string;
  name: string;
  tenantId: string;
  status: BlueprintStatus;
  items: { questionPublicId: string; section: string; orderIndex: number }[];
}

/** Matches authoring's real `SnapshotResponse` record exactly. */
export interface SnapshotResponse {
  publicId: string;
  name: string;
  version: number;
  sourceBlueprintPublicId: string;
  tenantId: string;
  items: { orderIndex: number; section: string; taskType: string; title: string }[];
}
