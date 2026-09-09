import type { ApiClient } from "../../client/client";
import type { CreateProgramRequest, ProgramResponse, UpdateProgramRequest } from "../../types/admin/program";

export const PROGRAM_ENDPOINTS = {
  programs: (organizationPublicId: string) => `/api/admin/organizations/${organizationPublicId}/programs`,
  program: (organizationPublicId: string, publicId: string) =>
    `/api/admin/organizations/${organizationPublicId}/programs/${publicId}`,
  activate: (organizationPublicId: string, publicId: string) =>
    `/api/admin/organizations/${organizationPublicId}/programs/${publicId}/activate`,
  deactivate: (organizationPublicId: string, publicId: string) =>
    `/api/admin/organizations/${organizationPublicId}/programs/${publicId}/deactivate`,
  suspend: (organizationPublicId: string, publicId: string) =>
    `/api/admin/organizations/${organizationPublicId}/programs/${publicId}/suspend`,
  archive: (organizationPublicId: string, publicId: string) =>
    `/api/admin/organizations/${organizationPublicId}/programs/${publicId}/archive`,
} as const;

export function listPrograms(client: ApiClient, organizationPublicId: string): Promise<ProgramResponse[]> {
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
  return client.request<ProgramResponse>(PROGRAM_ENDPOINTS.program(organizationPublicId, publicId), {
    method: "PUT",
    body: payload,
  });
}

export function activateProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(PROGRAM_ENDPOINTS.activate(organizationPublicId, publicId), {
    method: "POST",
  });
}

export function deactivateProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(PROGRAM_ENDPOINTS.deactivate(organizationPublicId, publicId), {
    method: "POST",
  });
}

export function suspendProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(PROGRAM_ENDPOINTS.suspend(organizationPublicId, publicId), {
    method: "POST",
  });
}

export function archiveProgram(
  client: ApiClient,
  organizationPublicId: string,
  publicId: string,
): Promise<ProgramResponse> {
  return client.request<ProgramResponse>(PROGRAM_ENDPOINTS.archive(organizationPublicId, publicId), {
    method: "POST",
  });
}
