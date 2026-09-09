"use client";

import {
  activateClass,
  archiveClass,
  createClass,
  deactivateClass,
  listClasses,
  suspendClass,
  type ClassResponse,
  type CreateClassRequest,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { CLASSES_QUERY_KEY } from "../constants";

export function useClasses(organizationPublicId: string, programPublicId: string): UseQueryResult<ClassResponse[]> {
  return useQuery({
    queryKey: [...CLASSES_QUERY_KEY, programPublicId],
    queryFn: () => listClasses(apiClient, organizationPublicId, programPublicId),
    enabled: organizationPublicId.length > 0 && programPublicId.length > 0,
  });
}

export function useCreateClass(
  organizationPublicId: string,
  programPublicId: string,
): UseMutationResult<ClassResponse, unknown, CreateClassRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createClass(apiClient, organizationPublicId, programPublicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
    },
  });
}

export interface ClassStatusMutations {
  activate: UseMutationResult<ClassResponse, unknown, void>;
  deactivate: UseMutationResult<ClassResponse, unknown, void>;
  suspend: UseMutationResult<ClassResponse, unknown, void>;
  archive: UseMutationResult<ClassResponse, unknown, void>;
}

export function useClassStatusMutations(
  organizationPublicId: string,
  programPublicId: string,
  classPublicId: string,
): ClassStatusMutations {
  const queryClient = useQueryClient();

  const onSuccess = (): void => {
    void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
  };

  const activate = useMutation({
    mutationFn: () => activateClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });
  const deactivate = useMutation({
    mutationFn: () => deactivateClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });
  const suspend = useMutation({
    mutationFn: () => suspendClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });
  const archive = useMutation({
    mutationFn: () => archiveClass(apiClient, organizationPublicId, programPublicId, classPublicId),
    onSuccess,
  });

  return { activate, deactivate, suspend, archive };
}
