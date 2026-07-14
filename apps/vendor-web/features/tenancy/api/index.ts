"use client";

import {
  ApiError,
  createHost,
  listTenants,
  type CreateHostRequest,
  type HostResponse,
  type TenantResponse,
} from "@aptis/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { DEFAULT_SEATS_BY_PLAN } from "../constants";
import type {
  CreateTenantInput,
  SystemHealth,
  Tenant,
  TenantCreationResult,
} from "../types";

const EMPTY_SYSTEM_HEALTH: SystemHealth = {
  apiErrorRate: "0%",
  aiQueueDepth: 0,
  deliveryErrors: 0,
  operational: true,
};

const unavailableTenantApi = (): ApiError =>
  new ApiError(
    "server",
    501,
    "Tenant management API is not available.",
    { code: "NOT_IMPLEMENTED" },
  );

function formatDisplayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB").format(date);
}

function normalizePlan(plan: string | null): Tenant["plan"] {
  if (plan === "professional" || plan === "enterprise") return plan;
  return "starter";
}

function slugifyTenantName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveTenantStatus(response: TenantResponse): Tenant["status"] {
  if (response.status === "LOCKED") return "suspended";
  if (response.status === "INACTIVE") return "expired";
  if (!response.contractEndDate) return "active";

  const endDate = new Date(`${response.contractEndDate}T00:00:00`);
  if (Number.isNaN(endDate.getTime())) return "active";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (endDate < today) return "expired";

  const daysUntilExpiry = Math.ceil(
    (endDate.getTime() - today.getTime()) / 86_400_000,
  );

  return daysUntilExpiry <= 30 ? "expiring" : "active";
}

function tenantResponseToTenant(response: TenantResponse): Tenant {
  return {
    id: String(response.id),
    name: response.name,
    slug:
      response.contractCode?.trim().toLowerCase() ||
      slugifyTenantName(response.name) ||
      String(response.id),
    contactEmail: response.representativeEmail,
    status: resolveTenantStatus(response),
    seatsUsed: 0,
    seatsTotal: response.studentLimit ?? 0,
    plan: normalizePlan(response.packageName),
    location: response.address,
    activatedAt: response.contractStartDate
      ? formatDisplayDate(response.contractStartDate)
      : "-",
    expiresAt: response.contractEndDate
      ? formatDisplayDate(response.contractEndDate)
      : "-",
    lastActiveLabel: "-",
  };
}

function tenantInputToHostRequest(input: CreateTenantInput): CreateHostRequest {
  const plan = input.plan || "starter";
  const studentLimit = input.maxUsers.trim()
    ? Number(input.maxUsers)
    : DEFAULT_SEATS_BY_PLAN[plan];

  return {
    code: input.slug.trim().toUpperCase(),
    name: input.contactName.trim(),
    organizationName: input.name.trim(),
    organizationType: "SCHOOL",
    address: input.location,
    representativeName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim(),
    representativePhone: input.contactPhone.trim(),
    contractCode: input.slug.trim().toUpperCase(),
    packageName: plan,
    studentLimit,
    contractStartDate: new Date().toISOString().slice(0, 10),
    contractEndDate: input.expiresAt,
  };
}

function hostResponseToTenantResult(response: HostResponse): TenantCreationResult {
  const plan = normalizePlan(response.packageName ?? null);

  const tenant: Tenant = {
    id: String(response.organizationId),
    name: response.organizationName,
    slug: response.code.toLowerCase(),
    contactEmail: response.contactEmail,
    status: "active",
    seatsUsed: 0,
    seatsTotal: response.studentLimit ?? DEFAULT_SEATS_BY_PLAN[plan],
    plan,
    location: response.address,
    activatedAt: response.contractStartDate
      ? formatDisplayDate(response.contractStartDate)
      : "-",
    expiresAt: response.contractEndDate
      ? formatDisplayDate(response.contractEndDate)
      : "-",
    lastActiveLabel: "Just created",
  };

  return {
    tenant,
    loginEmail: response.contactEmail,
    activationCode: response.initialPassword,
    loginUrl: "http://localhost:3001",
  };
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

export function useCreateHost(): UseMutationResult<
  HostResponse,
  unknown,
  CreateHostRequest
> {
  return useMutation({
    mutationFn: (payload: CreateHostRequest) => createHost(apiClient, payload),
  });
}

export function useCreateTenant(): UseMutationResult<
  TenantCreationResult,
  unknown,
  CreateTenantInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const response = await createHost(apiClient, tenantInputToHostRequest(input));
      return hostResponseToTenantResult(response);
    },
    onSuccess: (result) => {
      queryClient.setQueryData<Tenant[]>(["tenants"], (previous = []) => [
        result.tenant,
        ...previous.filter((tenant) => tenant.id !== result.tenant.id),
      ]);
      void queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
  });
}

export function useSuspendTenant(): UseMutationResult<string, unknown, string> {
  return useMutation({
    mutationFn: () => Promise.reject(unavailableTenantApi()),
  });
}
