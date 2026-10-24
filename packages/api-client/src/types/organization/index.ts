/** Matches the API's `FacilityType` enum. */
export type FacilityType = "MAIN" | "BRANCH" | "TEST_CENTER";

/** An organization starts PENDING as an application; platform operators only ever see ACTIVE or SUSPENDED ones. */
export type OrganizationStatusResponse = "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";

/**
 * Matches the API's merged `OrganizationResponse`: the tenant governance fields platform operators use and the
 * profile fields its Host edits. `publicId` is the identifier other APIs call the tenant id.
 */
export interface OrganizationResponse {
  publicId: string;
  code: string;
  name: string;
  organizationType: string;
  taxCode: string | null;
  status: OrganizationStatusResponse;
  suspendedUntil: string | null;
  packageName: string;
  studentLimit: number;
  logoUrl: string | null;
  primaryColor: string | null;
  address: string | null;
  provinceCode: string | null;
  provinceName: string | null;
  wardCode: string | null;
  wardName: string | null;
  facilityType: FacilityType;
}

export interface UpdateOrganizationProfileRequest {
  name: string;
  address: string | null;
  provinceCode: string | null;
  wardCode: string | null;
  facilityType: FacilityType;
}
