"use client";

import { useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Button,
  DashboardLoadingState,
  ErrorState,
  PageHeader,
  ProfileLayout,
  TabPanel,
  useLocale,
} from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { useMyOrganizations } from "@/features/programs/api";
import { PROFILE_TAB_IDS, PROFILE_TEXT, type ProfileTabId } from "../constants";
import { OrganizationProfileTab } from "./OrganizationProfileTab";
import { PersonalProfileTab } from "./PersonalProfileTab";

export const ProfileView = (): ReactElement => {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<ProfileTabId>(PROFILE_TAB_IDS.organization);
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

  const tabs = [
    {
      id: PROFILE_TAB_IDS.organization,
      label: t("tenant.profile.tabs.organization", PROFILE_TEXT.tabs.organization),
    },
    {
      id: PROFILE_TAB_IDS.personal,
      label: t("tenant.profile.tabs.personal", PROFILE_TEXT.tabs.personal),
    },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t("tenant.profile.title", PROFILE_TEXT.title)} />
      <ProfileLayout
        id="tenant-profile-tabs"
        items={tabs}
        value={activeTab}
        ariaLabel={t("tenant.profile.tabs.ariaLabel", PROFILE_TEXT.tabs.ariaLabel)}
        onChange={(value) => {
          if (value === PROFILE_TAB_IDS.organization || value === PROFILE_TAB_IDS.personal) {
            setActiveTab(value);
          }
        }}
      >
        <TabPanel
          id="tenant-profile-tabs-panel-organization"
          labelledBy="tenant-profile-tabs-tab-organization"
          active={activeTab === PROFILE_TAB_IDS.organization}
          className="mt-6"
        >
          <OrganizationProfileTab
            organizations={organizations.data ?? []}
            organizationType={currentUser.data.organizationType}
          />
        </TabPanel>
        <TabPanel
          id="tenant-profile-tabs-panel-personal"
          labelledBy="tenant-profile-tabs-tab-personal"
          active={activeTab === PROFILE_TAB_IDS.personal}
          className="mt-6"
        >
          <PersonalProfileTab user={currentUser.data} />
        </TabPanel>
      </ProfileLayout>
    </div>
  );
};
