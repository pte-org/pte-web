"use client";

import { useState } from "react";
import type { OrganizationResponse } from "@pte/api-client";
import {
  Badge,
  Button,
  DescriptionList,
  EmptyState,
  PencilIcon,
  ProfileAccountPanel,
  useLocale,
  useToast,
} from "@pte/ui";
import { PROFILE_LABEL_KEYS, PROFILE_TEXT } from "../constants";
import { OrganizationProfileEditor } from "./OrganizationProfileEditor";

interface OrganizationProfileTabProps {
  organizations: OrganizationResponse[];
  organizationType: string | null;
}

type LabelEntry = { key: string; fallback: string };

const getLocalizedValue = (
  value: string | null | undefined,
  labels: Record<string, LabelEntry>,
  translate: (key: string, fallback: string) => string,
  fallback: string,
): string => {
  const normalized = value?.trim().toUpperCase();
  if (!normalized) return fallback;
  const entry = labels[normalized];
  return entry ? translate(entry.key, entry.fallback) : value ?? fallback;
};

const OrganizationDetails = ({
  organization,
  organizationType,
}: {
  organization: OrganizationResponse;
  organizationType: string | null;
}): React.ReactElement => {
  const { t } = useLocale();
  const emptyValue = t("common.emptyValue", "—");
  const statusLabel = organization.status === "ACTIVE"
    ? t("tenant.profile.status.active", PROFILE_TEXT.status.active)
    : t("tenant.profile.status.suspended", PROFILE_TEXT.status.suspended);
  const statusVariant = organization.status === "ACTIVE" ? "success" : "warning";

  return (
    <DescriptionList
      variant="inline"
      items={[
        {
          label: t("tenant.profile.organization.name", PROFILE_TEXT.organization.name),
          value: organization.name || emptyValue,
        },
        {
          label: t("tenant.profile.organization.type", PROFILE_TEXT.organization.type),
          value: getLocalizedValue(
            organizationType,
            PROFILE_LABEL_KEYS.organizationTypes,
            t,
            emptyValue,
          ),
        },
        {
          label: t(
            "tenant.profile.organization.facilityType",
            PROFILE_TEXT.organization.facilityType,
          ),
          value: getLocalizedValue(
            organization.facilityType,
            PROFILE_LABEL_KEYS.facilityTypes,
            t,
            emptyValue,
          ),
        },
        {
          label: t("tenant.profile.organization.province", PROFILE_TEXT.organization.province),
          value: organization.provinceName || organization.provinceCode || emptyValue,
        },
        {
          label: t("tenant.profile.organization.ward", PROFILE_TEXT.organization.ward),
          value: organization.wardName || organization.wardCode || emptyValue,
        },
        {
          label: t(
            "tenant.profile.organization.addressDetail",
            PROFILE_TEXT.organization.addressDetail,
          ),
          value: organization.address || emptyValue,
        },
        {
          label: t("tenant.profile.organization.status", PROFILE_TEXT.organization.status),
          value: <Badge variant={statusVariant}>{statusLabel}</Badge>,
        },
      ]}
    />
  );
};

export const OrganizationProfileTab = ({
  organizations,
  organizationType,
}: OrganizationProfileTabProps): React.ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const text = PROFILE_TEXT.organization;
  const [editing, setEditing] = useState(false);
  const organization = organizations[0];

  return (
    <ProfileAccountPanel
      title={t("tenant.profile.organization.title", text.title)}
      description={t("tenant.profile.organization.description", text.description)}
      actions={organization && !editing && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<PencilIcon className="h-4 w-4" />}
          onClick={() => setEditing(true)}
        >
          {t("tenant.profile.organization.edit", text.edit)}
        </Button>
      )}
    >
      {organizations.length === 0 ? (
        <EmptyState
          title={t("tenant.profile.organization.emptyTitle", text.emptyTitle)}
          description={t("tenant.profile.organization.emptyDescription", text.emptyDescription)}
        />
      ) : organizations.length === 1 ? (
        editing ? (
          <OrganizationProfileEditor
            organization={organization}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              showToast(t("tenant.profile.organization.saved", text.saved), { tone: "success" });
            }}
          />
        ) : (
          <OrganizationDetails organization={organization} organizationType={organizationType} />
        )
      ) : (
        <div className="flex flex-col gap-5">
          {organizations.map((organization) => (
            <section
              key={organization.publicId}
              className="rounded-lg border border-[var(--shell-border)] p-4"
            >
              <h3 className="mb-4 text-sm font-semibold text-[var(--ink-primary)]">
                {organization.name}
              </h3>
              <OrganizationDetails
                organization={organization}
                organizationType={organizationType}
              />
            </section>
          ))}
        </div>
      )}
    </ProfileAccountPanel>
  );
};
