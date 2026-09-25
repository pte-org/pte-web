import { CREATE_TENANT_CONFLICT_TEXT } from "../constants";
import type { CreateTenantInput, Tenant } from "../types";

function normalizeComparable(value: string): string {
  return value.trim().toLowerCase();
}

export function validateCreateConflict(
  input: CreateTenantInput,
  tenants: Tenant[],
): string | undefined {
  const code = normalizeComparable(input.code);
  const name = normalizeComparable(input.name);

  if (tenants.some((tenant) => normalizeComparable(tenant.code) === code)) {
    return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_CODE;
  }
  if (tenants.some((tenant) => normalizeComparable(tenant.name) === name)) {
    return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_NAME;
  }

  return undefined;
}
