"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, PasswordInput, useSessionManager, useToast } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useChangePassword } from "../api";
import { AUTH_ROUTES, PASSWORD_CHANGE_TEXT } from "../constants";
import { resolveWorkspace } from "../resolveWorkspace";

export const ChangePasswordView = (): ReactElement => {
  const router = useRouter();
  const { session, saveSession } = useSessionManager();
  const mutation = useChangePassword();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [formError, setFormError] = useState<string>();
  // A forced change (temporary password) has nowhere to go back to; a voluntary one can be cancelled.
  const isForced = Boolean(session?.mustChangePassword);
  const homeRoute = resolveWorkspace(session?.roles ?? []).defaultRoute || AUTH_ROUTES.login;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmation) {
      setFormError(PASSWORD_CHANGE_TEXT.REQUIRED);
      return;
    }
    if (newPassword.length < 8) {
      setFormError(PASSWORD_CHANGE_TEXT.TOO_SHORT);
      return;
    }
    if (newPassword !== confirmation) {
      setFormError(PASSWORD_CHANGE_TEXT.MISMATCH);
      return;
    }
    setFormError(undefined);
    try {
      await mutation.mutateAsync({
        currentPassword,
        newPassword,
        refreshToken: session?.refreshToken,
      });
      if (session) saveSession({ ...session, mustChangePassword: false });
      showToast(isForced ? PASSWORD_CHANGE_TEXT.SUCCESS : PASSWORD_CHANGE_TEXT.SUCCESS_VOLUNTARY, { tone: "success" });
      router.replace(homeRoute);
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error, PASSWORD_CHANGE_TEXT.FAILED));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-5 rounded-lg bg-white p-8 shadow-card"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{PASSWORD_CHANGE_TEXT.TITLE}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {isForced ? PASSWORD_CHANGE_TEXT.SUBTITLE : PASSWORD_CHANGE_TEXT.VOLUNTARY_SUBTITLE}
          </p>
        </div>
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="flex flex-col gap-4">
          <PasswordInput
            id="current-password"
            label={PASSWORD_CHANGE_TEXT.CURRENT_LABEL}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <PasswordInput
            id="new-password"
            label={PASSWORD_CHANGE_TEXT.NEW_LABEL}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <PasswordInput
            id="confirm-new-password"
            label={PASSWORD_CHANGE_TEXT.CONFIRM_LABEL}
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
        <Button type="submit" fullWidth isLoading={mutation.isPending} loadingText={PASSWORD_CHANGE_TEXT.SUBMITTING}>
          {PASSWORD_CHANGE_TEXT.SUBMIT}
        </Button>
        {!isForced && (
          <Button type="button" variant="secondary" fullWidth onClick={() => router.replace(homeRoute)}>
            {PASSWORD_CHANGE_TEXT.CANCEL}
          </Button>
        )}
      </form>
    </main>
  );
};
