import type { ExamStaffAccountResponse, StaffWorkspaceQuery } from "@pte/api-client";
import type { Locale } from "@pte/ui";
import {
  STAFF_WORKSPACE_DATE_ERROR, STAFF_WORKSPACE_TIMEZONE, STAFF_WORKSPACE_UTC_OFFSET_MINUTES,
} from "./constants";
import type { StaffFilterDraft, StaffProfileForm } from "./types";

/** Convert a calendar date explicitly in the approved organization display zone. */
const dateBoundary = (value: string, nextDay: boolean): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(STAFF_WORKSPACE_DATE_ERROR);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (year < 1000 || utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1
    || utc.getUTCDate() !== day) throw new Error(STAFF_WORKSPACE_DATE_ERROR);
  if (nextDay) utc.setUTCDate(utc.getUTCDate() + 1);
  return new Date(utc.getTime() - STAFF_WORKSPACE_UTC_OFFSET_MINUTES * 60_000).toISOString();
};

export const staffFilterQuery = (draft: StaffFilterDraft): StaffWorkspaceQuery => {
  const from = draft.fromDate ? dateBoundary(draft.fromDate, false) : undefined;
  const to = draft.toDate ? dateBoundary(draft.toDate, true) : undefined;
  if (from && to && from >= to) throw new Error(STAFF_WORKSPACE_DATE_ERROR);
  return {
    from, to, sessionPublicId: draft.sessionPublicId || undefined,
    sessionStatus: draft.sessionStatus === "ALL" ? undefined : draft.sessionStatus,
    publicationStatus: draft.publicationStatus,
  };
};

export const formatStaffDate = (value: string | null, locale: Locale, empty: string): string =>
  value ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    timeZone: STAFF_WORKSPACE_TIMEZONE, dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value)) : empty;

export const staffScheduleDay = (value: string | null, locale: Locale, empty: string): string =>
  value ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    timeZone: STAFF_WORKSPACE_TIMEZONE, dateStyle: "full",
  }).format(new Date(value)) : empty;

export const staffProfileForm = (account: ExamStaffAccountResponse): StaffProfileForm => ({
  fullName: account.fullName ?? "", email: account.email ?? "",
  phone: account.phone ?? "", dateOfBirth: account.dateOfBirth ?? "",
});
