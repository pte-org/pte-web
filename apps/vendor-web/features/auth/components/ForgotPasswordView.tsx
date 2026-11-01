"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "@pte/ui";
import { useAdminCopy } from "../../i18n/adminCopy";
import { useRequestPasswordReset } from "../api";
import { AUTH_ROUTES, FORGOT_PASSWORD_TEXT, PASSWORD_RESET_LINKS } from "../constants";

/** Page content only: the frame (artwork, backdrop, toolbar) comes from the `(portal)` layout. */
export const ForgotPasswordView = (): ReactElement => {
  const request = useRequestPasswordReset();
  const text = useAdminCopy(FORGOT_PASSWORD_TEXT);
  const links = useAdminCopy(PASSWORD_RESET_LINKS);

  return (
    <ForgotPasswordForm
      text={text}
      onSubmit={(email) => request.mutateAsync({ email })}
      footer={
        <Link
          href={AUTH_ROUTES.login}
          className="text-sm font-semibold text-[var(--brand-ink)] hover:underline"
        >
          {links.BACK_TO_LOGIN}
        </Link>
      }
    />
  );
};
