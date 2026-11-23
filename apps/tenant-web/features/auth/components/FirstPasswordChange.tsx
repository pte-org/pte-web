"use client";

import { useState, type ReactElement } from "react";
import { ResetPasswordForm, useSessionManager, useToast } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useChangePassword } from "../api";
import { FIRST_PASSWORD_TEXT } from "../constants";

interface FirstPasswordChangeProps {
  /** The temporary password just used to sign in, so the person does not type it again. */
  currentPassword: string;
  onChanged: () => void;
  onBack: () => void;
}

/** Shown in place of the sign-in form when the account still has a temporary password. */
export const FirstPasswordChange = ({ currentPassword, onChanged, onBack }: FirstPasswordChangeProps): ReactElement => {
  const { session, saveSession } = useSessionManager();
  const mutation = useChangePassword();
  const { showToast } = useToast();
  const [error, setError] = useState<string>();

  const handleSubmit = async (newPassword: string): Promise<void> => {
    setError(undefined);
    try {
      await mutation.mutateAsync({ currentPassword, newPassword, refreshToken: session?.refreshToken });
      if (session) saveSession({ ...session, mustChangePassword: false });
      showToast(FIRST_PASSWORD_TEXT.success, { tone: "success" });
      onChanged();
    } catch (failure) {
      setError(getUserFacingApiErrorMessage(failure, FIRST_PASSWORD_TEXT.failed));
    }
  };

  return (
    <ResetPasswordForm
      text={FIRST_PASSWORD_TEXT}
      hasToken
      onSubmit={handleSubmit}
      error={error}
      footer={
        <button
          type="button"
          onClick={onBack}
          disabled={mutation.isPending}
          className="self-center text-sm font-semibold text-[var(--brand-ink)] hover:underline"
        >
          {FIRST_PASSWORD_TEXT.backToLogin}
        </button>
      }
    />
  );
};
