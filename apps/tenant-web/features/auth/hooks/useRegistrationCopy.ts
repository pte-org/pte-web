"use client";

import { useLocale } from "@pte/ui";
import {
  REGISTRATION_ORGANIZATION_TYPES,
  REGISTRATION_TEXT,
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

export const useRegistrationCopy = (): RegistrationCopy => {
  const { locale } = useLocale();
  return locale === "vi"
    ? { text: REGISTRATION_TEXT_VI, organizationTypes: REGISTRATION_ORGANIZATION_TYPES_VI }
    : { text: REGISTRATION_TEXT, organizationTypes: REGISTRATION_ORGANIZATION_TYPES };
};
