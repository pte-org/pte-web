import type { ApiClient } from "../../client/client";
import type {
  CreateProgramRequest,
  ProgramDashboardResponse,
  ProgramResponse,
  UpdateProgramRequest,
} from "../../types/admin/program";

export const PROGRAM_ENDPOINTS = {
  programs: (organizationPublicId: string) =>
    `/api/v1/organizations/${organizationPublicId}/programs`,
  program: (organizationPublicId: string, publicId: string) =>
    `/api/v1/organizations/${organizationPublicId}/programs/${publicId}`,
  dashboard: (organizationPublicId: string, publicId: string) =>
    `/api/v1/organizations/${organizationPublicId}/programs/${publicId}/dashboard`,
  status: (organizationPublicId: string, publicId: string) =>
    `/api/v1/organizations/${organizationPublicId}/programs/${publicId}/status`,
} as const;

export function listPrograms(
  client: ApiClient,
  organizationPublicId: string,
): Promise<ProgramResponse[]> {
  return client.request<ProgramResponse[]>(PROGRAM_ENDPOINTS.programs(organizationPublicId));
}

export function getProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(PROGRAM_ENDPOINTS.program(organizationPublicId, publicId));
}

export function createProgram(
  client: ApiClient,
  organizationPublicId: string,
  payload: CreateProgramRequest,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(PROGRAM_ENDPOINTS.programs(organizationPublicId), {
    method: "POST",
    body: payload,
  });
}

export function updateProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
  payload: UpdateProgramRequest,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(
    PROGRAM_ENDPOINTS.program(organizationPublicId, publicId),
    {
      method: "PUT",
      body: payload,
    },
  );
}

export function activateProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(
    PROGRAM_ENDPOINTS.status(organizationPublicId, publicId),
    {
      method: "PATCH", body: { action: "ACTIVATE" },
    },
  );
}

export function deactivateProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(
    PROGRAM_ENDPOINTS.status(organizationPublicId, publicId),
    {
      method: "PATCH", body: { action: "DEACTIVATE" },
    },
  );
}

export function suspendProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(
    PROGRAM_ENDPOINTS.status(organizationPublicId, publicId),
    {
      method: "PATCH", body: { action: "SUSPEND" },
    },
  );
}

export function archiveProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(
    PROGRAM_ENDPOINTS.status(organizationPublicId, publicId),
    {
      method: "PATCH", body: { action: "ARCHIVE" },
    },
  );
}

export function getProgramDashboard(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramDashboardResponse> {
  return client.request<ProgramDashboardResponse>(
    PROGRAM_ENDPOINTS.dashboard(organizationPublicId, publicId),
  );
}
