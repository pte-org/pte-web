"use client";

import { listClassMemberships } from "@pte/api-client";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useTenantStudents } from "@/features/examoperations/api";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "@/features/studentSearch/constants";
import type { ClassRosterEntry } from "../types";
import { buildClassRoster } from "../utils/buildClassRoster";

/** Cache the API rows; derive the roster again when the student query updates. */
export function useClassRoster(
  programPublicId: string,
  classPublicId: string,
): UseQueryResult<ClassRosterEntry[]> {
  const students = useTenantStudents();
  return useQuery({
    queryKey: [...CLASS_MEMBERSHIPS_QUERY_KEY, programPublicId],
    queryFn: () => listClassMemberships(apiClient, programPublicId),
    enabled: programPublicId.length > 0 && students.data !== undefined,
    select: (memberships) => buildClassRoster(memberships, students.data ?? [], classPublicId),
  });
}
