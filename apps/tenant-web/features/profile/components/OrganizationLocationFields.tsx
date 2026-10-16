"use client";

import { useMemo, type ReactElement } from "react";
import { Alert, Select, useLocale } from "@pte/ui";
import { useVietnamProvinces, useVietnamWards } from "../api";
import { PROFILE_TEXT } from "../constants";

interface OrganizationLocationFieldsProps {
  provinceCode: string;
  wardCode: string;
  disabled: boolean;
  onProvinceChange: (value: string) => void;
  onWardChange: (value: string) => void;
}

export const OrganizationLocationFields = ({
  provinceCode,
  wardCode,
  disabled,
  onProvinceChange,
  onWardChange,
}: OrganizationLocationFieldsProps): ReactElement => {
  const { t } = useLocale();
  const text = PROFILE_TEXT.organization;
  const provincesQuery = useVietnamProvinces();
  const wardsQuery = useVietnamWards(provinceCode || null);
  const provinceOptions = useMemo(
    () => [
      { value: "", label: t("tenant.profile.organization.notSelected", text.notSelected) },
      ...(provincesQuery.data ?? []).map((option) => ({
        value: option.code,
        label: option.name,
      })),
    ],
    [provincesQuery.data, t, text.notSelected],
  );
  const wardOptions = useMemo(
    () => [
      { value: "", label: t("tenant.profile.organization.notSelected", text.notSelected) },
      ...(wardsQuery.data ?? []).map((option) => ({
        value: option.code,
        label: option.name,
      })),
    ],
    [t, text.notSelected, wardsQuery.data],
  );
  const locationError = provincesQuery.isError || wardsQuery.isError
    ? t("tenant.profile.organization.locationLoadFailed", text.locationLoadFailed)
    : null;
  const provincesLoading = provincesQuery.isLoading;
  const wardsLoading = wardsQuery.isLoading && Boolean(provinceCode);

  return (
    <>
      {locationError && <Alert tone="error">{locationError}</Alert>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label={t("tenant.profile.organization.province", text.province)}
          value={provinceCode}
          options={provinceOptions}
          placeholder={t(
            "tenant.profile.organization.provincePlaceholder",
            text.provincePlaceholder,
          )}
          disabled={disabled || provincesLoading}
          onChange={(event) => onProvinceChange(event.target.value)}
        />
        <Select
          label={t("tenant.profile.organization.ward", text.ward)}
          value={wardCode}
          options={wardOptions}
          placeholder={provinceCode
            ? t("tenant.profile.organization.wardPlaceholder", text.wardPlaceholder)
            : t("tenant.profile.organization.wardRequiresProvince", text.wardRequiresProvince)}
          disabled={disabled || !provinceCode || wardsLoading}
          onChange={(event) => onWardChange(event.target.value)}
        />
      </div>
    </>
  );
};
