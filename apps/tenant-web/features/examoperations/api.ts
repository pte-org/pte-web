"use client";

import {
  confirmStudentImport,
  listHostStudents,
  prepareStudentImport,
  type DownloadResponse,
  type HostStudentResponse,
  type PageMeta,
  type PagedResult,
  type ParseFileResponse,
} from "@pte/api-client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { parseAndCleanRosterFile } from "./cleanRosterFile";

export const HOST_STUDENTS_QUERY_KEY = ["host-students"] as const;

export interface ImportReviewResult {
  importId: string;
  fileName: string;
  review: ParseFileResponse;
}

export function useParseRosterImport(): UseMutationResult<
  ImportReviewResult,
  unknown,
  File
> {
  return useMutation({
    mutationFn: async (file) => {
      const cleanedImport = await parseAndCleanRosterFile(file);
      const parseResult = await prepareStudentImport(apiClient, cleanedImport);

      return {
        importId: parseResult.importId,
        fileName: file.name,
        review: parseResult,
      };
    },
  });
}

export function useConfirmRosterImport(): UseMutationResult<
  DownloadResponse,
  unknown,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (importId) => confirmStudentImport(apiClient, importId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: HOST_STUDENTS_QUERY_KEY });
    },
  });
}

export function useHostStudents(
  page: number,
  size: number,
): UseQueryResult<PagedResult<HostStudentResponse>> {
  return useQuery({
    queryKey: [...HOST_STUDENTS_QUERY_KEY, page, size],
    queryFn: () => listHostStudents(apiClient, { page, size }),
    placeholderData: (previous) => previous,
  });
}

export type { HostStudentResponse, PageMeta };
