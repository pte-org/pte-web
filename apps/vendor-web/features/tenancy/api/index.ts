"use client";

import {
  createOrganization,
  getTenant,
  listOrganizations,
  listTenants,
  onboardTenant,
  reactivateOrganization,
  reactivateTenant,
  suspendOrganization,
  suspendTenant,
  updateTenantBranding,
  type CreateOrganizationRequest,
  type OnboardTenantRequest,
  type OrganizationResponse,
  type TenantResponse,
  type UpdateBrandingRequest,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type {
  BrandingInput,
  CreateOrganizationInput,
  CreateTenantInput,
  Organization,
  SystemHealth,
  Tenant,
} from "../types";

const EMPTY_SYSTEM_HEALTH: SystemHealth = {
  apiErrorRate: "0%",
  aiQueueDepth: 0,
  deliveryErrors: 0,
  operational: true,
};

function slugifyTenantName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePlan(plan: string | null): Tenant["plan"] {
  if (plan === "professional" || plan === "enterprise") return plan;
  return "starter";
}

/**
 * Maps the real `TenantResponse` to the display `Tenant` model. Only
 * `id`/`name`/`organizationType`/`status`/`plan`/`seatsTotal` are backed by
 * real data — see the `Tenant` type doc comment for why the rest are
 * placeholders.
 */
function tenantResponseToTenant(response: TenantResponse): Tenant {
  return {
    id: response.publicId,
    name: response.name,
    slug: slugifyTenantName(response.name) || response.publicId,
    organizationType: response.organizationType,
    contactEmail: null,
    status: response.status === "SUSPENDED" ? "suspended" : "active",
    seatsUsed: 0,
    seatsTotal: response.studentLimit,
    plan: normalizePlan(response.packageName),
    location: null,
    activatedAt: "-",
    expiresAt: "-",
    lastActiveLabel: "-",
    logoUrl: response.logoUrl,
    primaryColor: response.primaryColor,
  };
}

function organizationResponseToOrganization(response: OrganizationResponse): Organization {
  return {
    id: response.publicId,
    name: response.name,
    address: response.address,
    facilityType: response.facilityType,
    status: response.status === "SUSPENDED" ? "suspended" : "active",
  };
}

function organizationInputToRequest(input: CreateOrganizationInput): CreateOrganizationRequest {
  return {
    name: input.name.trim(),
    address: input.address.trim() || null,
    facilityType: input.facilityType || "BRANCH",
  };
}

function tenantInputToOnboardRequest(
  input: CreateTenantInput,
): OnboardTenantRequest {
  return {
    name: input.name.trim(),
    organizationType: input.organizationType,
    packageName: input.plan || "starter",
    studentLimit: Number(input.studentLimit),
  };
}

function replaceTenantInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: Tenant,
): void {
  queryClient.setQueryData<Tenant[]>(["tenants"], (previous = []) =>
    previous.map((tenant) => (tenant.id === updated.id ? updated : tenant)),
  );
}

export function useTenants(): UseQueryResult<Tenant[]> {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const tenants = await listTenants(apiClient);
      return tenants.map(tenantResponseToTenant);
    },
  });
}

export function useSystemHealth(): UseQueryResult<SystemHealth> {
  return useQuery({
    queryKey: ["systemHealth"],
    queryFn: () => Promise.resolve(EMPTY_SYSTEM_HEALTH),
  });
}

export function useCreateTenant(): UseMutationResult<
  Tenant,
  unknown,
  CreateTenantInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const response = await onboardTenant(
        apiClient,
        tenantInputToOnboardRequest(input),
      );
      return tenantResponseToTenant(response);
    },
    onSuccess: (tenant) => {
      queryClient.setQueryData<Tenant[]>(["tenants"], (previous = []) => [
        tenant,
        ...previous.filter((existing) => existing.id !== tenant.id),
      ]);
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useSuspendTenant(): UseMutationResult<Tenant, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await suspendTenant(apiClient, publicId);
      return tenantResponseToTenant(response);
    },
    onSuccess: (tenant) => {
      replaceTenantInCache(queryClient, tenant);
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useReactivateTenant(): UseMutationResult<
  Tenant,
  unknown,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await reactivateTenant(apiClient, publicId);
      return tenantResponseToTenant(response);
    },
    onSuccess: (tenant) => {
      replaceTenantInCache(queryClient, tenant);
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useTenant(publicId: string): UseQueryResult<Tenant> {
  return useQuery({
    queryKey: ["tenant", publicId],
    queryFn: async () => tenantResponseToTenant(await getTenant(apiClient, publicId)),
    enabled: publicId.length > 0,
  });
}

export function useUpdateBranding(
  publicId: string,
): UseMutationResult<Tenant, unknown, BrandingInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: BrandingInput) => {
      const payload: UpdateBrandingRequest = {
        logoUrl: input.logoUrl.trim() || null,
        primaryColor: input.primaryColor.trim() || null,
      };
      const response = await updateTenantBranding(apiClient, publicId, payload);
      return tenantResponseToTenant(response);
    },
    onSuccess: (tenant) => {
      queryClient.setQueryData(["tenant", publicId], tenant);
      replaceTenantInCache(queryClient, tenant);
    },
  });
}

export function useOrganizations(tenantPublicId: string): UseQueryResult<Organization[]> {
  return useQuery({
    queryKey: ["organizations", tenantPublicId],
    queryFn: async () => {
      const organizations = await listOrganizations(apiClient, tenantPublicId);
      return organizations.map(organizationResponseToOrganization);
    },
    enabled: tenantPublicId.length > 0,
  });
}

function replaceOrganizationInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  tenantPublicId: string,
  updated: Organization,
): void {
  queryClient.setQueryData<Organization[]>(["organizations", tenantPublicId], (previous = []) =>
    previous.map((organization) => (organization.id === updated.id ? updated : organization)),
  );
}

export function useCreateOrganization(
  tenantPublicId: string,
): UseMutationResult<Organization, unknown, CreateOrganizationInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const response = await createOrganization(
        apiClient,
        tenantPublicId,
        organizationInputToRequest(input),
      );
      return organizationResponseToOrganization(response);
    },
    onSuccess: (organization) => {
      queryClient.setQueryData<Organization[]>(["organizations", tenantPublicId], (previous = []) => [
        ...previous,
        organization,
      ]);
      void queryClient.invalidateQueries({ queryKey: ["organizations", tenantPublicId] });
    },
  });
}

export function useSuspendOrganization(
  tenantPublicId: string,
): UseMutationResult<Organization, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationPublicId: string) => {
      const response = await suspendOrganization(apiClient, tenantPublicId, organizationPublicId);
      return organizationResponseToOrganization(response);
    },
    onSuccess: (organization) => replaceOrganizationInCache(queryClient, tenantPublicId, organization),
  });
}

export function useReactivateOrganization(
  tenantPublicId: string,
): UseMutationResult<Organization, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (organizationPublicId: string) => {
      const response = await reactivateOrganization(apiClient, tenantPublicId, organizationPublicId);
      return organizationResponseToOrganization(response);
    },
    onSuccess: (organization) => replaceOrganizationInCache(queryClient, tenantPublicId, organization),
  });
}
