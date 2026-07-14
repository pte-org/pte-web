export interface CreateHostRequest {
  code: string;
  name: string;
  organizationName: string;
  organizationType: string;
  address: string;
  representativeName: string;
  contactEmail: string;
  representativePhone: string;
  contractCode?: string;
  packageName?: string;
  studentLimit?: number;
  contractStartDate?: string;
  contractEndDate?: string;
}

export interface HostResponse extends CreateHostRequest {
  id: number;
  organizationId: number;
  createdAt: string;
  initialPassword: string;
}
