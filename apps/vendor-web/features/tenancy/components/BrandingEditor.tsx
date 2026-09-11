"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert } from "@pte/ui";
import { TENANT_DETAIL_TEXT } from "../constants";
import { validateBranding, type BrandingErrors } from "../utils/validateBranding";
import type { BrandingInput, Tenant } from "../types";
import { fieldInputClass } from "./_TenantFormField";

interface BrandingEditorProps {
  tenant: Tenant;
  onSubmit: (input: BrandingInput) => void;
  isSubmitting?: boolean;
  error?: string;
  saved?: boolean;
}

const T = TENANT_DETAIL_TEXT;

export const BrandingEditor = ({
  tenant,
  onSubmit,
  isSubmitting = false,
  error,
  saved = false,
}: BrandingEditorProps): ReactElement => {
  const [form, setForm] = useState<BrandingInput>({
    logoUrl: tenant.logoUrl ?? "",
    primaryColor: tenant.primaryColor ?? "",
  });
  const [errors, setErrors] = useState<BrandingErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateBranding(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-md shadow-slate-200/70">
      <h2 className="text-base font-semibold text-gray-900">{T.BRANDING_TITLE}</h2>
      <p className="mt-1 text-sm text-gray-500">{T.BRANDING_SUBTITLE}</p>

      {error && (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      {saved && !error && (
        <div className="mt-4">
          <Alert tone="success">{T.BRANDING_SAVED}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="branding-logo-url" className="text-sm font-medium text-gray-700">
            {T.LOGO_URL_LABEL}
          </label>
          <input
            id="branding-logo-url"
            type="text"
            value={form.logoUrl}
            onChange={(event) => setForm((previous) => ({ ...previous, logoUrl: event.target.value }))}
            placeholder={T.LOGO_URL_PLACEHOLDER}
            className={fieldInputClass()}
          />
          <p className="text-xs text-gray-400">{T.LOGO_URL_HELPER}</p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="branding-primary-color" className="text-sm font-medium text-gray-700">
            {T.PRIMARY_COLOR_LABEL}
          </label>
          <input
            id="branding-primary-color"
            type="text"
            value={form.primaryColor}
            onChange={(event) => setForm((previous) => ({ ...previous, primaryColor: event.target.value }))}
            placeholder={T.PRIMARY_COLOR_PLACEHOLDER}
            className={fieldInputClass(errors.primaryColor)}
          />
          {errors.primaryColor && <p className="text-xs text-red-600">{errors.primaryColor}</p>}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : T.SAVE_BRANDING}
          </button>
        </div>
      </form>
    </section>
  );
};
