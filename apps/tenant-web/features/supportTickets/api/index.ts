"use client";

import {
  DEFAULT_PAGE_SIZE,
  getTicket,
  listTickets,
  submitTicket,
  type PagedResult,
  type SupportTicketResponse,
  type SupportTicketSummaryResponse,
  type TicketCategory,
  type TicketStatus,
} from "@pte/api-client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { SUPPORT_TICKET_QUERY_KEY, SUPPORT_TICKETS_QUERY_KEY } from "../constants";
import type { CreateTicketInput } from "../types";

export function useSupportTickets(
  status?: TicketStatus,
  category?: TicketCategory,
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): UseQueryResult<PagedResult<SupportTicketSummaryResponse>> {
  return useQuery({
    queryKey: [...SUPPORT_TICKETS_QUERY_KEY, status ?? "ALL", category ?? "ALL", page, size],
    queryFn: () => listTickets(apiClient, { status, category, page, size }),
    placeholderData: keepPreviousData,
  });
}

export function useSupportTicket(
  publicId: string,
): UseQueryResult<SupportTicketResponse> {
  return useQuery({
    queryKey: SUPPORT_TICKET_QUERY_KEY(publicId),
    queryFn: () => getTicket(apiClient, publicId),
  });
}

export function useSubmitTicket(): UseMutationResult<
  SupportTicketResponse,
  Error,
  CreateTicketInput
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => {
      const entityId = input.entityId.trim() || undefined;
      return submitTicket(apiClient, {
        category: input.category as Exclude<typeof input.category, "">,
        description: input.description,
        entityType: entityId ? "EXAM_SESSION" : undefined,
        entityId,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_QUERY_KEY });
    },
  });
}

export function useReportQuestion(
  questionPublicId: string,
): UseMutationResult<SupportTicketResponse, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) =>
      submitTicket(apiClient, {
        category: "CONTENT_COMPLAINT",
        description,
        entityType: "QUESTION",
        entityId: questionPublicId,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_QUERY_KEY });
    },
  });
}
