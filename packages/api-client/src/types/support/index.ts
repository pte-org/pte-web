export type TicketCategory = "BUG" | "CONTENT_COMPLAINT" | "GENERAL_FEEDBACK";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export type TicketEntityType = "EXAM_SESSION" | "EXAM_ATTEMPT" | "QUESTION";

export interface SupportTicketNoteResponse {
  publicId: string;
  adminPublicId: string;
  content: string;
  createdAt: string;
}

export interface SupportTicketResponse {
  publicId: string;
  tenantId: string;
  submitterUserPublicId: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  entityType: TicketEntityType | null;
  entityId: string | null;
  notes: SupportTicketNoteResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketSummaryResponse {
  publicId: string;
  tenantId: string;
  submitterUserPublicId: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  entityType: TicketEntityType | null;
  entityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitTicketRequest {
  category: TicketCategory;
  description: string;
  entityType?: TicketEntityType;
  entityId?: string;
}

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

export interface AddNoteRequest {
  content: string;
}

export interface SupportTicketListParams {
  status?: TicketStatus;
  category?: TicketCategory;
  page?: number;
  size?: number;
}

export interface AdminSupportTicketListParams {
  status?: TicketStatus;
  category?: TicketCategory;
  tenantId?: string;
  page?: number;
  size?: number;
}
