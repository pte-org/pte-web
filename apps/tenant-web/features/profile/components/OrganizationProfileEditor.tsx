"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { FacilityType, OrganizationResponse } from "@pte/api-client";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Alert, Button, Input, Select, useLocale } from "@pte/ui";
import { useUpdateMyOrganization } from "../api";
import { PROFILE_LABEL_KEYS, PROFILE_TEXT } from "../constants";
import { OrganizationLocationFields } from "./OrganizationLocationFields";

interface OrganizationProfileEditorProps {
  organization: OrganizationResponse;
  onCancel: () => void;
  onSaved: () => void;
}

interface OrganizationProfileForm {
  name: string;
  address: string;
  provinceCode: string;
  wardCode: string;
  facilityType: FacilityType;
}

const FACILITY_TYPES: readonly FacilityType[] = ["MAIN", "BRANCH", "TEST_CENTER"];

const formFromOrganization = (organization: OrganizationResponse): OrganizationProfileForm => ({
  name: organization.name,
  address: organization.address ?? "",
  provinceCode: organization.provinceCode ?? "",
  wardCode: organization.wardCode ?? "",
  facilityType: organization.facilityType,
});

export const OrganizationProfileEditor = ({
  organization,
  onCancel,
  onSaved,
}: OrganizationProfileEditorProps): ReactElement => {
  const { t } = useLocale();
  const update = useUpdateMyOrganization();
  const text = PROFILE_TEXT.organization;
  const [form, setForm] = useState<OrganizationProfileForm>(() => formFromOrganization(organization));
  const [validationError, setValidationError] = useState<string | null>(null);
  const original = useMemo(() => formFromOrganization(organization), [organization]);
  const error = update.error
    ? getUserFacingApiErrorMessage(update.error, t("tenant.profile.organization.saveFailed", text.saveFailed))
    : null;
  const isDirty = JSON.stringify(form) !== JSON.stringify(original);
  const facilityOptions = FACILITY_TYPES.map((value) => {
    const label = PROFILE_LABEL_KEYS.facilityTypes[value];
    return { value, label: t(label.key, label.fallback) };
  });
  const updateField = <K extends keyof OrganizationProfileForm>(
    field: K,
    value: OrganizationProfileForm[K],
  ): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setValidationError(null);
  };
  const updateProvince = (value: string): void => {
    setForm((current) => ({ ...current, provinceCode: value, wardCode: "" }));
    setValidationError(null);
  };
  const save = (): void => {
    const name = form.name.trim();
    if (!name) {
      setValidationError(t("tenant.profile.organization.nameRequired", text.nameRequired));
      return;
    }
    update.mutate(
      {
        publicId: organization.publicId,
        payload: {
          name,
          address: form.address.trim() || null,
          provinceCode: form.provinceCode || null,
          wardCode: form.wardCode || null,
          facilityType: form.facilityType,
        },
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
          label={t("tenant.profile.organization.name", text.name)}
          value={form.name}
          disabled={update.isPending}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <Select
          label={t("tenant.profile.organization.facilityType", text.facilityType)}
          value={form.facilityType}
          options={facilityOptions}
          disabled={update.isPending}
          onChange={(event) => updateField("facilityType", event.target.value as FacilityType)}
        />
      </div>
      <OrganizationLocationFields
        provinceCode={form.provinceCode}
        wardCode={form.wardCode}
        disabled={update.isPending}
        onProvinceChange={updateProvince}
        onWardChange={(value) => updateField("wardCode", value)}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label={t("tenant.profile.organization.addressDetail", text.addressDetail)}
          value={form.address}
          disabled={update.isPending}
          placeholder={t(
            "tenant.profile.organization.addressPlaceholder",
            text.addressPlaceholder,
          )}
          className="md:col-span-2"
          onChange={(event) => updateField("address", event.target.value)}
        />
      </div>
      {validationError && <Alert tone="error">{validationError}</Alert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" disabled={update.isPending} onClick={onCancel}>
          {t("tenant.profile.organization.cancel", text.cancel)}
        </Button>
        <Button type="submit" disabled={!isDirty} isLoading={update.isPending}>
          {t("tenant.profile.organization.save", text.save)}
        </Button>
      </div>
    </form>
  );
};
