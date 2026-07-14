"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

interface LoginFormProps {
  /** Label for the first field, for example "Email" or "Username". */
  identifierLabel: string;
  identifierType?: "email" | "text";
  identifierAutoComplete?: string;
  onSubmit: (credentials: LoginCredentials) => void;
  isLoading?: boolean;
  /** Server-side error shown as an alert banner. */
  errorMessage?: string;
  submitLabel?: string;
}

const TEXT = {
  PASSWORD_LABEL: "Password",
  SUBMIT: "Log in",
  REQUIRED_SUFFIX: "is required",
} as const;

export const LoginForm = ({
  identifierLabel,
  identifierType = "email",
  identifierAutoComplete = "username",
  onSubmit,
  isLoading = false,
  errorMessage,
  submitLabel = TEXT.SUBMIT,
}: LoginFormProps): ReactElement => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const nextIdentifierError = identifier.trim()
      ? undefined
      : `${identifierLabel} ${TEXT.REQUIRED_SUFFIX}`;
    const nextPasswordError = password
      ? undefined
      : `${TEXT.PASSWORD_LABEL} ${TEXT.REQUIRED_SUFFIX}`;

    setIdentifierError(nextIdentifierError);
    setPasswordError(nextPasswordError);

    if (nextIdentifierError || nextPasswordError) return;

    onSubmit({ identifier: identifier.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {errorMessage && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}
      <Input
        label={identifierLabel}
        type={identifierType}
        autoComplete={identifierAutoComplete}
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        error={identifierError}
        disabled={isLoading}
      />
      <Input
        label={TEXT.PASSWORD_LABEL}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={passwordError}
        disabled={isLoading}
      />
      <Button type="submit" isLoading={isLoading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
};
