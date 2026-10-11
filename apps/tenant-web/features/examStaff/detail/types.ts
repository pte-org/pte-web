import type { StaffPublicationStatus, StaffSessionStatus, StaffWorkspaceQuery } from "@pte/api-client";

export type StaffDetailTab = "overview" | "proctor" | "examiner" | "account";

export interface StaffFilterDraft {
  fromDate: string;
  toDate: string;
  sessionPublicId: string;
  sessionStatus: StaffSessionStatus | "ALL";
  publicationStatus: StaffPublicationStatus | "ALL";
}

export interface StaffProfileForm {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export interface StaffFilterState {
  draft: StaffFilterDraft;
  applied: StaffWorkspaceQuery;
  page: number;
  revision: number;
  invalidDates: boolean;
  change: (patch: Partial<StaffFilterDraft>) => void;
  apply: () => void;
  clear: () => void;
  setPage: (page: number) => void;
}
