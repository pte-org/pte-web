import { CREATE_ORGANIZATION_ERRORS } from "../constants";
import type { CreateOrganizationErrors, CreateOrganizationInput } from "../types";

export function validateCreateOrganization(
  input: CreateOrganizationInput,
): CreateOrganizationErrors {
  const errors: CreateOrganizationErrors = {};

  if (!input.name.trim()) errors.name = CREATE_ORGANIZATION_ERRORS.REQUIRED;
  if (!input.facilityType) errors.facilityType = CREATE_ORGANIZATION_ERRORS.REQUIRED;

  return errors;
}
