import { CREATE_TENANT_ERRORS } from "../constants";
import type { CreateTenantErrors, CreateTenantInput } from "../types";

const STUDENT_LIMIT_PATTERN = /^[1-9]\d*$/;
const TENANT_CODE_PATTERN = /^[a-z0-9-]{3,32}$/;

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
  if (!input.plan) errors.plan = CREATE_TENANT_ERRORS.REQUIRED;

  if (!input.studentLimit.trim()) {
    errors.studentLimit = CREATE_TENANT_ERRORS.REQUIRED;
  } else if (!STUDENT_LIMIT_PATTERN.test(input.studentLimit.trim())) {
    errors.studentLimit = CREATE_TENANT_ERRORS.STUDENT_LIMIT_INVALID;
  }

  return errors;
}
