import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import { CREATE_TENANT_TEXT, ORGANIZATION_TYPE_OPTIONS, PLAN_SELECT_OPTIONS } from "../constants";
import type { CreateTenantErrors, CreateTenantInput } from "../types";
import { TenantFormField, fieldInputClass } from "./_TenantFormField";

interface TenantGeneralFieldsProps {
  form: CreateTenantInput;
  errors: CreateTenantErrors;
  onChange: (field: keyof CreateTenantInput, value: string) => void;
}

const T = CREATE_TENANT_TEXT;

export const TenantGeneralFields = ({
  form,
  errors,
  onChange,
}: TenantGeneralFieldsProps): ReactElement => (
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
        options={ORGANIZATION_TYPE_OPTIONS}
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

    <TenantFormField label={T.PLAN_LABEL} htmlFor="tenant-plan" required error={errors.plan}>
      <Select
        id="tenant-plan"
        value={form.plan}
        onChange={(event) => onChange("plan", event.target.value)}
        placeholder={T.PLAN_PLACEHOLDER}
        options={PLAN_SELECT_OPTIONS}
        className={errors.plan ? "!border-red-300 !bg-red-50/40" : undefined}
      />
    </TenantFormField>

    <TenantFormField
      label={T.STUDENT_LIMIT_LABEL}
      htmlFor="tenant-student-limit"
      required
      error={errors.studentLimit}
    >
      <input
        id="tenant-student-limit"
        type="number"
        min="1"
        value={form.studentLimit}
        onChange={(event) => onChange("studentLimit", event.target.value)}
        placeholder={T.STUDENT_LIMIT_PLACEHOLDER}
        className={fieldInputClass(errors.studentLimit)}
      />
    </TenantFormField>
  </div>
);
