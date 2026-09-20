"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import {
  ApiError,
  getUserFacingApiErrorMessage,
  type SubmitApplicationRequest,
} from "@pte/api-client";
import { Button, CheckCircleIcon, Input, MailIcon, Select } from "@pte/ui";
import {
  AUTH_ROUTES,
  REGISTRATION_ORGANIZATION_TYPES,
  REGISTRATION_TEXT as T,
} from "../constants";
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

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.orgName.trim()) errors.orgName = T.organizationNameRequired;
  if (!values.orgType) errors.orgType = T.organizationTypeRequired;
  if (!/^[a-z0-9-]{3,32}$/.test(values.requestedCode.trim()))
    errors.requestedCode = T.requestedCodeInvalid;
  if (!values.contactEmail.trim()) errors.contactEmail = T.emailRequired;
  else if (!/^\S+@\S+\.\S+$/.test(values.contactEmail))
    errors.contactEmail = T.emailInvalid;
  if (!values.taxCode.trim()) errors.taxCode = T.taxCodeRequired;
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
      if (error instanceof ApiError && error.code === "TENANT_NAME_ALREADY_USED") {
        setErrors((current) => ({ ...current, orgName: T.duplicateName }));
      } else if (error instanceof ApiError && error.code === "REQUESTED_CODE_ALREADY_USED") {
        setErrors((current) => ({ ...current, requestedCode: T.duplicateCode }));
      } else if (error instanceof ApiError && error.status === 429) {
        setSubmissionError(T.rateLimited);
      } else {
        setSubmissionError(T.submitFailed);
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
              {T.applicationReceived}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {T.reviewTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-600">
              {T.reviewDescription}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={AUTH_ROUTES.login}
                className="inline-flex h-10 items-center justify-center rounded-md bg-action px-4 text-sm font-medium text-white hover:bg-action-hover"
              >
                {T.signIn}
              </Link>
            </div>
          </div>
        </section>
      </PublicShell>
    );
  }

  const fieldConflict =
    submit.error instanceof ApiError &&
    (submit.error.code === "TENANT_NAME_ALREADY_USED" ||
      submit.error.code === "REQUESTED_CODE_ALREADY_USED");
  const submitError =
    submissionError ||
    (submit.error instanceof ApiError && !fieldConflict
      ? getUserFacingApiErrorMessage(submit.error, T.submitFailed)
      : undefined);
  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-5 py-10 sm:py-14 lg:px-8 lg:py-18">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-bold text-slate-950">{T.detailsTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {T.detailsSubtitle}
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
                label={T.organizationNameLabel}
                placeholder={T.organizationNamePlaceholder}
                value={values.orgName}
                onChange={(event) => updateField("orgName", event.target.value)}
                error={errors.orgName}
                required
              />
              <Select
                id="orgType"
                label={T.organizationTypeLabel}
                placeholder={T.organizationTypePlaceholder}
                options={REGISTRATION_ORGANIZATION_TYPES}
                value={values.orgType}
                onChange={(event) => updateField("orgType", event.target.value)}
                error={errors.orgType}
                required
              />
              <Input
                id="requestedCode"
                label={T.requestedCodeLabel}
                helperText={T.requestedCodeHint}
                placeholder={T.requestedCodePlaceholder}
                value={values.requestedCode}
                onChange={(event) => updateField("requestedCode", event.target.value.toLowerCase())}
                error={errors.requestedCode}
                required
              />
              <Input
                id="contactPhone"
                label={T.phoneLabel}
                type="tel"
                placeholder={T.phonePlaceholder}
                value={values.contactPhone ?? ""}
                onChange={(event) => updateField("contactPhone", event.target.value)}
              />
              <Input
                id="contactEmail"
                label={T.workEmailLabel}
                type="email"
                autoComplete="email"
                placeholder={T.workEmailPlaceholder}
                value={values.contactEmail}
                onChange={(event) => updateField("contactEmail", event.target.value)}
                error={errors.contactEmail}
                leftIcon={<MailIcon className="h-4 w-4" />}
                required
              />
              <Input
                id="taxCode"
                label={T.taxCodeLabel}
                helperText={T.taxCodeHelper}
                placeholder={T.taxCodePlaceholder}
                value={values.taxCode}
                onChange={(event) => updateField("taxCode", event.target.value)}
                error={errors.taxCode}
                required
              />
            </div>
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {T.alreadyHaveAccount}{" "}
                <Link
                  href={AUTH_ROUTES.login}
                  className="font-semibold text-action hover:underline"
                >
                  {T.signIn}
                </Link>
              </p>
              <Button
                type="submit"
                size="lg"
                isLoading={submit.isPending}
                loadingText={T.submitting}
                rightIcon={<span aria-hidden="true">{T.submitIcon}</span>}
              >
                {T.submitApplication}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PublicShell>
  );
};
