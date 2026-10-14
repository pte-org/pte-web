"use client";

import {
  createOrder,
  getOrder,
  getSubscription,
  getStudentQuota,
  listOrders,
  listPlans,
  listSubscriptions,
  previewStudentImport,
  redeemLicenseCode,
  revealLicenseKey,
  submitApplication,
  type CreateOrderRequest,
  type LicenseKeyResponse,
  type OrderListFilters,
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

export function useOrdersPage(
  page: number,
  size: number,
  search = "",
  filters: OrderListFilters = {},
): UseQueryResult<PagedResult<OrderResponse>> {
  const { status = "", createdFrom = "", createdTo = "" } = filters;
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, search, status, createdFrom, createdTo, page, size],
    queryFn: () =>
      listOrders(apiClient, page, size, search, {
        ...(status ? { status } : {}),
        ...(createdFrom ? { createdFrom } : {}),
        ...(createdTo ? { createdTo } : {}),
      }),
  });
}

export function useOrderQuery(
  publicId: string | null,
  enabled = true,
): UseQueryResult<OrderResponse> {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, "detail", publicId],
    queryFn: () => getOrder(apiClient, publicId as string),
    enabled: enabled && Boolean(publicId),
    refetchInterval: (query: Query<OrderResponse, Error>) =>
      query.state.data?.status === "PENDING" ? 10_000 : false,
  });
}

export function useCreateOrder(): UseMutationResult<OrderResponse, unknown, CreateOrderRequest> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createOrder(apiClient, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

export function useSubscriptionsQuery(enabled = true): UseQueryResult<SubscriptionResponse[]> {
  return useQuery({
    queryKey: SUBSCRIPTIONS_QUERY_KEY,
    queryFn: () => listSubscriptions(apiClient),
    enabled,
  });
}

export function useSubscriptionQuery(
  publicId: string | null,
  enabled = true,
): UseQueryResult<SubscriptionResponse> {
  return useQuery({
    queryKey: [...SUBSCRIPTIONS_QUERY_KEY, "detail", publicId],
    queryFn: () => getSubscription(apiClient, publicId as string),
    enabled: enabled && Boolean(publicId),
  });
}

/** Step-up re-authentication: resolves with the full license key, or rejects on a wrong password. */
export function useRevealLicenseKey(): UseMutationResult<
  LicenseKeyResponse,
  unknown,
  { subscriptionPublicId: string; password: string }
> {
  return useMutation({
    mutationFn: ({ subscriptionPublicId, password }) =>
      revealLicenseKey(apiClient, subscriptionPublicId, { password }),
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

export function useSubmitApplication(): UseMutationResult<void, unknown, SubmitApplicationRequest> {
  return useMutation({
    mutationFn: (payload) => submitApplication(apiClient, payload),
  });
}
