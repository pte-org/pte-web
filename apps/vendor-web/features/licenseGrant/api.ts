"use client";

import {
  grantLicense,
  previewLicenseGrant,
  searchTenants,
  type LicenseGrantPreviewResponse,
  type LicenseGrantRequest,
  type LicenseGrantResponse,
  type OrganizationResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { LICENSE_CODES_QUERY_KEY } from "@/features/commercialization/constants";
import {
  LICENSE_GRANT_PREVIEW_QUERY_KEY,
  MIN_TENANT_SEARCH_LENGTH,
  TENANT_SEARCH_QUERY_KEY,
} from "./constants";

export function useTenantSearchQuery(q: string): UseQueryResult<OrganizationResponse[]> {
  const term = q.trim();
  return useQuery({
    queryKey: TENANT_SEARCH_QUERY_KEY(term),
    queryFn: () => searchTenants(apiClient, term),
    enabled: term.length >= MIN_TENANT_SEARCH_LENGTH,
  });
}

/**
 * Empty `planId` reads only the organization's hosts; empty `startsAt` previews the server default
 * (continuation of the latest lane of the plan).
 */
export function useLicenseGrantPreviewQuery(
  tenantId: string,
  planId: string,
  startsAt: string,
): UseQueryResult<LicenseGrantPreviewResponse> {
  return useQuery({
    queryKey: LICENSE_GRANT_PREVIEW_QUERY_KEY(tenantId, planId, startsAt),
    queryFn: () =>
      previewLicenseGrant(apiClient, {
        tenantId,
        ...(planId ? { planId } : {}),
        ...(startsAt ? { startsAt } : {}),
      }),
    enabled: tenantId.length > 0,
  });
}

export function useGrantLicense(): UseMutationResult<
  LicenseGrantResponse,
  unknown,
  { payload: LicenseGrantRequest; idempotencyKey: string }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) => grantLicense(apiClient, payload, idempotencyKey),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: LICENSE_CODES_QUERY_KEY });
    },
  });
}
