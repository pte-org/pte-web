"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "@pte/ui";
import { useRequestPasswordReset } from "../api";
import { AUTH_ROUTES, FORGOT_PASSWORD_TEXT, PASSWORD_RESET_LINKS } from "../constants";

/** Page content only: the frame (artwork, backdrop, toolbar) comes from the `(portal)` layout. */
export const ForgotPasswordView = (): ReactElement => {
  const request = useRequestPasswordReset();

  return (
    <ForgotPasswordForm
      text={FORGOT_PASSWORD_TEXT}
      onSubmit={(email) => request.mutateAsync({ email })}
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
