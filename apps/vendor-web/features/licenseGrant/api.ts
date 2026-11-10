"use client";

import {
  grantLicense,
  previewLicenseGrant,
  searchTenantsPage,
  type LicenseGrantPreviewResponse,
  type LicenseGrantRequest,
  type LicenseGrantResponse,
  type OrganizationResponse,
  type PagedResult,
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
  TENANT_SEARCH_PAGE_SIZE,
  TENANT_SEARCH_QUERY_KEY,
} from "./constants";

export function useTenantSearchQuery(
  q: string,
  page: number,
  enabled: boolean,
): UseQueryResult<PagedResult<OrganizationResponse>> {
  const term = q.trim();
  return useQuery({
    queryKey: TENANT_SEARCH_QUERY_KEY(term, page),
    queryFn: () => searchTenantsPage(apiClient, term, page, TENANT_SEARCH_PAGE_SIZE),
    enabled,
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
