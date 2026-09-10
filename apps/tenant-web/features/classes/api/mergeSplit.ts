"use client";

import {
  mergeClasses,
  splitClass,
  type MergeClassesResponse,
  type SplitClassRequest,
  type SplitClassResponse,
} from "@pte/api-client";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { CLASSES_QUERY_KEY } from "../constants";
import { invalidateClassMemberships } from "./shared";

/**
 * Moves every student from each source Class into `targetClassPublicId`.
 * Does NOT archive the source Class(es) — confirmed with the user during
 * Phase 12 design as the intended behavior (merge only moves membership
 * rows; the Host archives a now-empty source Class separately if wanted).
 * Invalidates both this Program's Classes list (roster counts elsewhere in
 * the UI may depend on it) and the shared class-memberships cache (every
 * moved student's `classPublicId` changed).
 */
export function useMergeClasses(
  organizationPublicId: string,
  programPublicId: string,
  targetClassPublicId: string,
): UseMutationResult<MergeClassesResponse, unknown, string[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceClassPublicIds) =>
      mergeClasses(apiClient, organizationPublicId, programPublicId, targetClassPublicId, { sourceClassPublicIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
      invalidateClassMemberships(queryClient);
    },
  });
}

/** Creates a new Class under the same Program as `sourceClassPublicId`, then moves the given student subset into it. */
export function useSplitClass(
  organizationPublicId: string,
  programPublicId: string,
  sourceClassPublicId: string,
): UseMutationResult<SplitClassResponse, unknown, SplitClassRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => splitClass(apiClient, organizationPublicId, programPublicId, sourceClassPublicId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CLASSES_QUERY_KEY, programPublicId] });
      invalidateClassMemberships(queryClient);
    },
  });
}
