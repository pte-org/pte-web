import type { Tenant, TenantFilter } from "../types";

/** Client-side search and tenant metadata filters for the tenant list. */
export function filterTenants(tenants: Tenant[], filter: TenantFilter): Tenant[] {
  const query = filter.query.trim().toLowerCase();
  return tenants.filter((tenant) => {
    const matchesStatus = filter.status === "all" || tenant.status === filter.status;
    const matchesPlan = filter.plan === "all" || tenant.plan === filter.plan;
    const matchesOrganizationType =
      filter.organizationType === "all" || tenant.organizationType === filter.organizationType;
    const matchesQuery =
      query === "" ||
      tenant.name.toLowerCase().includes(query) ||
      tenant.code.toLowerCase().includes(query) ||
      tenant.slug.toLowerCase().includes(query) ||
      tenant.taxCode?.toLowerCase().includes(query) === true;
    return matchesStatus && matchesPlan && matchesOrganizationType && matchesQuery;
  });
}
