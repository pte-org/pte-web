import type {
  LicenseGrantPreviewResponse,
  LicenseGrantRequest,
  LicenseGrantResponse,
  OrganizationResponse,
  PagedResult,
  PlanResponse,
} from "@pte/api-client";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import type { GrantStepId } from "./constants";

export interface GrantFieldErrors {
  plan?: boolean;
  contract?: boolean;
}

export type GrantMutation = UseMutationResult<
  LicenseGrantResponse,
  unknown,
  { payload: LicenseGrantRequest; idempotencyKey: string }
>;

/** View model of the three-step grant wizard. */
export interface GrantLicenseFlow {
  step: GrantStepId;
  search: string;
  setSearch: (value: string) => void;
  tenantSearch: UseQueryResult<PagedResult<OrganizationResponse>>;
  setTenantPage: (page: number) => void;
  searchPending: boolean;
  tenant: OrganizationResponse | null;
  selectTenant: (tenant: OrganizationResponse) => void;
  activePlans: PlanResponse[];
  plansLoading: boolean;
  selectedPlan: PlanResponse | null;
  examPackage: boolean;
  planId: string;
  selectPlan: (planId: string) => void;
  /** The day shown in the date input: the admin's pick, or the server default. */
  chosenDay: string;
  setStartDay: (day: string) => void;
  contractReference: string;
  setContractReference: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  errors: GrantFieldErrors;
  preview: UseQueryResult<LicenseGrantPreviewResponse>;
  grant: GrantMutation;
  goNext: () => void;
  goBack: () => void;
  submit: () => Promise<void>;
  reset: () => void;
}
