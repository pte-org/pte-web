import { TENANT_DETAIL_TEXT } from "../constants";
import type { BrandingInput } from "../types";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/** Per-field validation messages; a field is absent when it is valid. */
export type BrandingErrors = Partial<Record<keyof BrandingInput, string>>;

/** Mirrors the backend's `^#[0-9A-Fa-f]{6}$` constraint on `primaryColor` (both fields are optional). */
export function validateBranding(input: BrandingInput): BrandingErrors {
  const errors: BrandingErrors = {};

  if (input.primaryColor.trim() && !HEX_COLOR_PATTERN.test(input.primaryColor.trim())) {
    errors.primaryColor = TENANT_DETAIL_TEXT.PRIMARY_COLOR_INVALID;
  }

  return errors;
}
