"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, DateInput, Input } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useCreateStudent } from "@/features/examoperations/api";
import type { CreatedAccount } from "@/features/examoperations/types";
import { useAssignStudent } from "../api";
import { IMPORT_OR_ASSIGN_TEXT } from "../constants";
import type { AddStudentErrors } from "../types";
import { validateAddStudentInput } from "../utils/validateAddStudentInput";
import { assignErrorMessage } from "./assignErrorMessage";
import type { TabScopeProps } from "./tabScopeProps";

const T = IMPORT_OR_ASSIGN_TEXT;

interface AddIndividuallyTabProps extends TabScopeProps {
  onCreated: (accounts: CreatedAccount[]) => void;
  onAssigned: (accounts: CreatedAccount[]) => void;
}

interface AddStudentInput {
  email: string;
  fullName: string;
  studentCode: string;
  phone: string;
  dateOfBirth: string;
}

const EMPTY_ADD_STUDENT_INPUT: AddStudentInput = {
  email: "",
  fullName: "",
  studentCode: "",
  phone: "",
  dateOfBirth: "",
};

/** "Add Individually" — create a single account and assign it in one step. */
export const AddIndividuallyTab = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  onCreated,
  onAssigned,
}: AddIndividuallyTabProps): ReactElement => {
  const [form, setForm] = useState<AddStudentInput>(EMPTY_ADD_STUDENT_INPUT);
  const [errors, setErrors] = useState<AddStudentErrors>({});
  const createStudent = useCreateStudent();
  const assignStudent = useAssignStudent(organizationPublicId, programPublicId, classPublicId);

  const handleChange = (field: keyof AddStudentInput, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    // Clear this field's error as soon as the Host edits it, so a resolved
    // problem never keeps painting a red border on a now-valid field. Keyed on
    // the error type, not the input type: most fields never carry an error.
    setErrors((previous) => {
      const key = field as keyof AddStudentErrors;
      return previous[key] === undefined ? previous : { ...previous, [key]: undefined };
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateAddStudentInput(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    createStudent.mutate(
      {
        email: form.email,
        fullName: form.fullName,
        studentCode: form.studentCode,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
      },
      {
        onSuccess: (account) => {
          // Persist before assigning — an assign failure must never lose the one-time generated password.
          onCreated([account]);
          setForm(EMPTY_ADD_STUDENT_INPUT);
          setErrors({});
          assignStudent.mutate(
            { studentPublicId: account.publicId },
            { onSuccess: () => onAssigned([account]) },
          );
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-gray-900">{T.addIndividuallyHeading}</h4>
      {!!createStudent.error && <Alert tone="error">{errorMessage(createStudent.error)}</Alert>}
      {!!assignStudent.error && (
        <Alert tone="error">{assignErrorMessage(assignStudent.error)}</Alert>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label={T.emailLabel}
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />
        <Input
          label={T.fullNameLabel}
          value={form.fullName}
          error={errors.fullName}
          onChange={(event) => handleChange("fullName", event.target.value)}
        />
        <Input
          label={T.studentCodeLabel}
          value={form.studentCode}
          onChange={(event) => handleChange("studentCode", event.target.value)}
        />
        <Input
          label={T.phoneLabel}
          value={form.phone}
          onChange={(event) => handleChange("phone", event.target.value)}
        />
        <DateInput
          label={T.dobLabel}
          value={form.dateOfBirth}
          onChange={(event) => handleChange("dateOfBirth", event.target.value)}
        />
      </div>
      <div>
        <Button
          type="submit"
          isLoading={createStudent.isPending || assignStudent.isPending}
          loadingText={T.submitting}
        >
          {T.submit}
        </Button>
      </div>
    </form>
  );
};
