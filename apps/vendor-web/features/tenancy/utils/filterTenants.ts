import type { Tenant, TenantFilter } from "../types";

/** Client-side search + status filter for the tenant list. */
export function filterTenants(
  tenants: Tenant[],
  filter: TenantFilter,
): Tenant[] {
  const query = filter.query.trim().toLowerCase();
  return tenants.filter((tenant) => {
    const matchesStatus =
      filter.status === "all" || tenant.status === filter.status;
    const matchesQuery =
      query === "" ||
      tenant.name.toLowerCase().includes(query) ||
      tenant.slug.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });
}
