import { CREATE_TENANT_ERRORS } from "../constants";
import type { CreateTenantErrors, CreateTenantInput } from "../types";

const TENANT_CODE_PATTERN = /^[a-z0-9-]{3,32}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate the create-tenant form; returns a message per invalid field. */
export function validateCreateTenant(input: CreateTenantInput): CreateTenantErrors {
  const errors: CreateTenantErrors = {};

  if (!input.code.trim()) {
    errors.code = CREATE_TENANT_ERRORS.REQUIRED;
  } else if (!TENANT_CODE_PATTERN.test(input.code.trim())) {
    errors.code = CREATE_TENANT_ERRORS.CODE_INVALID;
  }
  if (!input.name.trim()) errors.name = CREATE_TENANT_ERRORS.REQUIRED;
  if (!input.organizationType) errors.organizationType = CREATE_TENANT_ERRORS.REQUIRED;
  if (!input.taxCode.trim()) errors.taxCode = CREATE_TENANT_ERRORS.REQUIRED;

  if (!input.hostEmail.trim()) {
    errors.hostEmail = CREATE_TENANT_ERRORS.REQUIRED;
  } else if (!EMAIL_PATTERN.test(input.hostEmail.trim())) {
    errors.hostEmail = CREATE_TENANT_ERRORS.EMAIL_INVALID;
  }

  return errors;
}
