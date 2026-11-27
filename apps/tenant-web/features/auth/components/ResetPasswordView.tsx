"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordForm, resolveResetLinkState, useToast } from "@pte/ui";
import { useConfirmPasswordReset, useValidatePasswordResetToken } from "../api";
import { getAuthFailureMessage } from "../authErrors";
import { AUTH_ROUTES } from "../constants";
import { useAuthCopy } from "../hooks/useAuthCopy";

const TOKEN_PARAM = "token";

/** Page content only: the frame (artwork, backdrop, toolbar) comes from the `(portal)` layout. */
export const ResetPasswordView = (): ReactElement => {
  const router = useRouter();
  const { reset: RESET_PASSWORD_TEXT, links: PASSWORD_RESET_LINKS, locale, errorText } = useAuthCopy();
  const token = useSearchParams().get(TOKEN_PARAM)?.trim() ?? "";
  const check = useValidatePasswordResetToken(token);
  const confirm = useConfirmPasswordReset();
  const { showToast } = useToast();
  const linkState = resolveResetLinkState(token, check);
  const [error, setError] = useState<string>();

  const handleSubmit = async (newPassword: string): Promise<void> => {
    setError(undefined);
    try {
      await confirm.mutateAsync({ token, newPassword });
      showToast(PASSWORD_RESET_LINKS.RESET_DONE, { tone: "success" });
      router.replace(AUTH_ROUTES.login);
    } catch (failure) {
      setError(getAuthFailureMessage(failure, RESET_PASSWORD_TEXT.failed, locale, errorText, {
        required: RESET_PASSWORD_TEXT.required,
        tooShort: RESET_PASSWORD_TEXT.tooShort,
        edgeSpaces: RESET_PASSWORD_TEXT.edgeSpaces,
        tooLong: RESET_PASSWORD_TEXT.tooLong,
      }));
    }
  };

  const needsNewLink = Boolean(error) || linkState === "unusable";

  return (
    <ResetPasswordForm
      text={RESET_PASSWORD_TEXT}
      hasToken={linkState === "usable"}
      checking={linkState === "checking"}
      onSubmit={handleSubmit}
      error={error}
      footer={
        <Link
          href={needsNewLink ? AUTH_ROUTES.forgotPassword : AUTH_ROUTES.login}
          className="text-sm font-semibold text-[var(--brand-ink)] hover:underline"
        >
          {needsNewLink ? PASSWORD_RESET_LINKS.REQUEST_NEW_LINK : PASSWORD_RESET_LINKS.BACK_TO_LOGIN}
        </Link>
      }
    />
  );
};
