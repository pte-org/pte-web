"use client";

import { useCallback, useMemo, useState } from "react";

export type SignInField = "username" | "password";
export type SignInErrors = Partial<Record<SignInField, string>>;

export interface SignInValidationMessages {
  usernameRequired: string;
  passwordRequired: string;
}

export interface SignInValues {
  username: string;
  password: string;
}

/**
 * Field rules for sign-in: the username field is required but not shaped — organization accounts use a
 * generated `{code}.{random}` username and platform accounts use their email, so no format is enforced.
 * No password length rule, so older short passwords still work.
 */
export const validateSignInField = (
  field: SignInField,
  value: string,
  messages: SignInValidationMessages,
): string | undefined => {
  if (field === "username") {
    return value.trim() ? undefined : messages.usernameRequired;
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

const messageFor = (field: SignInField, messages: SignInValidationMessages): string =>
  field === "username" ? messages.usernameRequired : messages.passwordRequired;

export const useSignInValidation = (messages: SignInValidationMessages): SignInValidation => {
  // Which fields are wrong, not the sentence, so a message follows a language switch made after it appeared.
  const [invalid, setInvalid] = useState<Partial<Record<SignInField, boolean>>>({});

  const errors = useMemo<SignInErrors>(() => {
    const shown: SignInErrors = {};
    for (const field of ["username", "password"] as const) {
      if (invalid[field]) shown[field] = messageFor(field, messages);
    }
    return shown;
  }, [invalid, messages]);

  const check = useCallback(
    (field: SignInField, value: string): string | undefined => {
      const error = validateSignInField(field, value, messages);
      setInvalid((previous) => ({ ...previous, [field]: error !== undefined }));
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
