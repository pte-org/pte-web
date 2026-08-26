"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input } from "@pte/ui";
import { ADD_STUDENT_TEXT } from "./constants";
import { PendingImportBanner } from "./PendingImportBanner";
import {
  clearPendingImport,
  loadPendingImport,
  savePendingImport,
  useCreateStudent,
  useEnrollRosterAccounts,
  type AddStudentInput,
} from "../api";
import { errorMessage } from "../errorMessage";
import type { CreatedAccount } from "../types";

interface AddStudentFormProps {
  sessionPublicId: string;
}

const T = ADD_STUDENT_TEXT;

const EMPTY_INPUT: AddStudentInput = {
  email: "",
  fullName: "",
  studentCode: "",
  className: "",
  phone: "",
  dateOfBirth: "",
};

export const AddStudentForm = ({ sessionPublicId }: AddStudentFormProps): ReactElement => {
  const [form, setForm] = useState<AddStudentInput>(EMPTY_INPUT);
  // Lazy init reads sessionStorage during render — same SSR-safety note as
  // RosterImport.tsx (this component is also only ever rendered client-side,
  // gated behind SessionDetailView's session-loading state).
  const [pending, setPending] = useState<CreatedAccount[] | null>(() => loadPendingImport(sessionPublicId));
  const createStudent = useCreateStudent();
  const enrollAccounts = useEnrollRosterAccounts(sessionPublicId);

  const handleChange = (field: keyof AddStudentInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    createStudent.mutate(form, {
      onSuccess: (account) => {
        // Persist before enrolling — an enroll failure must never lose the
        // one-time-only generated password (quality-gate QUAL-001).
        savePendingImport(sessionPublicId, [account]);
        setPending([account]);
        setForm(EMPTY_INPUT);
        enrollAccounts.mutate([account], { onSuccess: () => setPending(null) });
      },
    });
  };

  const handleDismiss = (): void => {
    clearPendingImport(sessionPublicId);
    setPending(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {pending && pending.length > 0 && (
        <PendingImportBanner
          accounts={pending}
          onRetryEnroll={() => enrollAccounts.mutate(pending, { onSuccess: () => setPending(null) })}
          onDismiss={handleDismiss}
          isEnrolling={enrollAccounts.isPending}
          enrollError={enrollAccounts.error}
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        {!!createStudent.error && <Alert tone="error">{errorMessage(createStudent.error)}</Alert>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={T.EMAIL_LABEL}
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            required
          />
          <Input
            label={T.FULL_NAME_LABEL}
            value={form.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            required
          />
          <Input
            label={T.STUDENT_CODE_LABEL}
            value={form.studentCode}
            onChange={(event) => handleChange("studentCode", event.target.value)}
          />
          <Input
            label={T.CLASS_LABEL}
            value={form.className}
            onChange={(event) => handleChange("className", event.target.value)}
          />
          <Input
            label={T.PHONE_LABEL}
            value={form.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
          />
          <Input
            type="date"
            label={T.DOB_LABEL}
            value={form.dateOfBirth}
            onChange={(event) => handleChange("dateOfBirth", event.target.value)}
          />
        </div>
        <div>
          <Button type="submit" isLoading={createStudent.isPending} loadingText={T.SUBMITTING}>
            {T.SUBMIT}
          </Button>
        </div>
      </form>
    </div>
  );
};
