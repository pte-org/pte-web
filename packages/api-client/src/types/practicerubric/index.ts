import type { PagedResult } from "../../client/client";

export type PracticeRubricStatus = "DRAFT" | "PENDING_APPROVAL" | "PUBLISHED" | "RETIRED";

export interface PracticeRubricResponse {
  publicId: string;
  rubricKey: string;
  name: string;
  taskTypeKey: string;
  channel: "PRACTICE" | "EXAM" | string;
  version: number;
  status: PracticeRubricStatus | string;
  authorUserPublicId: string | null;
  changeReason: string | null;
  rejectionReason: string | null;
  documentJson: string;
  canonicalHash: string | null;
  entityVersion: number | null;
  submittedAt: string | null;
  publishedAt: string | null;
  retiredAt: string | null;
}

export interface CreatePracticeRubricRequest {
  rubricKey: string;
  taskTypeKey: string;
  name: string;
  documentJson: string;
  changeReason?: string;
}

export interface ReplacePracticeRubricDocumentRequest {
  documentJson: string;
  changeReason?: string;
  expectedVersion?: number | null;
}

export interface RejectPracticeRubricRequest {
  reason: string;
}

export interface PublishPracticeRubricRequest {
  reason: string;
  expectedVersion?: number | null;
}

export interface PracticeRubricDiffResponse {
  fromPublicId: string;
  fromVersion: number;
  toPublicId: string;
  toVersion: number;
  canonicalChanged: boolean;
  changedPaths: string[];
}

export interface PracticeRubricReadinessResponse {
  ready: boolean;
  blockers: string[];
}

export interface PracticeRubricListParams {
  page?: number;
  size?: number;
  status?: string;
  taskTypeKey?: string;
  rubricKey?: string;
  authorUserPublicId?: string;
  version?: number;
}

export type PracticeRubricPage = PagedResult<PracticeRubricResponse>;
