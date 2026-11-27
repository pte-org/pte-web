"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  PasswordInput,
  useSessionManager,
  useToast,
  validateNewPassword,
  type NewPasswordProblem,
} from "@pte/ui";
import { useChangePassword } from "../api";
import { getAuthFailureMessage } from "../authErrors";
import { AUTH_ROUTES } from "../constants";
import { useAuthCopy } from "../hooks/useAuthCopy";
import { resolveWorkspace } from "../resolveWorkspace";

export const ChangePasswordView = (): ReactElement => {
  const router = useRouter();
  const { passwordChange: PASSWORD_CHANGE_TEXT, firstPassword, locale, errorText } = useAuthCopy();
  const { session, saveSession, clearSession } = useSessionManager();
  // Still on a temporary password (e.g. after a reload): offer a way out instead of trapping the person here.
  const isSignInChange = Boolean(session?.mustChangePassword);
  const backToLogin = (): void => {
    clearSession();
    router.replace(AUTH_ROUTES.login);
  };
  const mutation = useChangePassword();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  // The problem, not its sentence, so the message follows a language switch made after it appeared.
  const [problem, setProblem] = useState<NewPasswordProblem>();
  const [serverError, setServerError] = useState<string>();
  const problemText: Record<NewPasswordProblem, string> = {
    REQUIRED: PASSWORD_CHANGE_TEXT.REQUIRED,
    TOO_SHORT: PASSWORD_CHANGE_TEXT.TOO_SHORT,
    EDGE_SPACES: PASSWORD_CHANGE_TEXT.EDGE_SPACES,
    TOO_LONG: PASSWORD_CHANGE_TEXT.TOO_LONG,
    MISMATCH: PASSWORD_CHANGE_TEXT.MISMATCH,
  };
  const formError = problem ? problemText[problem] : serverError;
  const homeRoute = resolveWorkspace(session?.roles ?? []).defaultRoute || AUTH_ROUTES.login;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const found = currentPassword ? validateNewPassword(newPassword, confirmation) : "REQUIRED";
    if (found) {
      setProblem(found);
      setServerError(undefined);
      return;
    }
    setProblem(undefined);
    setServerError(undefined);
    try {
      await mutation.mutateAsync({
        currentPassword,
        newPassword,
        refreshToken: session?.refreshToken,
      });
      if (session) saveSession({ ...session, mustChangePassword: false });
      showToast(isSignInChange ? PASSWORD_CHANGE_TEXT.SUCCESS : PASSWORD_CHANGE_TEXT.SUCCESS_VOLUNTARY, { tone: "success" });
      router.replace(homeRoute);
    } catch (error) {
      setServerError(
        getAuthFailureMessage(error, PASSWORD_CHANGE_TEXT.FAILED, locale, errorText, {
          required: PASSWORD_CHANGE_TEXT.REQUIRED,
          tooShort: PASSWORD_CHANGE_TEXT.TOO_SHORT,
          edgeSpaces: PASSWORD_CHANGE_TEXT.EDGE_SPACES,
          tooLong: PASSWORD_CHANGE_TEXT.TOO_LONG,
        }),
      );
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink-primary)]">{PASSWORD_CHANGE_TEXT.TITLE}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-secondary)]">
            {isSignInChange ? PASSWORD_CHANGE_TEXT.SUBTITLE : PASSWORD_CHANGE_TEXT.VOLUNTARY_SUBTITLE}
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
        {!isSignInChange && (
          <Button type="button" variant="secondary" fullWidth onClick={() => router.replace(homeRoute)}>
            {PASSWORD_CHANGE_TEXT.CANCEL}
          </Button>
        )}
      </form>
      {isSignInChange && (
        <button
          type="button"
          onClick={backToLogin}
          className="self-center text-sm font-semibold text-[var(--brand-ink)] hover:underline"
        >
          {firstPassword.backToLogin}
        </button>
      )}
    </>
  );
};
