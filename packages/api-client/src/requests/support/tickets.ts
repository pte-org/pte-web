import type { ApiClient, PagedResult } from "../../client/client";
import type {
  AddNoteRequest,
  AdminSupportTicketListParams,
  SubmitTicketRequest,
  SupportTicketListParams,
  SupportTicketResponse,
  SupportTicketSummaryResponse,
  UpdateTicketStatusRequest,
} from "../../types/support";

export const SUPPORT_TICKET_ENDPOINTS = {
  tickets: "/api/v1/support-tickets",
  ticket: (publicId: string) => `/api/v1/support-tickets/${publicId}`,
  closeTicket: (publicId: string) => `/api/v1/support-tickets/${publicId}/close`,
  adminTickets: "/api/v1/admin/support-tickets",
  adminTicket: (publicId: string) => `/api/v1/admin/support-tickets/${publicId}`,
  adminUpdateStatus: (publicId: string) => `/api/v1/admin/support-tickets/${publicId}`,
  adminAddNote: (publicId: string) => `/api/v1/admin/support-tickets/${publicId}/notes`,
} as const;

export function submitTicket(
  client: ApiClient,
  payload: SubmitTicketRequest,
): Promise<SupportTicketResponse> {
  return client.request<SupportTicketResponse>(SUPPORT_TICKET_ENDPOINTS.tickets, {
    method: "POST",
    body: payload,
  });
}

export function listTickets(
  client: ApiClient,
  params: SupportTicketListParams = {},
): Promise<PagedResult<SupportTicketSummaryResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", params.category);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  return client.request<PagedResult<SupportTicketSummaryResponse>>(
    qs ? `${SUPPORT_TICKET_ENDPOINTS.tickets}?${qs}` : SUPPORT_TICKET_ENDPOINTS.tickets,
  );
}

export function getTicket(
  client: ApiClient,
  publicId: string,
): Promise<SupportTicketResponse> {
  return client.request<SupportTicketResponse>(SUPPORT_TICKET_ENDPOINTS.ticket(publicId));
}

/** Host withdraws a ticket; the server rejects it once an admin has moved it past OPEN. */
export function closeTicket(
  client: ApiClient,
  publicId: string,
): Promise<SupportTicketResponse> {
  return client.request<SupportTicketResponse>(SUPPORT_TICKET_ENDPOINTS.closeTicket(publicId), {
    method: "POST",
  });
}

export function adminListTickets(
  client: ApiClient,
  params: AdminSupportTicketListParams = {},
): Promise<PagedResult<SupportTicketSummaryResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", params.category);
  if (params.tenantId) query.set("tenantId", params.tenantId);
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.size !== undefined) query.set("size", String(params.size));
  const qs = query.toString();
  return client.request<PagedResult<SupportTicketSummaryResponse>>(
    qs ? `${SUPPORT_TICKET_ENDPOINTS.adminTickets}?${qs}` : SUPPORT_TICKET_ENDPOINTS.adminTickets,
  );
}

export function adminGetTicket(
  client: ApiClient,
  publicId: string,
): Promise<SupportTicketResponse> {
  return client.request<SupportTicketResponse>(SUPPORT_TICKET_ENDPOINTS.adminTicket(publicId));
}

export function adminUpdateTicketStatus(
  client: ApiClient,
  publicId: string,
  payload: UpdateTicketStatusRequest,
): Promise<SupportTicketResponse> {
  return client.request<SupportTicketResponse>(
    SUPPORT_TICKET_ENDPOINTS.adminUpdateStatus(publicId),
    { method: "PATCH", body: payload },
  );
}

export function adminAddNote(
  client: ApiClient,
  publicId: string,
  payload: AddNoteRequest,
): Promise<SupportTicketResponse> {
  return client.request<SupportTicketResponse>(SUPPORT_TICKET_ENDPOINTS.adminAddNote(publicId), {
    method: "POST",
    body: payload,
  });
}
