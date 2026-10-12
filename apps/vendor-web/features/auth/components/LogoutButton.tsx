"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button, useLocale, useTokenManager } from "@pte/ui";
import { AUTH_ROUTES } from "../constants";

export const LogoutButton = (): ReactElement => {
  const router = useRouter();
  const { clearToken } = useTokenManager();
  const { t } = useLocale();

  const handleLogout = (): void => {
    clearToken();
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      {t("common.logout", "Log out")}
    </Button>
  );
};
