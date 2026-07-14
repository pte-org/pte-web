import type { ReactElement } from "react";
import { CREATE_TENANT_TEXT } from "../constants";
import type { CreateTenantErrors, CreateTenantInput } from "../types";
import { TenantFormField, fieldInputClass } from "./_TenantFormField";

interface TenantContactFieldsProps {
  form: CreateTenantInput;
  errors: CreateTenantErrors;
  onChange: (field: keyof CreateTenantInput, value: string) => void;
}

const T = CREATE_TENANT_TEXT;

export const TenantContactFields = ({
  form,
  errors,
  onChange,
}: TenantContactFieldsProps): ReactElement => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <TenantFormField
      label={T.CONTACT_NAME_LABEL}
      htmlFor="tenant-contact-name"
      required
      error={errors.contactName}
    >
      <input
        id="tenant-contact-name"
        type="text"
        value={form.contactName}
        onChange={(event) => onChange("contactName", event.target.value)}
        placeholder={T.CONTACT_NAME_PLACEHOLDER}
        className={fieldInputClass(errors.contactName)}
      />
    </TenantFormField>

    <TenantFormField
      label={T.CONTACT_PHONE_LABEL}
      htmlFor="tenant-contact-phone"
      required
      error={errors.contactPhone}
    >
      <input
        id="tenant-contact-phone"
        type="tel"
        value={form.contactPhone}
        onChange={(event) => onChange("contactPhone", event.target.value)}
        placeholder={T.CONTACT_PHONE_PLACEHOLDER}
        className={fieldInputClass(errors.contactPhone)}
      />
    </TenantFormField>

    <TenantFormField
      label={T.CONTACT_EMAIL_LABEL}
      htmlFor="tenant-contact-email"
      required
      helper={T.CONTACT_EMAIL_HELPER}
      error={errors.contactEmail}
    >
      <input
        id="tenant-contact-email"
        type="email"
        value={form.contactEmail}
        onChange={(event) => onChange("contactEmail", event.target.value)}
        placeholder={T.CONTACT_EMAIL_PLACEHOLDER}
        className={fieldInputClass(errors.contactEmail)}
      />
    </TenantFormField>
  </div>
);
