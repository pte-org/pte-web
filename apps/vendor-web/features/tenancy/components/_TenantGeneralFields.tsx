import type { ReactElement } from "react";
import { Alert, Select } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  CREATE_TENANT_TEXT as RAW_CREATE_TENANT_TEXT,
  ORGANIZATION_TYPE_OPTIONS as RAW_ORGANIZATION_TYPE_OPTIONS,
} from "../constants";
import type { CreateTenantErrors, CreateTenantInput } from "../types";
import { TenantFormField, fieldInputClass } from "./_TenantFormField";

interface TenantGeneralFieldsProps {
  form: CreateTenantInput;
  errors: CreateTenantErrors;
  onChange: (field: keyof CreateTenantInput, value: string) => void;
}

export const TenantGeneralFields = ({
  form,
  errors,
  onChange,
}: TenantGeneralFieldsProps): ReactElement => {
  const T = useAdminCopy(RAW_CREATE_TENANT_TEXT);
  const organizationTypeOptions = useAdminCopy(RAW_ORGANIZATION_TYPE_OPTIONS);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TenantFormField
        label={T.CODE_LABEL}
        htmlFor="tenant-code"
        required
        helper={T.CODE_HELPER}
        error={errors.code}
      >
        <input
          id="tenant-code"
          type="text"
          value={form.code}
          onChange={(event) => onChange("code", event.target.value.toLowerCase())}
          placeholder={T.CODE_PLACEHOLDER}
          maxLength={32}
          autoComplete="off"
          className={fieldInputClass(errors.code)}
        />
      </TenantFormField>

      <TenantFormField label={T.NAME_LABEL} htmlFor="tenant-name" required error={errors.name}>
        <input
          id="tenant-name"
          type="text"
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder={T.NAME_PLACEHOLDER}
          className={fieldInputClass(errors.name)}
        />
      </TenantFormField>

      <TenantFormField
        label={T.ORG_TYPE_LABEL}
        htmlFor="tenant-org-type"
        required
        error={errors.organizationType}
      >
        <Select
          id="tenant-org-type"
          value={form.organizationType}
          onChange={(event) => onChange("organizationType", event.target.value)}
          placeholder={T.ORG_TYPE_PLACEHOLDER}
          options={organizationTypeOptions}
          className={errors.organizationType ? "!border-red-300 !bg-red-50/40" : undefined}
        />
      </TenantFormField>

      <TenantFormField
        label={T.TAX_CODE_LABEL}
        htmlFor="tenant-tax-code"
        required
        helper={T.TAX_CODE_HELPER}
        error={errors.taxCode}
      >
        <input
          id="tenant-tax-code"
          type="text"
          value={form.taxCode}
          onChange={(event) => onChange("taxCode", event.target.value)}
          placeholder={T.TAX_CODE_PLACEHOLDER}
          maxLength={64}
          autoComplete="off"
          className={fieldInputClass(errors.taxCode)}
        />
      </TenantFormField>

      <TenantFormField
        label={T.HOST_EMAIL_LABEL}
        htmlFor="tenant-host-email"
        required
        helper={T.HOST_EMAIL_HELPER}
        error={errors.hostEmail}
      >
        <input
          id="tenant-host-email"
          type="email"
          value={form.hostEmail}
          onChange={(event) => onChange("hostEmail", event.target.value)}
          placeholder={T.HOST_EMAIL_PLACEHOLDER}
          maxLength={255}
          autoComplete="off"
          className={fieldInputClass(errors.hostEmail)}
        />
      </TenantFormField>

      <div className="md:col-span-2">
        <Alert tone="info">{T.CAPACITY_NOTE}</Alert>
      </div>
    </div>
  );
};
