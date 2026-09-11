import type { ReactElement } from "react";
import {
  CREATE_TENANT_TEXT,
  ORGANIZATION_TYPE_OPTIONS,
  PLAN_SELECT_OPTIONS,
} from "../constants";
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
      <select
        id="tenant-org-type"
        value={form.organizationType}
        onChange={(event) => onChange("organizationType", event.target.value)}
        className={fieldInputClass(errors.organizationType)}
      >
        <option value="" disabled>
          {T.ORG_TYPE_PLACEHOLDER}
        </option>
        {ORGANIZATION_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </TenantFormField>

    <TenantFormField label={T.PLAN_LABEL} htmlFor="tenant-plan" required error={errors.plan}>
      <select
        id="tenant-plan"
        value={form.plan}
        onChange={(event) => onChange("plan", event.target.value)}
        className={fieldInputClass(errors.plan)}
      >
        <option value="" disabled>
          {T.PLAN_PLACEHOLDER}
        </option>
        {PLAN_SELECT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
