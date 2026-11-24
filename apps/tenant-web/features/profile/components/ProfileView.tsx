"use client";

import type { ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Button, DashboardLoadingState, ErrorState, useLocale } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { useMyOrganizations } from "@/features/programs/api";
import { PROFILE_TEXT } from "../constants";
import { OrganizationProfileTab } from "./OrganizationProfileTab";
import { PersonalProfileTab } from "./PersonalProfileTab";

export const ProfileView = (): ReactElement => {
  const { t } = useLocale();
  const currentUser = useCurrentUser();
  const organizations = useMyOrganizations();
  const retry = (): void => {
    void currentUser.refetch();
    void organizations.refetch();
  };

  if (currentUser.isPending || organizations.isPending) {
    return <DashboardLoadingState variant="detail" label={t("tenant.profile.loading", PROFILE_TEXT.loading)} />;
  }

  if (currentUser.isError || organizations.isError || !currentUser.data) {
    const error = currentUser.error ?? organizations.error;
    return (
      <ErrorState
        title={t("tenant.profile.loadFailed", PROFILE_TEXT.loadFailed)}
        description={getUserFacingApiErrorMessage(
          error,
          t("tenant.profile.loadFailedDescription", PROFILE_TEXT.loadFailedDescription),
        )}
        action={<Button onClick={retry}>{t("common.retry", "Retry")}</Button>}
      />
    );
  }

  // The Host's organization and own account on one page: both are short, so a tab only added a click.
  return (
    <div className="flex flex-col gap-6">
      <OrganizationProfileTab
        organizations={organizations.data ?? []}
        organizationType={currentUser.data.organizationType}
      />
      <PersonalProfileTab user={currentUser.data} />
    </div>
  );
};
