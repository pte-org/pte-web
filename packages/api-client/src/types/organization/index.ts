/** Matches admin's real `FacilityType` enum. */
export type FacilityType = "MAIN" | "BRANCH" | "TEST_CENTER";

/** Matches admin's real `OrganizationStatus` enum — independent of the parent Tenant's status. */
export type OrganizationStatusResponse = "ACTIVE" | "SUSPENDED";

/** Matches admin's real `OrganizationResponse` record exactly. */
export interface OrganizationResponse {
  publicId: string;
  tenantPublicId: string;
  name: string;
  address: string | null;
  provinceCode: string | null;
  provinceName: string | null;
  wardCode: string | null;
  wardName: string | null;
  facilityType: FacilityType;
  status: OrganizationStatusResponse;
}

export interface UpdateOrganizationProfileRequest {
  name: string;
  address: string | null;
  provinceCode: string | null;
  wardCode: string | null;
  facilityType: FacilityType;
}
