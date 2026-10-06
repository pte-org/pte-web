import type { PagedResult } from "../../client/client";

export type InboxReadFilter = "ALL" | "UNREAD";
export type InboxCategory =
  "SYSTEM_NOTICE" | "MAINTENANCE" | "SESSION" | "APPLICATION" | "BILLING" | "SUPPORT";
export type InboxImportance = "INFO" | "IMPORTANT";
export type InboxNotificationType =
  | "APPLICATION_SUBMITTED"
  | "PLATFORM_ANNOUNCEMENT"
  | "SESSION_CLOSING_SOON"
  | "SESSION_GRADING_COMPLETED"
  | "COMMERCIAL_OUTCOME_CONFIRMED"
  | "ORDER_EXPIRED"
  | "SUBSCRIPTION_REVOKED"
  | "SUPPORT_TICKET_SUBMITTED"
  | "SUPPORT_TICKET_NOTE_ADDED"
  | "SUPPORT_TICKET_STATUS_CHANGED";
export type InboxTargetType =
  | "APPLICATION"
  | "ANNOUNCEMENT"
  | "SESSION"
  | "ORDER"
  | "SUBSCRIPTION"
  | "QUOTA"
  | "SUPPORT_TICKET";

export interface InboxItemResponse {
  publicId: string;
  notificationType: InboxNotificationType;
  category: InboxCategory;
  importance: InboxImportance;
  title: string;
  body: string;
  targetType: InboxTargetType;
  targetPublicId: string;
  sequenceNo: number;
  deliveredAt: string;
  readAt: string | null;
}

export interface InboxSnapshotResponse {
  token: string;
  upperSequence: number;
  expiresAt: string;
}

export interface InboxPageResponse {
  page: PagedResult<InboxItemResponse>;
  snapshot: InboxSnapshotResponse;
  readRevision: number;
}

export interface InboxUnreadCountResponse {
  unreadCount: number;
  readRevision: number;
}

export interface InboxReadAllResponse {
  markedCount: number;
  watermark: number;
  readRevision: number;
}

export interface InboxReadAllRequest {
  snapshotToken?: string | null;
}

export interface ListInboxParams {
  page?: number;
  size?: number;
  filter?: InboxReadFilter;
  category?: InboxCategory;
  snapshot?: string;
}

export interface AnnouncementDeliverySummary {
  audienceCount: number;
  pendingCount: number;
  deliveredCount: number;
  failedCount: number;
  suppressedCount: number;
  readCount: number;
}

export interface AnnouncementResponse {
  publicId: string;
  authorUserPublicId: string;
  title: string;
  body: string;
  category: InboxCategory;
  importance: InboxImportance;
  affectedFrom: string | null;
  affectedUntil: string | null;
  publishedContentPublicId: string | null;
  publishedAt: string | null;
  correctionOfPublicId: string | null;
  version: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  delivery: AnnouncementDeliverySummary | null;
}

export interface AnnouncementCreateRequest {
  title: string;
  body: string;
  category: InboxCategory;
  importance: InboxImportance;
  affectedFrom: string | null;
  affectedUntil: string | null;
  correctionOfPublicId: string | null;
}

export interface AnnouncementUpdateRequest {
  title: string;
  body: string;
  category: InboxCategory;
  importance: InboxImportance;
  affectedFrom: string | null;
  affectedUntil: string | null;
  expectedDraftVersion: number;
}

export interface AnnouncementPublishRequest {
  expectedDraftVersion: number;
}

export interface AnnouncementDeleteRequest {
  expectedDraftVersion: number;
}

export interface AnnouncementAudiencePreviewResponse {
  eligibleTenantCount: number;
  eligibleUserCount: number;
}

export interface ListAnnouncementsParams {
  page?: number;
  size?: number;
}

export type AnnouncementPage = PagedResult<AnnouncementResponse>;
