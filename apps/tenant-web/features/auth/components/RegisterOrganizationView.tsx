"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { ApiError, type SubmitApplicationRequest } from "@pte/api-client";
import { Button, CheckCircleIcon, Input, MailIcon, Select } from "@pte/ui";
import { AUTH_ROUTES, REGISTRATION_TEXT } from "../constants";
import { useSubmitApplication } from "@/features/commercialization/api";
import { PublicShell } from "@/features/public/components";

type FormValues = SubmitApplicationRequest;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  orgName: "",
  orgType: "",
  requestedCode: "",
  contactEmail: "",
  contactPhone: "",
  taxCode: "",
};

const ORGANIZATION_TYPES = [
  { label: "School", value: "school" },
  { label: "Language center", value: "language-center" },
  { label: "University", value: "university" },
  { label: "Other", value: "other" },
];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.orgName.trim()) errors.orgName = "Enter your organization name.";
  if (!values.orgType) errors.orgType = "Select an organization type.";
  if (!/^[a-z0-9-]{3,32}$/.test(values.requestedCode.trim()))
    errors.requestedCode = "Use 3–32 lowercase letters, numbers, or hyphens.";
  if (!values.contactEmail.trim()) errors.contactEmail = "Enter your email address.";
  else if (!/^\S+@\S+\.\S+$/.test(values.contactEmail))
    errors.contactEmail = "Enter a valid email address.";
  if (!values.taxCode.trim()) errors.taxCode = "Enter your organization's tax code.";
  return errors;
}

export const RegisterOrganizationView = (): ReactElement => {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const submit = useSubmitApplication();

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]): void => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmissionError("");
    try {
      await submit.mutateAsync({
        orgName: values.orgName.trim(),
        orgType: values.orgType,
        requestedCode: values.requestedCode.trim(),
        contactEmail: values.contactEmail.trim(),
        contactPhone: values.contactPhone?.trim() || undefined,
        taxCode: values.taxCode.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError && error.message === "TENANT_NAME_ALREADY_USED") {
        setErrors((current) => ({ ...current, orgName: REGISTRATION_TEXT.duplicateName }));
      } else if (error instanceof ApiError && error.message === "REQUESTED_CODE_ALREADY_USED") {
        setErrors((current) => ({ ...current, requestedCode: REGISTRATION_TEXT.duplicateCode }));
      } else if (error instanceof ApiError && error.status === 429) {
        setSubmissionError(REGISTRATION_TEXT.rateLimited);
      } else {
        setSubmissionError(REGISTRATION_TEXT.submitFailed);
      }
    }
  };

  if (submitted) {
    return (
      <PublicShell>
        <section className="mx-auto flex max-w-3xl justify-center px-5 py-14 sm:py-20 lg:px-8">
          <div className="w-full rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-card sm:p-12">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <CheckCircleIcon className="h-7 w-7" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Application received
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Your organization is in review.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600">
              We will contact you at the email provided after the review is complete.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={AUTH_ROUTES.login}
                className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-medium text-white hover:bg-action-hover"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </PublicShell>
    );
  }

  const fieldConflict =
    submit.error instanceof ApiError &&
    (submit.error.message === "TENANT_NAME_ALREADY_USED" ||
      submit.error.message === "REQUESTED_CODE_ALREADY_USED");
  const submitError =
    submissionError ||
    (submit.error instanceof ApiError && !fieldConflict ? submit.error.message : undefined);
  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-5 py-10 sm:py-14 lg:px-8 lg:py-18">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-bold text-slate-950">Organization details</h2>
            <p className="mt-1 text-sm text-slate-500">
              Submit an application. Platform staff will create access after review.
            </p>
          </div>
          {submitError && (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => void handleSubmit(event)}
            noValidate
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="orgName"
                label="Organization name"
                placeholder="e.g. Bright English Center"
                value={values.orgName}
                onChange={(event) => updateField("orgName", event.target.value)}
                error={errors.orgName}
                required
              />
              <Select
                id="orgType"
                label="Organization type"
                placeholder="Select type"
                options={ORGANIZATION_TYPES}
                value={values.orgType}
                onChange={(event) => updateField("orgType", event.target.value)}
                error={errors.orgType}
                required
              />
              <Input
                id="requestedCode"
                label="Requested tenant code"
                helperText={REGISTRATION_TEXT.requestedCodeHint}
                placeholder="bright-center"
                value={values.requestedCode}
                onChange={(event) => updateField("requestedCode", event.target.value.toLowerCase())}
                error={errors.requestedCode}
                required
              />
              <Input
                id="contactPhone"
                label="Phone number"
                type="tel"
                placeholder="Your contact number"
                value={values.contactPhone ?? ""}
                onChange={(event) => updateField("contactPhone", event.target.value)}
              />
              <Input
                id="contactEmail"
                label="Work email"
                type="email"
                autoComplete="email"
                placeholder="admin@organization.com"
                value={values.contactEmail}
                onChange={(event) => updateField("contactEmail", event.target.value)}
                error={errors.contactEmail}
                leftIcon={<MailIcon className="h-4 w-4" />}
                required
              />
              <Input
                id="taxCode"
                label="Tax code"
                helperText="Required for organization verification."
                placeholder="Enter your tax code"
                value={values.taxCode}
                onChange={(event) => updateField("taxCode", event.target.value)}
                error={errors.taxCode}
                required
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  href={AUTH_ROUTES.login}
                  className="font-semibold text-action hover:underline"
                >
                  Sign in
                </Link>
              </p>
              <Button
                type="submit"
                size="lg"
                isLoading={submit.isPending}
                loadingText="Submitting..."
                rightIcon={<span aria-hidden="true">→</span>}
              >
                Submit application
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PublicShell>
  );
};
