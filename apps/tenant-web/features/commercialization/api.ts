"use client";

import {
  createOrder,
  getStudentQuota,
  listOrders,
  listPlans,
  listSubscriptions,
  previewStudentImport,
  redeemLicenseCode,
  submitApplication,
  type CreateOrderRequest,
  type OrderResponse,
  type PagedResult,
  type PlanResponse,
  type StudentQuotaResponse,
  type SubmitApplicationRequest,
  type SubscriptionActivationResponse,
  type SubscriptionResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type Query,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import {
  ORDERS_QUERY_KEY,
  STUDENT_QUOTA_QUERY_KEY,
  SUBSCRIPTIONS_QUERY_KEY,
  TENANT_PLANS_QUERY_KEY,
} from "./constants";

export function useTenantPlansQuery(): UseQueryResult<PlanResponse[]> {
  return useQuery({
    queryKey: TENANT_PLANS_QUERY_KEY,
    queryFn: () => listPlans(apiClient),
  });
}

export function useOrdersQuery(
  enabled = true,
  refetchInterval?: number | false | ((query: Query<OrderResponse[], Error>) => number | false),
): UseQueryResult<OrderResponse[]> {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => (await listOrders(apiClient, 0, 100)).data,
    enabled,
    refetchInterval,
  });
}

export function useOrdersPage(page: number, size: number): UseQueryResult<PagedResult<OrderResponse>> {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, page, size],
    queryFn: () => listOrders(apiClient, page, size),
  });
}

export function useCreateOrder(): UseMutationResult<
  OrderResponse,
  unknown,
  CreateOrderRequest
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createOrder(apiClient, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useSubscriptionsQuery(): UseQueryResult<SubscriptionResponse[]> {
  return useQuery({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: () => listSubscriptions(apiClient),
  });
}

export function useRedeemLicense(): UseMutationResult<
  SubscriptionActivationResponse,
  unknown,
  { code: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code }) => redeemLicenseCode(apiClient, { code }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: STUDENT_QUOTA_QUERY_KEY });
    },
  });
}

export function useStudentQuotaQuery(): UseQueryResult<StudentQuotaResponse> {
  return useQuery({
    queryKey: STUDENT_QUOTA_QUERY_KEY,
    queryFn: () => getStudentQuota(apiClient),
  });
}

export function useStudentImportPreview(): UseMutationResult<
  StudentQuotaResponse,
  unknown,
  { adding: number }
> {
  return useMutation({
    mutationFn: ({ adding }) => previewStudentImport(apiClient, { adding }),
  });
}

export function useSubmitApplication(): UseMutationResult<
  void,
  unknown,
  SubmitApplicationRequest
> {
  return useMutation({
    mutationFn: (payload) => submitApplication(apiClient, payload),
  });
}
