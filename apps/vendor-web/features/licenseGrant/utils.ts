import type { LicenseGrantRequest } from "@pte/api-client";
import { CONTRACT_DAY_START_SUFFIX, CONTRACT_TIME_ZONE, MAX_START_MONTHS } from "./constants";

/** `YYYY-MM-DD` for an instant as a Vietnam calendar day (the DateInput value format). */
export function toContractDay(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTRACT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** `dd/mm/yyyy` for display, as a Vietnam calendar day. */
export function formatContractDate(value: string | null): string {
  if (!value) return "";
  const [year, month, day] = toContractDay(value).split("-");
  return `${day}/${month}/${year}`;
}

/** The ISO start of a Vietnam calendar day, as the API expects a contract start. */
export function contractDayToIso(day: string): string {
  return `${day}${CONTRACT_DAY_START_SUFFIX}`;
}

/** Earliest and latest selectable contract day: today and six months ahead. */
export function startDayBounds(now: Date = new Date()): { min: string; max: string } {
  const min = toContractDay(now);
  const [year, month, day] = min.split("-").map(Number);
  const latest = new Date(Date.UTC(year, month - 1 + MAX_START_MONTHS, day));
  return { min, max: latest.toISOString().slice(0, 10) };
}

export interface GrantFormValues {
  tenantId: string;
  planId: string;
  /** The day the admin picked, or empty to keep the server default. */
  startDay: string;
  /** The day the server default falls on, so an untouched default is not sent back. */
  defaultStartDay: string;
  contractReference: string;
  note: string;
  examPackage: boolean;
}

/**
 * Sends `startsAt` only when the admin changed the day: an untouched default lets the server continue the
 * previous lane at its exact expiry instead of a rounded midnight.
 */
export function buildGrantRequest(values: GrantFormValues): LicenseGrantRequest {
  const changedStart =
    values.examPackage && values.startDay !== "" && values.startDay !== values.defaultStartDay;
  const note = values.note.trim();
  return {
    tenantId: values.tenantId,
    planId: values.planId,
    contractReference: values.contractReference.trim(),
    ...(changedStart ? { startsAt: contractDayToIso(values.startDay) } : {}),
    ...(note ? { note } : {}),
  };
}
