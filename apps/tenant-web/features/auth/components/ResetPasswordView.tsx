"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useConfirmPasswordReset } from "../api";
import { AUTH_ROUTES, PASSWORD_RESET_LINKS, RESET_PASSWORD_TEXT } from "../constants";

const TOKEN_PARAM = "token";

/** Page content only: the frame (artwork, backdrop, toolbar) comes from the `(portal)` layout. */
export const ResetPasswordView = (): ReactElement => {
  const router = useRouter();
  const token = useSearchParams().get(TOKEN_PARAM)?.trim() ?? "";
  const confirm = useConfirmPasswordReset();
  const [error, setError] = useState<string>();

  const handleSubmit = async (newPassword: string): Promise<void> => {
    setError(undefined);
    try {
      await confirm.mutateAsync({ token, newPassword });
      router.replace(AUTH_ROUTES.login);
    } catch (failure) {
      setError(getUserFacingApiErrorMessage(failure, RESET_PASSWORD_TEXT.failed));
    }
  };

  const needsNewLink = Boolean(error) || !token;

  return (
    <ResetPasswordForm
      text={RESET_PASSWORD_TEXT}
      hasToken={token.length > 0}
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
