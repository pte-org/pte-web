"use client";

import {
  createUser,
  getTenantSuspensionImpact,
  getTenant,
  listTenants,
  listUsersByTenant,
  onboardTenant,
  reactivateTenant,
  resetPassword as resetPasswordRequest,
  suspendTenant,
  updateTenantBranding,
  type CreateUserRequest,
  type OnboardTenantRequest,
  type SuspendTenantRequest,
  type TenantSuspensionImpactResponse,
  type TenantResponse,
  type UpdateBrandingRequest,
  type UserResponse,
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
  LOGIN_ACCOUNT_QUERY_KEY,
  SYSTEM_HEALTH_QUERY_KEY,
  TENANT_QUERY_KEY,
  TENANT_SUSPENSION_IMPACT_QUERY_KEY,
  TENANTS_QUERY_KEY,
} from "../constants";
import type {
  BrandingInput,
  CreateLoginAccountInput,
  CreateTenantInput,
  LoginAccount,
  LoginAccountLookup,
  ResetPasswordInput,
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
 * `id`/`code`/`name`/`organizationType`/`status`/`plan`/`seatsTotal` are backed by
 * real data — see the `Tenant` type doc comment for why the rest are
 * placeholders.
 */
function tenantResponseToTenant(response: TenantResponse): Tenant {
  return {
    id: response.publicId,
    code: response.code,
    name: response.name,
    slug: slugifyTenantName(response.name) || response.publicId,
    organizationType: response.organizationType,
    taxCode: response.taxCode,
    contactEmail: null,
    status: response.status === "SUSPENDED" ? "suspended" : "active",
    suspendedUntil: response.suspendedUntil,
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

export interface SuspendTenantInput {
  publicId: string;
  days?: number;
  impactDigest: string;
}

function userResponseToLoginAccount(response: UserResponse): LoginAccount {
  return {
    id: response.publicId,
    username: response.username,
    email: response.email,
    fullName: response.fullName,
    tenantId: response.tenantId,
    status: response.status === "SUSPENDED" ? "suspended" : "active",
    roles: response.roles,
    studentCode: response.studentCode,
    className: response.className,
    phone: response.phone,
    dateOfBirth: response.dateOfBirth,
    mustChangePassword: response.mustChangePassword,
  };
}

function userResponsesToLoginAccountLookup(users: UserResponse[]): LoginAccountLookup {
  const hostAdmins = users.filter((user) => user.roles.includes("HOST_ADMIN"));
  return {
    account: hostAdmins.length === 1 ? userResponseToLoginAccount(hostAdmins[0]) : null,
    ambiguous: hostAdmins.length > 1,
    candidateCount: hostAdmins.length,
  };
}

function tenantInputToOnboardRequest(input: CreateTenantInput): OnboardTenantRequest {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    organizationType: input.organizationType,
    taxCode: input.taxCode.trim(),
    packageName: input.plan || "starter",
    studentLimit: Number(input.studentLimit),
  };
}

function replaceTenantInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: Tenant,
): void {
  queryClient.setQueryData<Tenant[]>(TENANTS_QUERY_KEY, (previous = []) =>
    previous.map((tenant) => (tenant.id === updated.id ? updated : tenant)),
  );
}

export function useTenants(): UseQueryResult<Tenant[]> {
  return useQuery({
    queryKey: TENANTS_QUERY_KEY,
    queryFn: async () => {
      const tenants = await listTenants(apiClient);
      return tenants.map(tenantResponseToTenant);
    },
  });
}

export function useSystemHealth(): UseQueryResult<SystemHealth> {
  return useQuery({
    queryKey: SYSTEM_HEALTH_QUERY_KEY,
    queryFn: () => Promise.resolve(EMPTY_SYSTEM_HEALTH),
  });
}

export function useCreateTenant(): UseMutationResult<Tenant, unknown, CreateTenantInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const response = await onboardTenant(apiClient, tenantInputToOnboardRequest(input));
      return tenantResponseToTenant(response);
    },
    onSuccess: (tenant) => {
      queryClient.setQueryData<Tenant[]>(TENANTS_QUERY_KEY, (previous = []) => [
        tenant,
        ...previous.filter((existing) => existing.id !== tenant.id),
      ]);
      void queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
    },
  });
}

export function useSuspendTenant(): UseMutationResult<Tenant, unknown, SuspendTenantInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ publicId, days, impactDigest }: SuspendTenantInput) => {
      const payload: SuspendTenantRequest = {
        days: days ?? null,
        impactDigest,
      };
      const response = await suspendTenant(apiClient, publicId, payload);
      return tenantResponseToTenant(response);
    },
    onSuccess: (tenant) => {
      replaceTenantInCache(queryClient, tenant);
      void queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
    },
  });
}

export function useTenantSuspensionImpact(
  publicId: string,
  days?: number,
  enabled = true,
): UseQueryResult<TenantSuspensionImpactResponse> {
  return useQuery({
    queryKey: [...TENANT_SUSPENSION_IMPACT_QUERY_KEY, publicId, days ?? "default"],
    queryFn: () => getTenantSuspensionImpact(apiClient, publicId, days),
    enabled: enabled && publicId.length > 0,
  });
}

export function useReactivateTenant(): UseMutationResult<Tenant, unknown, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      const response = await reactivateTenant(apiClient, publicId);
      return tenantResponseToTenant(response);
    },
    onSuccess: (tenant) => {
      replaceTenantInCache(queryClient, tenant);
      void queryClient.invalidateQueries({ queryKey: TENANTS_QUERY_KEY });
    },
  });
}

export function useTenant(publicId: string): UseQueryResult<Tenant> {
  return useQuery({
    queryKey: [...TENANT_QUERY_KEY, publicId],
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
      queryClient.setQueryData([...TENANT_QUERY_KEY, publicId], tenant);
      replaceTenantInCache(queryClient, tenant);
    },
  });
}

export function useLoginAccount(
  tenantPublicId: string,
  enabled = true,
): UseQueryResult<LoginAccountLookup> {
  return useQuery({
    queryKey: [...LOGIN_ACCOUNT_QUERY_KEY, tenantPublicId],
    queryFn: async () => {
      const users = await listUsersByTenant(apiClient, tenantPublicId);
      return userResponsesToLoginAccountLookup(users);
    },
    enabled: enabled && tenantPublicId.length > 0,
  });
}

export function useCreateLoginAccount(
  tenantPublicId: string,
): UseMutationResult<LoginAccount, unknown, CreateLoginAccountInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const payload: CreateUserRequest = {
        email: input.email.trim(),
        fullName: input.fullName.trim(),
        password: input.password,
        roles: ["HOST_ADMIN"],
        tenantId: tenantPublicId,
      };
      const response = await createUser(apiClient, payload);
      return userResponseToLoginAccount(response);
    },
    onSuccess: (account) => {
      queryClient.setQueryData<LoginAccountLookup>([...LOGIN_ACCOUNT_QUERY_KEY, tenantPublicId], {
        account,
        ambiguous: false,
        candidateCount: 1,
      });
      void queryClient.invalidateQueries({
        queryKey: [...LOGIN_ACCOUNT_QUERY_KEY, tenantPublicId],
      });
    },
  });
}

export function useResetPassword(
  userPublicId: string,
): UseMutationResult<LoginAccount, unknown, ResetPasswordInput> {
  return useMutation({
    mutationFn: async (input) => {
      const response = await resetPasswordRequest(apiClient, userPublicId, {
        newPassword: input.newPassword,
      });
      return userResponseToLoginAccount(response);
    },
  });
}
