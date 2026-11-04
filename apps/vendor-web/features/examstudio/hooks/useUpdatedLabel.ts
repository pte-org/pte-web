"use client";

import { useLocale } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";
import { formatRelativeTime } from "../relativeTime";

/** "Updated 3 hours ago" for an ISO time; undefined when there is no time to show. */
export function useUpdatedLabel(): (iso: string | null | undefined) => string | undefined {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { locale } = useLocale();
  return (iso) =>
    iso ? text.UPDATED.replace("{time}", formatRelativeTime(iso, new Date(), locale)) : undefined;
}
