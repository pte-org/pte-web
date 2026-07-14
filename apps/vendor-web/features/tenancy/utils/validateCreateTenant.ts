import { CREATE_TENANT_ERRORS } from "../constants";
import type { CreateTenantErrors, CreateTenantInput } from "../types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate the create-tenant form; returns a message per invalid field. */
export function validateCreateTenant(
  input: CreateTenantInput,
): CreateTenantErrors {
  const errors: CreateTenantErrors = {};

  if (!input.name.trim()) errors.name = CREATE_TENANT_ERRORS.REQUIRED;

  if (!input.slug.trim()) {
    errors.slug = CREATE_TENANT_ERRORS.REQUIRED;
  } else if (!SLUG_PATTERN.test(input.slug.trim())) {
    errors.slug = CREATE_TENANT_ERRORS.SLUG_INVALID;
  }

  if (!input.plan) errors.plan = CREATE_TENANT_ERRORS.REQUIRED;
  if (!input.location) errors.location = CREATE_TENANT_ERRORS.REQUIRED;
  if (!input.expiresAt) errors.expiresAt = CREATE_TENANT_ERRORS.REQUIRED;
  if (!input.contactName.trim())
    errors.contactName = CREATE_TENANT_ERRORS.REQUIRED;
  if (!input.contactPhone.trim())
    errors.contactPhone = CREATE_TENANT_ERRORS.REQUIRED;

  if (!input.contactEmail.trim()) {
    errors.contactEmail = CREATE_TENANT_ERRORS.REQUIRED;
  } else if (!EMAIL_PATTERN.test(input.contactEmail.trim())) {
    errors.contactEmail = CREATE_TENANT_ERRORS.EMAIL_INVALID;
  }

  return errors;
}
