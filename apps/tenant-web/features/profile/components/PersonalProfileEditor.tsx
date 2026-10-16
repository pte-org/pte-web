"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { CurrentUser } from "@pte/api-client";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Alert, Button, Input, useLocale } from "@pte/ui";
import { useUpdateOwnProfile } from "../api";
import { PROFILE_TEXT } from "../constants";

interface PersonalProfileEditorProps {
  user: CurrentUser;
  onCancel: () => void;
  onSaved: () => void;
}

interface PersonalProfileForm {
  fullName: string;
  phone: string;
  dateOfBirth: string;
}

const formFromUser = (user: CurrentUser): PersonalProfileForm => ({
  fullName: user.fullName ?? "",
  phone: user.phone ?? "",
  dateOfBirth: user.dateOfBirth ?? "",
});

export const PersonalProfileEditor = ({
  user,
  onCancel,
  onSaved,
}: PersonalProfileEditorProps): ReactElement => {
  const { t } = useLocale();
  const update = useUpdateOwnProfile();
  const text = PROFILE_TEXT.personal;
  const [form, setForm] = useState<PersonalProfileForm>(() => formFromUser(user));
  const [validationError, setValidationError] = useState<string | null>(null);
  const original = useMemo(() => formFromUser(user), [user]);
  const error = update.error
    ? getUserFacingApiErrorMessage(update.error, t("tenant.profile.personal.saveFailed", text.saveFailed))
    : null;
  const isDirty = JSON.stringify(form) !== JSON.stringify(original);
  const updateField = (field: keyof PersonalProfileForm, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError(null);
  };
  const save = (): void => {
    const fullName = form.fullName.trim();
    if (!fullName) {
      setValidationError(t("tenant.profile.personal.fullNameRequired", text.fullNameRequired));
      return;
    }
    update.mutate(
      {
        fullName,
        phone: form.phone.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
      },
      { onSuccess: onSaved },
    );
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label={t("tenant.profile.personal.fullName", text.fullName)}
          value={form.fullName}
          disabled={update.isPending}
          onChange={(event) => updateField("fullName", event.target.value)}
        />
        <Input
          label={t("tenant.profile.personal.email", text.email)}
          type="email"
          value={user.email || ""}
          disabled
        />
        <Input
          label={t("tenant.profile.personal.phone", text.phone)}
          type="tel"
          value={form.phone}
          disabled={update.isPending}
          onChange={(event) => updateField("phone", event.target.value)}
        />
        <Input
          label={t("tenant.profile.personal.dateOfBirth", text.dateOfBirth)}
          type="date"
          value={form.dateOfBirth}
          disabled={update.isPending}
          onChange={(event) => updateField("dateOfBirth", event.target.value)}
        />
      </div>
      {validationError && <Alert tone="error">{validationError}</Alert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" disabled={update.isPending} onClick={onCancel}>
          {t("tenant.profile.personal.cancel", text.cancel)}
        </Button>
        <Button type="submit" disabled={!isDirty} isLoading={update.isPending}>
          {t("tenant.profile.personal.save", text.save)}
        </Button>
      </div>
    </form>
  );
};
