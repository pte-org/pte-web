import type {
  SupportTicketNoteResponse,
  SupportTicketResponse,
  SupportTicketSummaryResponse,
  TicketCategory,
  TicketEntityType,
  TicketStatus,
} from "@pte/api-client";

export type { TicketCategory, TicketStatus, TicketEntityType };

export type SupportTicket = SupportTicketSummaryResponse;
export type SupportTicketDetail = SupportTicketResponse;
export type SupportTicketNote = SupportTicketNoteResponse;

export interface CreateTicketInput {
  category: TicketCategory | "";
  description: string;
  entityId: string;
}

export interface CreateTicketErrors {
  category?: string;
  description?: string;
  entityId?: string;
}
