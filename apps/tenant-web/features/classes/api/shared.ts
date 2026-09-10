"use client";

import type { useQueryClient } from "@tanstack/react-query";
import { CLASS_MEMBERSHIPS_QUERY_KEY } from "@/features/studentSearch/constants";

/**
 * Shared across `index.ts`/`mergeSplit.ts` (module-boundary helper, not a
 * hook) — extracted into its own file so both can import it without a
 * circular dependency on `index.ts` re-exporting them.
 */
export function invalidateClassMemberships(queryClient: ReturnType<typeof useQueryClient>): void {
  // Partial-match invalidation (TanStack's default) — covers both the
  // tenant-wide unfiltered cache entry (Phase 7's student search) and every
  // per-Program roster entry (`[...CLASS_MEMBERSHIPS_QUERY_KEY, programPublicId]`)
  // in one call, since both keys start with this prefix.
  void queryClient.invalidateQueries({ queryKey: CLASS_MEMBERSHIPS_QUERY_KEY });
}
