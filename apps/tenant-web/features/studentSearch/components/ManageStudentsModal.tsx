"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  Button,
  CredentialDisplay,
  DateInput,
  Input,
  Modal,
  Select,
  Tabs,
  type TabItem,
} from "@pte/ui";
import type { TenantClassOption } from "@/features/classes/api";
import { SkippedRowsReport } from "@/features/examoperations/components/SkippedRowsReport";
import { downloadCredentials } from "@/features/examoperations/downloadCredentials";
import { errorMessage } from "@/features/examoperations/errorMessage";
import type { CreatedAccount, RosterRow, SkippedRow } from "@/features/examoperations/types";
import { useManageStudentsText } from "../hooks/useManageStudentsText";
import { useCreateTenantStudents } from "../api";
import { ImportStudentsPanel } from "./_ImportStudentsPanel";

type ManageStudentsMode = "add" | "import";

interface ManageStudentsModalProps {
  open: boolean;
  initialMode: ManageStudentsMode;
  availableClasses: TenantClassOption[];
  classesLoading: boolean;
  classesError: unknown;
  onClose: () => void;
}

type AddStudentFormState = RosterRow;

const EMPTY_FORM: AddStudentFormState = {
  email: "",
  fullName: "",
  studentCode: "",
  className: "",
  phone: "",
  dateOfBirth: "",
};

const isManageStudentsMode = (value: string): value is ManageStudentsMode =>
  value === "add" || value === "import";

export const ManageStudentsModal = ({
  open,
  initialMode,
  availableClasses,
  classesLoading,
  classesError,
  onClose,
}: ManageStudentsModalProps): ReactElement => {
  const [mode, setMode] = useState<ManageStudentsMode>(initialMode);
  const [form, setForm] = useState<AddStudentFormState>(EMPTY_FORM);
  const [selectedClassPublicId, setSelectedClassPublicId] = useState("");
  const [result, setResult] = useState<CreationResultData>();
  const createStudents = useCreateTenantStudents();
  const MANAGE_STUDENTS_TEXT = useManageStudentsText();
  const modeTabs: readonly TabItem[] = [
    { id: "add", label: MANAGE_STUDENTS_TEXT.tabAdd },
    { id: "import", label: MANAGE_STUDENTS_TEXT.tabImport },
  ];

  const classOptions = availableClasses.map((studentClass) => ({
    value: studentClass.classPublicId,
    label: MANAGE_STUDENTS_TEXT.classOptionLabel(
      studentClass.className,
      studentClass.programName,
      studentClass.status,
    ),
    disabled: studentClass.status !== "ACTIVE",
  }));

  const handleFormChange = (field: keyof AddStudentFormState, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleClassChange = (classPublicId: string): void => {
    const selectedClass = availableClasses.find(
      (studentClass) => studentClass.classPublicId === classPublicId,
    );
    setSelectedClassPublicId(classPublicId);
    handleFormChange("className", selectedClass?.className ?? "");
  };

  const handleModeChange = (nextMode: string): void => {
    if (!isManageStudentsMode(nextMode)) return;
    setMode(nextMode);
    createStudents.reset();
    setResult(undefined);
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setResult(undefined);
    createStudents.mutate([form], {
      onSuccess: (response) => {
        setResult({ created: response.created, skipped: response.skipped });
        setForm(EMPTY_FORM);
        setSelectedClassPublicId("");
      },
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={MANAGE_STUDENTS_TEXT.title}
      size="xl"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          {MANAGE_STUDENTS_TEXT.close}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Tabs
          id="manage-students-tabs"
          items={modeTabs}
          value={mode}
          onChange={handleModeChange}
          ariaLabel={MANAGE_STUDENTS_TEXT.title}
          activeVariant="primary"
        />
        {!!createStudents.error && mode === "add" && (
          <Alert tone="error">{errorMessage(createStudents.error)}</Alert>
        )}

        {mode === "add" ? (
          <form onSubmit={handleAdd} noValidate className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={MANAGE_STUDENTS_TEXT.emailLabel}
                type="email"
                value={form.email}
                onChange={(event) => handleFormChange("email", event.target.value)}
              />
              <Input
                label={MANAGE_STUDENTS_TEXT.fullNameLabel}
                value={form.fullName}
                onChange={(event) => handleFormChange("fullName", event.target.value)}
              />
              <Input
                label={MANAGE_STUDENTS_TEXT.studentCodeLabel}
                value={form.studentCode}
                onChange={(event) => handleFormChange("studentCode", event.target.value)}
              />
              <Select
                id="manage-student-class"
                label={MANAGE_STUDENTS_TEXT.classLabel}
                value={selectedClassPublicId}
                options={classOptions}
                placeholder={
                  classesLoading
                    ? MANAGE_STUDENTS_TEXT.classLoading
                    : MANAGE_STUDENTS_TEXT.classPlaceholder
                }
                disabled={classesLoading || Boolean(classesError)}
                error={classesError ? MANAGE_STUDENTS_TEXT.classLoadFailed : undefined}
                searchable
                searchPlaceholder={MANAGE_STUDENTS_TEXT.classSearchPlaceholder}
                noOptionsMessage={MANAGE_STUDENTS_TEXT.classNoOptions}
                onChange={(event) => handleClassChange(event.target.value)}
              />
              <Input
                label={MANAGE_STUDENTS_TEXT.phoneLabel}
                value={form.phone}
                onChange={(event) => handleFormChange("phone", event.target.value)}
              />
              <DateInput
                label={MANAGE_STUDENTS_TEXT.dateOfBirthLabel}
                value={form.dateOfBirth}
                allowTextInput
                onChange={(event) => handleFormChange("dateOfBirth", event.target.value)}
              />
            </div>
            <div>
              <Button
                type="submit"
                isLoading={createStudents.isPending}
                loadingText={MANAGE_STUDENTS_TEXT.adding}
              >
                {MANAGE_STUDENTS_TEXT.addSubmit}
              </Button>
            </div>
          </form>
        ) : (
          <ImportStudentsPanel onCreated={(created, skipped) => setResult({ created, skipped })} />
        )}

        {result && <CreationResult result={result} />}
      </div>
    </Modal>
  );
};

interface CreationResultData {
  created: CreatedAccount[];
  skipped: SkippedRow[];
}

interface CreationResultProps {
  result: CreationResultData;
}

const CreationResult = ({ result }: CreationResultProps): ReactElement => {
  const MANAGE_STUDENTS_TEXT = useManageStudentsText();
  return (
    <div className="flex flex-col gap-3">
      <Alert tone={result.created.length > 0 ? "success" : "warning"}>
        {result.created.length > 0
          ? MANAGE_STUDENTS_TEXT.accountsCreated(result.created.length)
          : MANAGE_STUDENTS_TEXT.noAccountsCreated}
      </Alert>
      <SkippedRowsReport rows={result.skipped} />
      {result.created.length > 0 && (
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {MANAGE_STUDENTS_TEXT.credentialsTitle}
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              {MANAGE_STUDENTS_TEXT.credentialsDescription}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {result.created.map((account) => (
              <CredentialDisplay
                key={account.publicId}
                credential={account.generatedPassword}
                label={MANAGE_STUDENTS_TEXT.credentialLabel(account.fullName, account.username)}
              />
            ))}
          </div>
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => downloadCredentials(result.created)}
            >
              {MANAGE_STUDENTS_TEXT.downloadCredentials}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
