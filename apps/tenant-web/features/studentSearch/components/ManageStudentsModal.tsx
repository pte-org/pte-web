"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, CredentialDisplay, FileDropzone, Input, Modal, cn } from "@pte/ui";
import { SkippedRowsReport } from "@/features/examoperations/components/SkippedRowsReport";
import { downloadCredentials } from "@/features/examoperations/downloadCredentials";
import { errorMessage } from "@/features/examoperations/errorMessage";
import type { CreatedAccount, RosterRow, SkippedRow } from "@/features/examoperations/types";
import { MANAGE_STUDENTS_TEXT } from "../constants";
import { useCreateTenantStudents, useImportStudentRoster } from "../api";
import { downloadRoster } from "../downloadRoster";

type ManageStudentsMode = "add" | "import";

interface ManageStudentsModalProps {
  open: boolean;
  initialMode: ManageStudentsMode;
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

const TAB_CLASS = (active: boolean): string =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium",
    active ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100",
  );

export const ManageStudentsModal = ({
  open,
  initialMode,
  onClose,
}: ManageStudentsModalProps): ReactElement => {
  const [mode, setMode] = useState<ManageStudentsMode>(initialMode);
  const [form, setForm] = useState<AddStudentFormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CreationResultData>();
  const [importCompleted, setImportCompleted] = useState(false);
  const createStudents = useCreateTenantStudents();
  const importStudents = useImportStudentRoster();

  const handleFormChange = (field: keyof AddStudentFormState, value: string): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleAdd = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setResult(undefined);
    createStudents.mutate([form], {
      onSuccess: (response) => {
        setResult({ created: response.created, skipped: response.skipped });
        setForm(EMPTY_FORM);
      },
    });
  };

  const handleImport = (): void => {
    if (!file) return;
    setResult(undefined);
    setImportCompleted(false);
    importStudents.mutate(file, {
      onSuccess: (response) => {
        downloadRoster(response);
        setFile(null);
        setImportCompleted(true);
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
        <div className="flex gap-2 rounded-lg bg-gray-50 p-1">
          <button
            type="button"
            className={TAB_CLASS(mode === "add")}
            aria-pressed={mode === "add"}
            onClick={() => {
              setMode("add");
              createStudents.reset();
              importStudents.reset();
              setResult(undefined);
              setImportCompleted(false);
            }}
          >
            {MANAGE_STUDENTS_TEXT.tabAdd}
          </button>
          <button
            type="button"
            className={TAB_CLASS(mode === "import")}
            aria-pressed={mode === "import"}
            onClick={() => {
              setMode("import");
              createStudents.reset();
              importStudents.reset();
              setResult(undefined);
              setImportCompleted(false);
            }}
          >
            {MANAGE_STUDENTS_TEXT.tabImport}
          </button>
        </div>

        <p className="text-sm text-gray-600">{MANAGE_STUDENTS_TEXT.scopeNote}</p>
        {!!(createStudents.error || importStudents.error) && (
          <Alert tone="error">{errorMessage(createStudents.error ?? importStudents.error)}</Alert>
        )}

        {mode === "add" ? (
          <form onSubmit={handleAdd} noValidate className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={MANAGE_STUDENTS_TEXT.emailLabel}
                type="email"
                value={form.email}
                onChange={(event) => handleFormChange("email", event.target.value)}
                required
              />
              <Input
                label={MANAGE_STUDENTS_TEXT.fullNameLabel}
                value={form.fullName}
                onChange={(event) => handleFormChange("fullName", event.target.value)}
                required
              />
              <Input
                label={MANAGE_STUDENTS_TEXT.studentCodeLabel}
                value={form.studentCode}
                onChange={(event) => handleFormChange("studentCode", event.target.value)}
              />
              <Input
                label={MANAGE_STUDENTS_TEXT.classLabel}
                value={form.className}
                onChange={(event) => handleFormChange("className", event.target.value)}
              />
              <Input
                label={MANAGE_STUDENTS_TEXT.phoneLabel}
                value={form.phone}
                onChange={(event) => handleFormChange("phone", event.target.value)}
              />
              <Input
                type="date"
                label={MANAGE_STUDENTS_TEXT.dateOfBirthLabel}
                value={form.dateOfBirth}
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
          <ImportStudentsPanel
            file={file}
            isCreating={importStudents.isPending}
            onFileSelected={(selectedFile) => {
              setFile(selectedFile);
              setResult(undefined);
              setImportCompleted(false);
              importStudents.reset();
            }}
            onImport={handleImport}
          />
        )}

        {importCompleted && <Alert tone="success">{MANAGE_STUDENTS_TEXT.importSuccess}</Alert>}
        {result && <CreationResult result={result} />}
      </div>
    </Modal>
  );
};

interface ImportStudentsPanelProps {
  file: File | null;
  isCreating: boolean;
  onFileSelected: (file: File) => void;
  onImport: () => void;
}

const ImportStudentsPanel = ({
  file,
  isCreating,
  onFileSelected,
  onImport,
}: ImportStudentsPanelProps): ReactElement => (
  <div className="flex flex-col gap-4">
    <FileDropzone
      id="student-roster-file"
      label={MANAGE_STUDENTS_TEXT.fileLabel}
      description={MANAGE_STUDENTS_TEXT.fileDescription}
      accept=".xlsx"
      file={file}
      disabled={isCreating}
      onFileSelect={onFileSelected}
    />

    <div>
      <Button
        type="button"
        onClick={onImport}
        isLoading={isCreating}
        loadingText={MANAGE_STUDENTS_TEXT.importingAccounts}
        disabled={!file || isCreating}
      >
        {MANAGE_STUDENTS_TEXT.importAccounts}
      </Button>
    </div>
  </div>
);

interface CreationResultData {
  created: CreatedAccount[];
  skipped: SkippedRow[];
}

interface CreationResultProps {
  result: CreationResultData;
}

const CreationResult = ({ result }: CreationResultProps): ReactElement => (
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
              label={MANAGE_STUDENTS_TEXT.credentialLabel(account.fullName, account.email)}
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
