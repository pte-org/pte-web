"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPlatformAuditActors } from "@pte/api-client";
import { PLATFORM_AUDIT_ACTORS_QUERY_KEY } from "@/features/auditLog/constants";
import { apiClient } from "@/lib/apiClient";

/** The vendor-side people by id, so a card can say who wrote it; empty until the directory has loaded. */
export function useAuthorNames(): (userId: string | null | undefined) => string | null {
  const directory = useQuery({
    queryKey: PLATFORM_AUDIT_ACTORS_QUERY_KEY,
    queryFn: () => listPlatformAuditActors(apiClient),
    staleTime: 60_000,
  });
  const names = useMemo(
    () => new Map((directory.data ?? []).map((entry) => [entry.publicId, entry.fullName])),
    [directory.data],
  );
  return (userId) => (userId ? (names.get(userId) ?? null) : null);
}
