"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button, useTokenManager } from "@aptis/ui";
import { AUTH_ROUTES } from "../constants";

const LOGOUT_LABEL = "Log out";

export const LogoutButton = (): ReactElement => {
  const router = useRouter();
  const { clearToken } = useTokenManager();

  const handleLogout = (): void => {
    clearToken();
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      {LOGOUT_LABEL}
    </Button>
  );
};
