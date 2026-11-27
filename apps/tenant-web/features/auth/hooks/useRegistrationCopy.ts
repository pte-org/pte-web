"use client";

import { useLocale } from "@pte/ui";
import {
  REGISTRATION_ORGANIZATION_TYPES,
  REGISTRATION_TEXT,
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_PLACEHOLDER,
  type RegistrationText,
} from "../constants";
import {
  REGISTRATION_ORGANIZATION_TYPES_VI,
  REGISTRATION_TEXT_VI,
} from "../registrationVietnamese";

interface RegistrationCopy {
  text: RegistrationText;
  organizationTypes: typeof REGISTRATION_ORGANIZATION_TYPES;
}

const withSupportEmail = (text: RegistrationText): RegistrationText =>
  Object.fromEntries(
    Object.entries(text).map(([key, value]) => [
      key,
      value.replaceAll(SUPPORT_EMAIL_PLACEHOLDER, SUPPORT_EMAIL),
    ]),
  ) as RegistrationText; // same keys as the input, only the string values change

export const useRegistrationCopy = (): RegistrationCopy => {
  const { locale } = useLocale();
  return locale === "vi"
    ? { text: withSupportEmail(REGISTRATION_TEXT_VI), organizationTypes: REGISTRATION_ORGANIZATION_TYPES_VI }
    : { text: withSupportEmail(REGISTRATION_TEXT), organizationTypes: REGISTRATION_ORGANIZATION_TYPES };
};
