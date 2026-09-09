"use client";

import {
  activateProgram,
  archiveProgram,
  createProgram,
  deactivateProgram,
  getProgram,
  listMyOrganizations,
  listPrograms,
  suspendProgram,
  updateProgram,
  type CreateProgramRequest,
  type OrganizationResponse,
  type ProgramResponse,
  type UpdateProgramRequest,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { MY_ORGANIZATIONS_QUERY_KEY, PROGRAM_QUERY_KEY, PROGRAMS_QUERY_KEY } from "../constants";

/** A Host may have more than one branch — feeds the Organization picker. */
export function useMyOrganizations(): UseQueryResult<OrganizationResponse[]> {
  return useQuery({
    queryKey: MY_ORGANIZATIONS_QUERY_KEY,
    queryFn: () => listMyOrganizations(apiClient),
  });
}

export function usePrograms(organizationPublicId: string): UseQueryResult<ProgramResponse[]> {
  return useQuery({
    queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId],
    queryFn: () => listPrograms(apiClient, organizationPublicId),
    enabled: organizationPublicId.length > 0,
  });
}

export function useProgram(organizationPublicId: string, publicId: string): UseQueryResult<ProgramResponse> {
  return useQuery({
    queryKey: [...PROGRAM_QUERY_KEY, publicId],
    queryFn: () => getProgram(apiClient, organizationPublicId, publicId),
    enabled: organizationPublicId.length > 0 && publicId.length > 0,
  });
}

export function useCreateProgram(
  organizationPublicId: string,
): UseMutationResult<ProgramResponse, unknown, CreateProgramRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createProgram(apiClient, organizationPublicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId] });
    },
  });
}

export function useUpdateProgram(
  organizationPublicId: string,
  publicId: string,
): UseMutationResult<ProgramResponse, unknown, UpdateProgramRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateProgram(apiClient, organizationPublicId, publicId, payload),
    onSuccess: (program) => {
      queryClient.setQueryData([...PROGRAM_QUERY_KEY, publicId], program);
      void queryClient.invalidateQueries({ queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId] });
    },
  });
}

export interface ProgramStatusMutations {
  activate: UseMutationResult<ProgramResponse, unknown, void>;
  deactivate: UseMutationResult<ProgramResponse, unknown, void>;
  suspend: UseMutationResult<ProgramResponse, unknown, void>;
  archive: UseMutationResult<ProgramResponse, unknown, void>;
}

export function useProgramStatusMutations(
  organizationPublicId: string,
  publicId: string,
): ProgramStatusMutations {
  const queryClient = useQueryClient();

  const onSuccess = (program: ProgramResponse): void => {
    queryClient.setQueryData([...PROGRAM_QUERY_KEY, publicId], program);
    void queryClient.invalidateQueries({ queryKey: [...PROGRAMS_QUERY_KEY, organizationPublicId] });
  };

  const activate = useMutation({
    mutationFn: () => activateProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });
  const suspend = useMutation({
    mutationFn: () => suspendProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });
  const archive = useMutation({
    mutationFn: () => archiveProgram(apiClient, organizationPublicId, publicId),
    onSuccess,
  });

  return { activate, deactivate, suspend, archive };
}
