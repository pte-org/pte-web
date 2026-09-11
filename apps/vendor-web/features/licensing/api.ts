"use client";

import {
  grantQuota,
  listQuotaHistory,
  listTenants,
  type GrantQuotaRequest,
  type QuotaTransactionResponse,
  type TenantResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { LICENSES_QUERY_KEY, QUOTA_HISTORY_QUERY_KEY } from "./constants";
import type { GrantQuotaInput, License, LicenseStats } from "./types";
import { TENANT_QUERY_KEY, TENANTS_QUERY_KEY } from "../tenancy/constants";
import type { TenantPlan } from "../tenancy/types";

function normalizePlan(packageName: string): TenantPlan {
  if (packageName === "professional" || packageName === "enterprise") return packageName;
  return "starter";
}

function tenantResponseToLicense(response: TenantResponse): License {
  return {
    tenantId: response.publicId,
    tenantName: response.name,
    plan: normalizePlan(response.packageName),
    status: response.status === "SUSPENDED" ? "suspended" : "active",
    seatsTotal: response.studentLimit,
  };
}

/** Derives dashboard stats from an already-fetched license list — not a separate query. */
export function licenseStats(licenses: License[]): LicenseStats {
  return {
    total: String(licenses.length),
    active: String(licenses.filter((license) => license.status === "active").length),
    suspended: String(licenses.filter((license) => license.status === "suspended").length),
    totalSeats: String(licenses.reduce((total, license) => total + license.seatsTotal, 0)),
  };
}

export function useLicenses(): UseQueryResult<License[]> {
  return useQuery({
    queryKey: LICENSES_QUERY_KEY,
    queryFn: async () => {
      const tenants = await listTenants(apiClient);
      return tenants.map(tenantResponseToLicense);
    },
  });
}

export function useGrantQuota(
  tenantPublicId: string,
): UseMutationResult<QuotaTransactionResponse, unknown, GrantQuotaInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: GrantQuotaInput) => {
      const payload: GrantQuotaRequest = {
        packageName: input.packageName || "starter",
        amount: Number(input.amount),
        note: input.note.trim() || null,
      };
      return grantQuota(apiClient, tenantPublicId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LICENSES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...TENANT_QUERY_KEY, tenantPublicId] });
      void queryClient.invalidateQueries({ queryKey: [...QUOTA_HISTORY_QUERY_KEY, tenantPublicId] });
    },
  });
}

export function useQuotaHistory(tenantPublicId: string): UseQueryResult<QuotaTransactionResponse[]> {
  return useQuery({
    queryKey: [...QUOTA_HISTORY_QUERY_KEY, tenantPublicId],
    queryFn: () => listQuotaHistory(apiClient, tenantPublicId),
    enabled: tenantPublicId.length > 0,
  });
}
