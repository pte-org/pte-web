"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "@pte/ui";
import { useRequestPasswordReset } from "../api";
import { AUTH_ROUTES } from "../constants";
import { useAuthCopy } from "../hooks/useAuthCopy";

/** Page content only: the frame (artwork, backdrop, toolbar) comes from the `(portal)` layout. */
export const ForgotPasswordView = (): ReactElement => {
  const request = useRequestPasswordReset();
  const { forgot: FORGOT_PASSWORD_TEXT, links: PASSWORD_RESET_LINKS } = useAuthCopy();

  return (
    <ForgotPasswordForm
      text={FORGOT_PASSWORD_TEXT}
      onSubmit={(email, username) => request.mutateAsync({ email, username })}
      footer={
        <Link
          href={AUTH_ROUTES.login}
          className="text-sm font-semibold text-[var(--brand-ink)] hover:underline"
        >
          {PASSWORD_RESET_LINKS.BACK_TO_LOGIN}
        </Link>
      }
    />
  );
};
