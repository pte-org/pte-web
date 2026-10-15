import type { PageMeta } from "../../client/client";

export type IncidentStatus = "NEW" | "IN_PROGRESS" | "ESCALATED" | "RESOLVED" | "CLOSED";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH";
export type IncidentCategory =
  | "IDENTITY_VERIFICATION"
  | "RULE_VIOLATION"
  | "TECHNICAL_ISSUE"
  | "DISRUPTION"
  | "OTHER";

export interface IncidentResponse {
  incidentPublicId: string;
  sessionPublicId: string;
  studentPublicId?: string | null;
  studentName?: string | null;
  attemptPublicId?: string | null;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reporterRole: string;
  reporterName: string;
  currentOwnerRole: string;
  currentOwnerName?: string | null;
  resolutionSummary?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentHistoryItemResponse {
  id: string;
  incidentPublicId: string;
  actorName: string;
  actorRole: string;
  action: string;
  fromStatus?: IncidentStatus | null;
  toStatus: IncidentStatus;
  notes?: string | null;
  createdAt: string;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  studentPublicId?: string | null;
  attemptPublicId?: string | null;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
  notes?: string | null;
  receiverRole?: string | null;
  resolutionSummary?: string | null;
}

export interface IncidentPageResponse {
  data: IncidentResponse[];
  meta: PageMeta;
}
