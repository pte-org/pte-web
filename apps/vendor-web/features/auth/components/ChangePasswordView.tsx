"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, PasswordInput, useSessionManager } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useChangePassword } from "../api";
import {
  ADMIN_ROLES,
  AUTH_ROUTES,
  HOST_ROLES,
  PASSWORD_CHANGE_TEXT as RAW_PASSWORD_CHANGE_TEXT,
} from "../constants";

export const ChangePasswordView = (): ReactElement => {
  const T = useAdminCopy(RAW_PASSWORD_CHANGE_TEXT);
  const router = useRouter();
  const { session, saveSession } = useSessionManager();
  const mutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [formError, setFormError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmation) {
      setFormError(T.REQUIRED);
      return;
    }
    if (newPassword.length < 8) {
      setFormError(T.TOO_SHORT);
      return;
    }
    if (newPassword !== confirmation) {
      setFormError(T.MISMATCH);
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
      const destination = session?.roles.some((role) => ADMIN_ROLES.includes(role))
        ? AUTH_ROUTES.adminDashboard
        : session?.roles.some((role) => HOST_ROLES.includes(role))
          ? AUTH_ROUTES.hostDashboard
          : AUTH_ROUTES.login;
      router.replace(destination);
    } catch (error) {
      setFormError(getUserFacingApiErrorMessage(error, T.FAILED));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-5 rounded-lg bg-white p-8 shadow-card"
      >
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{T.TITLE}</h1>
          <p className="mt-1 text-sm text-gray-600">{T.SUBTITLE}</p>
        </div>
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="flex flex-col gap-4">
          <PasswordInput
            id="current-password"
            label={T.CURRENT_LABEL}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          <PasswordInput
            id="new-password"
            label={T.NEW_LABEL}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <PasswordInput
            id="confirm-new-password"
            label={T.CONFIRM_LABEL}
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>
        <Button type="submit" fullWidth isLoading={mutation.isPending} loadingText={T.SUBMITTING}>
          {T.SUBMIT}
        </Button>
      </form>
    </main>
  );
};
