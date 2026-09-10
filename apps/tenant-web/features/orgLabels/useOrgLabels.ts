"use client";

import { useCurrentUser } from "@/features/auth/api";
import {
  DEFAULT_ORG_TYPE_FAMILY,
  ORG_LABEL_DICTIONARY,
  ORG_TYPE_FAMILY_MAP,
  type OrgLabels,
} from "./constants";

/**
 * The single source of Program/Class terminology — every component that
 * needs a label calls this hook, never reads `organizationType` directly.
 * Always re-derived from `useCurrentUser()`'s live query (never persisted
 * into `sessionStorage`), so a page reload never shows a stale label.
 */
export function useOrgLabels(): OrgLabels {
  const { data, isLoading } = useCurrentUser();
  const organizationType = data?.organizationType;
  const family = organizationType
    ? (ORG_TYPE_FAMILY_MAP[organizationType] ?? DEFAULT_ORG_TYPE_FAMILY)
    : DEFAULT_ORG_TYPE_FAMILY;

  return { ...ORG_LABEL_DICTIONARY[family], isLoading };
}
