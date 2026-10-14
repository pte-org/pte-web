"use client";

import { useState, type ReactElement } from "react";
import type { CurrentUser } from "@pte/api-client";
import {
  Button,
  DescriptionList,
  PencilIcon,
  ProfileAccountPanel,
  StatusBadge,
  useLocale,
  useToast,
} from "@pte/ui";
import { PROFILE_LABEL_KEYS, PROFILE_TEXT } from "../constants";
import { PersonalProfileEditor } from "./PersonalProfileEditor";

interface PersonalProfileTabProps {
  user: CurrentUser;
}

export const PersonalProfileTab = ({ user }: PersonalProfileTabProps): ReactElement => {
  const { locale, t } = useLocale();
  const { showToast } = useToast();
  const text = PROFILE_TEXT.personal;
  const [editing, setEditing] = useState(false);
  const emptyValue = t("common.emptyValue", "—");
  const dateOfBirth = user.dateOfBirth
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US").format(
        new Date(`${user.dateOfBirth}T00:00:00`),
      )
    : emptyValue;
  const roles = user.roles.length > 0
    ? user.roles.map((role) => {
        const normalized = role.trim().toUpperCase() as keyof typeof PROFILE_LABEL_KEYS.roles;
        const label = PROFILE_LABEL_KEYS.roles[normalized];
        return label ? t(label.key, label.fallback) : role;
      }).join(", ")
    : emptyValue;
  const statusLabel = user.status === "ACTIVE"
    ? t("tenant.profile.status.active", PROFILE_TEXT.status.active)
    : t("tenant.profile.status.suspended", PROFILE_TEXT.status.suspended);

  return (
    <ProfileAccountPanel
      title={t("tenant.profile.personal.title", text.title)}
      description={t("tenant.profile.personal.description", text.description)}
      actions={!editing && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<PencilIcon className="h-4 w-4" />}
          onClick={() => setEditing(true)}
        >
          {t("tenant.profile.personal.edit", text.edit)}
        </Button>
      )}
    >
      {editing ? (
        <PersonalProfileEditor
          user={user}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            showToast(t("tenant.profile.personal.saved", text.saved), { tone: "success" });
          }}
        />
      ) : (
        <DescriptionList
          variant="inline"
          items={[
            {
              label: t("tenant.profile.personal.fullName", text.fullName),
              value: user.fullName || emptyValue,
            },
            {
              label: t("tenant.profile.personal.email", text.email),
              value: user.email || emptyValue,
            },
            {
              label: t("tenant.profile.personal.phone", text.phone),
              value: user.phone || emptyValue,
            },
            {
              label: t("tenant.profile.personal.dateOfBirth", text.dateOfBirth),
              value: dateOfBirth,
            },
            {
              label: t("tenant.profile.personal.role", text.role),
              value: roles,
            },
            {
              label: t("tenant.profile.personal.status", text.status),
              value: <StatusBadge label={statusLabel} variant={user.status === "ACTIVE" ? "success" : "warning"} />,
            },
          ]}
        />
      )}
    </ProfileAccountPanel>
  );
};
