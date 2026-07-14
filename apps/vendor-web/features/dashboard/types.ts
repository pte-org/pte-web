export interface AdminStats {
  totalTenants: string;
  totalTenantsTrend: string;
  totalTenantsProgress?: number;
  activeLearners: string;
  activeLearnersTrend: string;
  activeLearnersProgress?: number;
  expiringSoon: string;
  expiringSoonProgress?: number;
}
