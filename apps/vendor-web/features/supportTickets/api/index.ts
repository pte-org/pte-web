"use client";

import {
  adminAddNote,
  adminGetTicket,
  adminListTickets,
  adminUpdateTicketStatus,
  DEFAULT_PAGE_SIZE,
  type AddNoteRequest,
  type UpdateTicketStatusRequest,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import {
  ADMIN_SUPPORT_TICKET_QUERY_KEY,
  ADMIN_SUPPORT_TICKETS_QUERY_KEY,
} from "../constants";
import type { SupportTicket, SupportTicketDetail, TicketCategory, TicketStatus } from "../types";

export function useAdminSupportTickets(
  status?: TicketStatus,
  category?: TicketCategory,
  tenantId?: string,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): UseQueryResult<{ data: SupportTicket[]; meta: { totalElements: number; totalPages: number; page: number; size: number } }> {
  return useQuery({
    queryKey: [...ADMIN_SUPPORT_TICKETS_QUERY_KEY, { status, category, tenantId, page, size }],
    queryFn: async () => {
      const result = await adminListTickets(apiClient, {
        status,
        category,
        tenantId: tenantId?.trim() || undefined,
        page,
        size,
      });
      return result as typeof result;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminSupportTicket(publicId: string): UseQueryResult<SupportTicketDetail> {
  return useQuery({
    queryKey: ADMIN_SUPPORT_TICKET_QUERY_KEY(publicId),
    queryFn: () => adminGetTicket(apiClient, publicId),
    enabled: publicId.length > 0,
  });
}

export function useUpdateTicketStatus(
  publicId: string,
): UseMutationResult<SupportTicketDetail, unknown, UpdateTicketStatusRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => adminUpdateTicketStatus(apiClient, publicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_SUPPORT_TICKET_QUERY_KEY(publicId) });
      void queryClient.invalidateQueries({ queryKey: [...ADMIN_SUPPORT_TICKETS_QUERY_KEY] });
    },
  });
}

export function useAddTicketNote(
  publicId: string,
): UseMutationResult<unknown, unknown, AddNoteRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => adminAddNote(apiClient, publicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_SUPPORT_TICKET_QUERY_KEY(publicId) });
    },
  });
}
