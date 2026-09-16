"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import {
  Button,
  Checkbox,
  CheckCircleIcon,
  Input,
  LockIcon,
  MailIcon,
  PasswordInput,
  Select,
  UsersIcon,
} from "@pte/ui";
import { AUTH_ROUTES } from "../constants";
import { PublicShell } from "@/features/public/components";

type FormValues = {
  organizationName: string;
  organizationType: string;
  representativeName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL_VALUES: FormValues = {
  organizationName: "",
  organizationType: "",
  representativeName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

const ORGANIZATION_TYPES = [
  { label: "School", value: "school" },
  { label: "Language center", value: "language-center" },
  { label: "University", value: "university" },
  { label: "Other", value: "other" },
];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.organizationName.trim()) errors.organizationName = "Enter your organization name.";
  if (!values.organizationType) errors.organizationType = "Select an organization type.";
  if (!values.representativeName.trim()) errors.representativeName = "Enter a representative name.";
  if (!values.email.trim()) {
    errors.email = "Enter your email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.phone.trim()) errors.phone = "Enter a phone number.";
  if (values.password.length < 8) errors.password = "Use at least 8 characters.";
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  if (!values.termsAccepted) errors.termsAccepted = "Accept the terms to continue.";
  return errors;
}

export const RegisterOrganizationView = (): ReactElement => {
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]): void => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setReference(`APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitted(true);
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
              We will email you when the review is complete. Keep this reference for your records.
            </p>
            <div className="mx-auto mt-6 max-w-xs rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Application reference
              </p>
              <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{reference}</p>
            </div>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Back to home
              </Link>
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

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-5 py-10 sm:py-14 lg:px-8 lg:py-18">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">Organization details</h2>
              </div>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="organizationName"
                label="Organization name"
                placeholder="e.g. Bright English Center"
                value={values.organizationName}
                onChange={(event) => updateField("organizationName", event.target.value)}
                error={errors.organizationName}
                required
              />
              <Select
                id="organizationType"
                label="Organization type"
                placeholder="Select type"
                options={ORGANIZATION_TYPES}
                value={values.organizationType}
                onChange={(event) => updateField("organizationType", event.target.value)}
                error={errors.organizationType}
                className="w-full"
                required
              />
              <Input
                id="representativeName"
                label="Representative name"
                placeholder="Full name"
                value={values.representativeName}
                onChange={(event) => updateField("representativeName", event.target.value)}
                error={errors.representativeName}
                leftIcon={<UsersIcon className="h-4 w-4" />}
                required
              />
              <Input
                id="phone"
                label="Phone number"
                type="tel"
                placeholder="Your contact number"
                value={values.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                error={errors.phone}
                required
              />
              <Input
                id="email"
                label="Work email"
                type="email"
                autoComplete="email"
                placeholder="admin@organization.com"
                value={values.email}
                onChange={(event) => updateField("email", event.target.value)}
                error={errors.email}
                leftIcon={<MailIcon className="h-4 w-4" />}
                required
              />
              <PasswordInput
                id="password"
                label="Password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={values.password}
                onChange={(event) => updateField("password", event.target.value)}
                error={errors.password}
                leftIcon={<LockIcon className="h-4 w-4" />}
                required
              />
              <PasswordInput
                id="confirmPassword"
                label="Confirm password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={values.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                error={errors.confirmPassword}
                leftIcon={<LockIcon className="h-4 w-4" />}
                required
              />
            </div>

            <Checkbox
              id="termsAccepted"
              label="I agree to the Terms of Service and Privacy Policy."
              checked={values.termsAccepted}
              onChange={(event) => updateField("termsAccepted", event.target.checked)}
              error={errors.termsAccepted}
            />

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
              <Button type="submit" size="lg" rightIcon={<span aria-hidden="true">→</span>}>
                Submit application
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PublicShell>
  );
};
