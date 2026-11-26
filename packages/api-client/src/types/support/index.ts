export type TicketCategory = "BUG" | "CONTENT_COMPLAINT" | "GENERAL_FEEDBACK";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type TicketEntityType = "EXAM_SESSION" | "QUESTION";

export interface SupportTicketNoteResponse {
  publicId: string;
  adminPublicId: string;
  content: string;
  createdAt: string;
}

/** What the linked entity is, so readers can tell which one was reported. Questions only today. */
export interface TicketEntityContext {
  taskTypeKey: string | null;
  section: string | null;
  /** First words of the question text; absent for questions without a text prompt. */
  promptSnippet?: string | null;
}

export interface SupportTicketResponse {
  publicId: string;
  tenantId: string;
  submitterUserPublicId: string;
  /** Null when the submitter account no longer exists. */
  submitterName: string | null;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  entityType: TicketEntityType | null;
  entityId: string | null;
  /** Null when the ticket links nothing, or the linked question no longer exists. */
  entityContext?: TicketEntityContext | null;
  notes: SupportTicketNoteResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketSummaryResponse {
  publicId: string;
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
  search?: string;
  page?: number;
  size?: number;
}

export interface AdminSupportTicketListParams {
  status?: TicketStatus;
  category?: TicketCategory;
  tenantId?: string;
  search?: string;
  page?: number;
  size?: number;
}
