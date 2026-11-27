"use client";

import { useLocale, type ForgotPasswordFormText, type ResetPasswordFormText } from "@pte/ui";
import {
  AUTH_TEXT,
  FIRST_PASSWORD_TEXT,
  FORGOT_PASSWORD_TEXT,
  PASSWORD_CHANGE_TEXT,
  PASSWORD_RESET_LINKS,
  RESET_PASSWORD_TEXT,
  type AuthText,
  type PasswordChangeText,
  type PasswordResetLinks,
} from "../constants";
import {
  AUTH_ERROR_TEXT_VI,
  AUTH_TEXT_VI,
  FIRST_PASSWORD_TEXT_VI,
  FORGOT_PASSWORD_TEXT_VI,
  PASSWORD_CHANGE_TEXT_VI,
  PASSWORD_RESET_LINKS_VI,
  RESET_PASSWORD_TEXT_VI,
  type AuthErrorText,
} from "../authVietnamese";

export interface AuthCopy {
  locale: string;
  auth: AuthText;
  passwordChange: PasswordChangeText;
  firstPassword: ResetPasswordFormText & { failed: string; backToLogin: string; success: string };
  forgot: ForgotPasswordFormText;
  reset: ResetPasswordFormText & { failed: string };
  links: PasswordResetLinks;
  errorText: AuthErrorText;
}

/** The sign-in portal's copy in the language chosen with the language switch. */
export const useAuthCopy = (): AuthCopy => {
  const { locale } = useLocale();
  if (locale === "vi") {
    return {
      locale,
      auth: AUTH_TEXT_VI,
      passwordChange: PASSWORD_CHANGE_TEXT_VI,
      firstPassword: FIRST_PASSWORD_TEXT_VI,
      forgot: FORGOT_PASSWORD_TEXT_VI,
      reset: RESET_PASSWORD_TEXT_VI,
      links: PASSWORD_RESET_LINKS_VI,
      errorText: AUTH_ERROR_TEXT_VI,
    };
  }
  return {
    locale,
    auth: AUTH_TEXT,
    passwordChange: PASSWORD_CHANGE_TEXT,
    firstPassword: FIRST_PASSWORD_TEXT,
    forgot: FORGOT_PASSWORD_TEXT,
    reset: RESET_PASSWORD_TEXT,
    links: PASSWORD_RESET_LINKS,
    // English failures come from the shared API catalog; see getAuthFailureMessage.
    errorText: AUTH_ERROR_TEXT_VI,
  };
};
