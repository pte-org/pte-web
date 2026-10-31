"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useAdminCopy } from "../../i18n/adminCopy";
import { useConfirmPasswordReset } from "../api";
import { AUTH_ROUTES, PASSWORD_RESET_LINKS, RESET_PASSWORD_TEXT } from "../constants";

const TOKEN_PARAM = "token";

/** Page content only: the frame (artwork, backdrop, toolbar) comes from the `(portal)` layout. */
export const ResetPasswordView = (): ReactElement => {
  const router = useRouter();
  const token = useSearchParams().get(TOKEN_PARAM)?.trim() ?? "";
  const confirm = useConfirmPasswordReset();
  const text = useAdminCopy(RESET_PASSWORD_TEXT);
  const links = useAdminCopy(PASSWORD_RESET_LINKS);
  const [error, setError] = useState<string>();

  const handleSubmit = async (newPassword: string): Promise<void> => {
    setError(undefined);
    try {
      await confirm.mutateAsync({ token, newPassword });
      router.replace(AUTH_ROUTES.login);
    } catch (failure) {
      setError(getUserFacingApiErrorMessage(failure, text.failed));
    }
  };

  const needsNewLink = Boolean(error) || !token;

  return (
    <ResetPasswordForm
      text={text}
      hasToken={token.length > 0}
      onSubmit={handleSubmit}
      error={error}
      footer={
        <Link
          href={needsNewLink ? AUTH_ROUTES.forgotPassword : AUTH_ROUTES.login}
          className="text-sm font-semibold text-[var(--brand-ink)] hover:underline"
        >
          {needsNewLink ? links.REQUEST_NEW_LINK : links.BACK_TO_LOGIN}
        </Link>
      }
    />
  );
};
