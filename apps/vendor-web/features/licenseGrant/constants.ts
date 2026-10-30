import type { FacilityType } from "@pte/api-client";
import type { StepItem } from "@pte/ui";

export const TENANT_SEARCH_QUERY_KEY = (q: string) => ["license-grant", "tenant-search", q] as const;
export const LICENSE_GRANT_PREVIEW_QUERY_KEY = (tenantId: string, planId: string, startsAt: string) =>
  ["license-grant", "preview", tenantId, planId, startsAt] as const;

export const MIN_TENANT_SEARCH_LENGTH = 2;
/** Mirrors the API rule: a contract start may be at most six months ahead. */
export const MAX_START_MONTHS = 6;
/** Contract dates are calendar days in Vietnam, matching the API. */
export const CONTRACT_TIME_ZONE = "Asia/Ho_Chi_Minh";
export const CONTRACT_DAY_START_SUFFIX = "T00:00:00+07:00";
export const CONTRACT_REFERENCE_MAX_LENGTH = 64;
export const NOTE_MAX_LENGTH = 500;

export const GRANT_STEP_IDS = ["tenant", "confirm", "details", "preview"] as const;
export type GrantStepId = (typeof GRANT_STEP_IDS)[number];

export const GRANT_STEPS: StepItem[] = [
  { id: "tenant", label: "Organization" },
  { id: "confirm", label: "Confirm" },
  { id: "details", label: "Details" },
  { id: "preview", label: "Preview" },
];

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  MAIN: "Main",
  BRANCH: "Branch",
  TEST_CENTER: "Test center",
};

export const GRANT_TEXT = {
  TITLE: "Grant package",
  SEARCH_LABEL: "Find organization",
  SEARCH_PLACEHOLDER: "Organization code, tax code or contact email",
  SEARCH_HINT: "Type at least 2 characters to search.",
  SEARCH_EMPTY: "No organization matches this search.",
  SEARCH_INACTIVE: "Only active organizations can receive a package.",
  SEARCHING: "Searching...",
  SELECT: "Select",
  ORGANIZATION_NAME: "Organization name",
  ORGANIZATION_CODE: "Organization code",
  TAX_CODE: "Tax code",
  ADDRESS: "Address",
  FACILITY_TYPE: "Facility type",
  HOSTS: "Current hosts",
  NO_HOST: "No host account yet",
  CONFIRM_HINT: "Check the tax code against the paper contract before continuing.",
  PLAN_LABEL: "Plan",
  PLAN_PLACEHOLDER: "Select an active plan",
  START_LABEL: "Start date",
  START_HELP:
    "Pre-filled to continue the current package of this plan. Change it only to match the contract.",
  CONTRACT_LABEL: "Contract number",
  NOTE_LABEL: "Note",
  CONTRACT_REQUIRED: "Enter the contract number.",
  PLAN_REQUIRED: "Select a plan.",
  RUNS: "Runs",
  MAX_STUDENTS: "Max students per exam",
  SEATS_ADDED: "Student seats added",
  CONTINUES: "Continues",
  CAPACITY_WARNING: "Student capacity is permanent and cannot be revoked after it is granted.",
  SUCCESS: "Package granted.",
  ERROR: "The package could not be granted.",
  BACK: "Back",
  NEXT: "Continue",
  CANCEL: "Cancel",
  SUBMIT: "Grant package",
  SUBMITTING: "Granting package...",
  EMPTY_VALUE: "—",
} as const;
