"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal, PasswordInput, Select } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAM_STAFF_ROLE_OPTIONS, EXAM_STAFF_TEXT } from "../constants";
import { useCreateExamStaff } from "../api";
import type { CreateExamStaffErrors, CreateExamStaffInput } from "../types";

interface AddExamStaffModalProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM: CreateExamStaffInput = {
  email: "",
  fullName: "",
  password: "",
  role: "PROCTOR",
};

export const AddExamStaffModal = ({ open, onClose }: AddExamStaffModalProps): ReactElement => {
  const [form, setForm] = useState<CreateExamStaffInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<CreateExamStaffErrors>({});
  const create = useCreateExamStaff();

  const handleChange = (field: keyof CreateExamStaffInput, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const validate = (): CreateExamStaffErrors => {
    const next: CreateExamStaffErrors = {};
    if (!form.email.trim()) next.email = EXAM_STAFF_TEXT.emailRequired;
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = EXAM_STAFF_TEXT.emailInvalid;
    if (!form.fullName.trim()) next.fullName = EXAM_STAFF_TEXT.fullNameRequired;
    if (!form.password) next.password = EXAM_STAFF_TEXT.passwordRequired;
    else if (form.password.length < 8) next.password = EXAM_STAFF_TEXT.passwordMinLength;
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    create.mutate(form, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={EXAM_STAFF_TEXT.addTitle}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {EXAM_STAFF_TEXT.close}
          </Button>
          <Button
            type="submit"
            form="add-exam-staff-form"
            isLoading={create.isPending}
            loadingText={EXAM_STAFF_TEXT.submitting}
          >
            {EXAM_STAFF_TEXT.submit}
          </Button>
        </>
      }
    >
      <form id="add-exam-staff-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{EXAM_STAFF_TEXT.addDescription}</p>
        {Boolean(create.error) && (
          <Alert tone="error">{errorMessage(create.error) ?? "Unable to create account."}</Alert>
        )}
        <Select
          label={EXAM_STAFF_TEXT.roleLabel}
          value={form.role}
          options={EXAM_STAFF_ROLE_OPTIONS.map((option) => ({ ...option }))}
          onChange={(event) => handleChange("role", event.target.value)}
        />
        <Input
          label={EXAM_STAFF_TEXT.email}
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />
        <Input
          label={EXAM_STAFF_TEXT.fullName}
          value={form.fullName}
          error={errors.fullName}
          onChange={(event) => handleChange("fullName", event.target.value)}
        />
        <PasswordInput
          label={EXAM_STAFF_TEXT.passwordLabel}
          helperText={EXAM_STAFF_TEXT.passwordHelper}
          value={form.password}
          error={errors.password}
          onChange={(event) => handleChange("password", event.target.value)}
        />
      </form>
    </Modal>
  );
};
