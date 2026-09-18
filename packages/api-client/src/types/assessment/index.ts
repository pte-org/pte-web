export type ExamBlueprintStatus = "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED";

export interface BlueprintItemRequest {
  questionPublicId: string;
  section?: string | null;
  orderIndex?: number | null;
}

export interface CreateBlueprintRequest {
  name: string;
  items: BlueprintItemRequest[];
  version?: number;
  preserveOrder?: boolean;
}

export interface BlueprintResponseItem {
  questionPublicId: string;
  section: string;
  orderIndex: number;
}

export interface ExamBlueprintResponse {
  publicId: string;
  name: string;
  tenantId: string | null;
  status: ExamBlueprintStatus | string;
  rejectionReason: string | null;
  version: number;
  items: BlueprintResponseItem[];
}

export interface SnapshotResponseItem {
  orderIndex: number;
  section: string;
  taskType: string;
  title: string;
}

export interface ExamSnapshotResponse {
  publicId: string;
  name: string;
  version: number;
  sourceBlueprintPublicId: string;
  scoreTemplatePublicId: string;
  scoreTemplateVersion: number;
  tenantId: string | null;
  items: SnapshotResponseItem[];
}
