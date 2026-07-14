import type { ReactElement } from "react";
import {
  CREATE_TENANT_TEXT,
  CREATE_TENANT_LOCATION_TEXT,
  PLAN_SELECT_OPTIONS,
  TENANT_LOCATION_OPTIONS,
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
      label={T.SLUG_LABEL}
      htmlFor="tenant-slug"
      required
      helper={T.SLUG_HELPER}
      error={errors.slug}
    >
      <div className="flex items-stretch">
        <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
          {T.SLUG_PREFIX}
        </span>
        <input
          id="tenant-slug"
          type="text"
          value={form.slug}
          onChange={(event) => onChange("slug", event.target.value)}
          placeholder={T.SLUG_PLACEHOLDER}
          className={`${fieldInputClass(errors.slug)} rounded-l-none`}
        />
      </div>
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
      label={CREATE_TENANT_LOCATION_TEXT.LABEL}
      htmlFor="tenant-location"
      required
      error={errors.location}
    >
      <select
        id="tenant-location"
        value={form.location}
        onChange={(event) => onChange("location", event.target.value)}
        className={fieldInputClass(errors.location)}
      >
        <option value="" disabled>
          {CREATE_TENANT_LOCATION_TEXT.PLACEHOLDER}
        </option>
        {TENANT_LOCATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </TenantFormField>

    <TenantFormField
      label={T.MAX_USERS_LABEL}
      htmlFor="tenant-max-users"
      helper={T.MAX_USERS_HELPER}
    >
      <input
        id="tenant-max-users"
        type="number"
        min="0"
        value={form.maxUsers}
        onChange={(event) => onChange("maxUsers", event.target.value)}
        placeholder={T.MAX_USERS_PLACEHOLDER}
        className={fieldInputClass()}
      />
    </TenantFormField>

    <TenantFormField
      label={T.EXPIRES_LABEL}
      htmlFor="tenant-expires"
      required
      error={errors.expiresAt}
    >
      <input
        id="tenant-expires"
        type="date"
        value={form.expiresAt}
        onChange={(event) => onChange("expiresAt", event.target.value)}
        className={fieldInputClass(errors.expiresAt)}
      />
    </TenantFormField>
  </div>
);
