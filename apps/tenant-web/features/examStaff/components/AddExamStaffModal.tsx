"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Input, Modal, Select, useLocale, useToast } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAM_STAFF_TEXT } from "../constants";
import { useCreateExamStaff } from "../api";
import type { CreateExamStaffErrors, CreateExamStaffInput } from "../types";

interface AddExamStaffModalProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM: CreateExamStaffInput = {
  email: "",
  fullName: "",
  role: "PROCTOR",
};

export const AddExamStaffModal = ({ open, onClose }: AddExamStaffModalProps): ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const text = {
    title: t("tenant.examStaff.addTitle", EXAM_STAFF_TEXT.addTitle),
    description: t("tenant.examStaff.addDescription", EXAM_STAFF_TEXT.addDescription),
    createFailed: t("tenant.examStaff.createFailed", EXAM_STAFF_TEXT.createFailed),
    role: t("tenant.examStaff.role", EXAM_STAFF_TEXT.roleLabel),
    email: t("tenant.examStaff.email", EXAM_STAFF_TEXT.email),
    fullName: t("tenant.examStaff.fullName", EXAM_STAFF_TEXT.fullName),
    emailRequired: t("tenant.examStaff.emailRequired", EXAM_STAFF_TEXT.emailRequired),
    emailInvalid: t("tenant.examStaff.emailInvalid", EXAM_STAFF_TEXT.emailInvalid),
    fullNameRequired: t("tenant.examStaff.fullNameRequired", EXAM_STAFF_TEXT.fullNameRequired),
    submit: t("tenant.examStaff.submit", EXAM_STAFF_TEXT.submit),
    submitting: t("tenant.examStaff.submitting", EXAM_STAFF_TEXT.submitting),
    close: t("tenant.examStaff.close", EXAM_STAFF_TEXT.close),
  };
  const roleOptions = [
    { label: t("tenant.examStaff.proctor", EXAM_STAFF_TEXT.proctor), value: "PROCTOR" },
    { label: t("tenant.examStaff.examiner", EXAM_STAFF_TEXT.examiner), value: "EXAMINER" },
  ];
  const [form, setForm] = useState<CreateExamStaffInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<CreateExamStaffErrors>({});
  const create = useCreateExamStaff();

  const handleChange = (field: keyof CreateExamStaffInput, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const validate = (): CreateExamStaffErrors => {
    const next: CreateExamStaffErrors = {};
    if (!form.email.trim()) next.email = text.emailRequired;
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = text.emailInvalid;
    if (!form.fullName.trim()) next.fullName = text.fullNameRequired;
    return next;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const created = { name: form.fullName.trim(), email: form.email.trim() };
    create.mutate(form, {
      onSuccess: () => {
        onClose();
        // The form keeps its values until the modal is reopened; start it empty next time.
        setForm(EMPTY_FORM);
        showToast(t("tenant.examStaff.createSuccess", EXAM_STAFF_TEXT.createSuccess, created));
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={text.title}
      footer={
        <>
          <Button type="button" variant="primary" appearance="outline" size="md" onClick={onClose}>
            {text.close}
          </Button>
          <Button
            type="submit"
            form="add-exam-staff-form"
            variant="primary"
            appearance="fill"
            size="md"
            isLoading={create.isPending}
            loadingText={text.submitting}
            className="min-w-28"
          >
            {text.submit}
          </Button>
        </>
      }
    >
      <form
        id="add-exam-staff-form"
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4"
      >
        <p className="text-sm text-gray-600">{text.description}</p>
        {Boolean(create.error) && (
          <Alert tone="error">{errorMessage(create.error) ?? text.createFailed}</Alert>
        )}
        <Select
          id="exam-staff-role"
          label={text.role}
          options={roleOptions}
          value={form.role}
          onChange={(event) => handleChange("role", event.target.value)}
        />
        <Input
          label={text.email}
          type="email"
          value={form.email}
          error={errors.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />
        <Input
          label={text.fullName}
          value={form.fullName}
          error={errors.fullName}
          onChange={(event) => handleChange("fullName", event.target.value)}
        />
      </form>
    </Modal>
  );
};
