export type TenantStatusResponse = "ACTIVE" | "INACTIVE" | "LOCKED";

export interface TenantResponse {
  id: number;
  name: string;
  type: string;
  address: string | null;
  representativeName: string;
  representativeEmail: string;
  representativePhone: string;
  contractCode: string | null;
  packageName: string | null;
  studentLimit: number | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  status: TenantStatusResponse;
}
