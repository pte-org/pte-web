"use client";

import { useCallback, useState } from "react";

export type SignInField = "username" | "password";
export type SignInErrors = Partial<Record<SignInField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface SignInValidationMessages {
  usernameRequired: string;
  usernameInvalidEmail: string;
  passwordRequired: string;
}

export interface SignInValues {
  username: string;
  password: string;
}

/**
 * Field rules for sign-in: the username field takes an email address and must be a valid one.
 * No password length rule, so older short passwords still work.
 */
export const validateSignInField = (
  field: SignInField,
  value: string,
  messages: SignInValidationMessages,
): string | undefined => {
  if (field === "username") {
    const username = value.trim();
    if (!username) return messages.usernameRequired;
    if (!EMAIL_PATTERN.test(username)) return messages.usernameInvalidEmail;
    return undefined;
  }
  return value.length === 0 ? messages.passwordRequired : undefined;
};

export interface SignInValidation {
  errors: SignInErrors;
  /** Validate a field when it loses focus. */
  onBlur: (field: SignInField, value: string) => void;
  /** Validate while typing, so a mistake shows as soon as it is made. */
  onChange: (field: SignInField, value: string) => void;
  /** Validate every field (on submit); returns the errors so the caller can focus the first one. */
  validateAll: (values: SignInValues) => SignInErrors;
}

export const useSignInValidation = (messages: SignInValidationMessages): SignInValidation => {
  const [errors, setErrors] = useState<SignInErrors>({});

  const check = useCallback(
    (field: SignInField, value: string): string | undefined => {
      const error = validateSignInField(field, value, messages);
      setErrors((previous) => ({ ...previous, [field]: error }));
      return error;
    },
    [messages],
  );

  const onBlur = useCallback(
    (field: SignInField, value: string): void => {
      check(field, value);
    },
    [check],
  );

  const onChange = useCallback(
    (field: SignInField, value: string): void => {
      check(field, value);
    },
    [check],
  );

  const validateAll = useCallback(
    (values: SignInValues): SignInErrors => {
      return {
        username: check("username", values.username),
        password: check("password", values.password),
      };
    },
    [check],
  );

  return { errors, onBlur, onChange, validateAll };
};
