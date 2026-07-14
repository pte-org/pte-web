"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  Button,
  CredentialDisplay,
  FormActions,
  Input,
  NumberInput,
} from "@aptis/ui";
import type { CreateHostRequest } from "@aptis/api-client";
import { useCreateHost } from "../api";
import { getLoginErrorMessage } from "../../auth/loginError";

const TEXT = {
  HEADING: "Create Host Account",
  SUBTITLE: "Issue a host account for managing learners and exams.",
  CODE_LABEL: "Host Code",
  NAME_LABEL: "Host Name",
  ORG_LABEL: "Organization Name",
  ORG_TYPE_LABEL: "Organization Type",
  ADDRESS_LABEL: "Address",
  REP_LABEL: "Representative",
  EMAIL_LABEL: "Contact Email",
  PHONE_LABEL: "Phone Number",
  CONTRACT_LABEL: "Contract Code",
  PACKAGE_LABEL: "Plan",
  LIMIT_LABEL: "Learner Limit",
  SUBMIT: "Create Account",
  SUBMITTING: "Creating",
  SUCCESS_TITLE: "Host created",
  CREDENTIAL_LABEL: "Initial Password",
  REQUIRED_ERROR: "Please complete all required fields.",
} as const;

const INITIAL_FORM: CreateHostRequest = {
  code: "",
  name: "",
  organizationName: "",
  organizationType: "",
  address: "",
  representativeName: "",
  contactEmail: "",
  representativePhone: "",
  contractCode: "",
  packageName: "",
  studentLimit: undefined,
};

function isValid(form: CreateHostRequest): boolean {
  return Boolean(
    form.code.trim() &&
      form.name.trim() &&
      form.organizationName.trim() &&
      form.organizationType.trim() &&
      form.address.trim() &&
      form.representativeName.trim() &&
      form.contactEmail.trim() &&
      form.representativePhone.trim(),
  );
}

export const HostCreationForm = (): ReactElement => {
  const [form, setForm] = useState<CreateHostRequest>(INITIAL_FORM);
  const [formError, setFormError] = useState<string>();
  const [issuedCredential, setIssuedCredential] = useState<string | null>(null);
  const mutation = useCreateHost();

  const updateField = (
    field: keyof CreateHostRequest,
    value: string | number | undefined,
  ): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!isValid(form)) {
      setFormError(TEXT.REQUIRED_ERROR);
      return;
    }

    setFormError(undefined);
    mutation.mutate(form, {
      onSuccess: (host) => {
        setIssuedCredential(host.initialPassword);
      },
      onError: (error) => setFormError(getLoginErrorMessage(error)),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex max-w-4xl flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{TEXT.HEADING}</h2>
        <p className="mt-1 text-sm text-gray-500">{TEXT.SUBTITLE}</p>
      </div>

      {formError && <Alert tone="error">{formError}</Alert>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="host-code"
          label={TEXT.CODE_LABEL}
          required
          value={form.code}
          onChange={(event) => updateField("code", event.target.value)}
        />
        <Input
          id="host-name"
          label={TEXT.NAME_LABEL}
          required
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <Input
          id="organization-name"
          label={TEXT.ORG_LABEL}
          required
          value={form.organizationName}
          onChange={(event) => updateField("organizationName", event.target.value)}
        />
        <Input
          id="organization-type"
          label={TEXT.ORG_TYPE_LABEL}
          required
          value={form.organizationType}
          onChange={(event) => updateField("organizationType", event.target.value)}
        />
        <Input
          id="organization-address"
          label={TEXT.ADDRESS_LABEL}
          required
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
        />
        <Input
          id="representative-name"
          label={TEXT.REP_LABEL}
          required
          value={form.representativeName}
          onChange={(event) => updateField("representativeName", event.target.value)}
        />
        <Input
          id="contact-email"
          label={TEXT.EMAIL_LABEL}
          type="email"
          required
          value={form.contactEmail}
          onChange={(event) => updateField("contactEmail", event.target.value)}
        />
        <Input
          id="representative-phone"
          label={TEXT.PHONE_LABEL}
          required
          value={form.representativePhone}
          onChange={(event) => updateField("representativePhone", event.target.value)}
        />
        <Input
          id="contract-code"
          label={TEXT.CONTRACT_LABEL}
          value={form.contractCode ?? ""}
          onChange={(event) => updateField("contractCode", event.target.value)}
        />
        <Input
          id="package-name"
          label={TEXT.PACKAGE_LABEL}
          value={form.packageName ?? ""}
          onChange={(event) => updateField("packageName", event.target.value)}
        />
        <NumberInput
          id="student-limit"
          label={TEXT.LIMIT_LABEL}
          min={1}
          value={form.studentLimit ?? ""}
          onChange={(event) =>
            updateField(
              "studentLimit",
              event.target.value ? Number(event.target.value) : undefined,
            )
          }
        />
      </div>

      <FormActions>
        <Button type="submit" isLoading={mutation.isPending} loadingText={TEXT.SUBMITTING}>
          {TEXT.SUBMIT}
        </Button>
      </FormActions>

      {issuedCredential && (
        <CredentialDisplay
          credential={issuedCredential}
          label={TEXT.CREDENTIAL_LABEL}
        />
      )}
    </form>
  );
};
