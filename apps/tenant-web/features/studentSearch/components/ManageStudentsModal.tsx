"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, FileDropzone, Input, Modal, cn } from "@pte/ui";
import { SkippedRowsReport } from "@/features/examoperations/components/SkippedRowsReport";
import { parseRosterFile } from "@/features/examoperations/cleanRosterFile";
import { downloadCredentials } from "@/features/examoperations/downloadCredentials";
import { errorMessage } from "@/features/examoperations/errorMessage";
import type { CreatedAccount, RosterRow, SkippedRow } from "@/features/examoperations/types";
import { MANAGE_STUDENTS_TEXT } from "../constants";
import { useCreateTenantStudents } from "../api";

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
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [parseError, setParseError] = useState<string>();
  const [result, setResult] = useState<CreationResultData>();
  const createStudents = useCreateTenantStudents();

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

  const handleReview = async (): Promise<void> => {
    if (!file) return;
    setParseError(undefined);
    setResult(undefined);
    try {
      const parsed = await parseRosterFile(file);
      setRows(parsed.rows);
    } catch (error) {
      setRows(null);
      setParseError(errorMessage(error));
    }
  };

  const handleImport = (): void => {
    if (!rows || rows.length === 0) return;
    createStudents.mutate(rows, {
      onSuccess: (response) => {
        setResult({ created: response.created, skipped: response.skipped });
        setRows(null);
        setFile(null);
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
              setResult(undefined);
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
              setResult(undefined);
            }}
          >
            {MANAGE_STUDENTS_TEXT.tabImport}
          </button>
        </div>

        <p className="text-sm text-gray-600">{MANAGE_STUDENTS_TEXT.scopeNote}</p>
        {!!createStudents.error && <Alert tone="error">{errorMessage(createStudents.error)}</Alert>}

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
            rows={rows}
            parseError={parseError}
            isCreating={createStudents.isPending}
            onFileSelected={(selectedFile) => {
              setFile(selectedFile);
              setRows(null);
              setParseError(undefined);
              setResult(undefined);
              createStudents.reset();
            }}
            onReview={() => void handleReview()}
            onImport={handleImport}
          />
        )}

        {result && <CreationResult result={result} />}
      </div>
    </Modal>
  );
};

interface ImportStudentsPanelProps {
  file: File | null;
  rows: RosterRow[] | null;
  parseError?: string;
  isCreating: boolean;
  onFileSelected: (file: File) => void;
  onReview: () => void;
  onImport: () => void;
}

const ImportStudentsPanel = ({
  file,
  rows,
  parseError,
  isCreating,
  onFileSelected,
  onReview,
  onImport,
}: ImportStudentsPanelProps): ReactElement => (
  <div className="flex flex-col gap-4">
    <FileDropzone
      id="student-roster-file"
      label={MANAGE_STUDENTS_TEXT.fileLabel}
      description={MANAGE_STUDENTS_TEXT.fileDescription}
      accept=".xlsx"
      file={file}
      error={parseError}
      disabled={isCreating}
      onFileSelect={onFileSelected}
    />

    {!rows && (
      <div>
        <Button type="button" onClick={onReview} disabled={!file || isCreating}>
          {MANAGE_STUDENTS_TEXT.reviewFile}
        </Button>
      </div>
    )}

    {rows && (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-700">{MANAGE_STUDENTS_TEXT.rowsFound(rows.length)}</p>
        <div className="max-h-56 overflow-auto rounded-md border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">{MANAGE_STUDENTS_TEXT.reviewEmail}</th>
                <th className="px-3 py-2">{MANAGE_STUDENTS_TEXT.reviewName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.email}-${index}`} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-700">{row.email}</td>
                  <td className="px-3 py-2 text-gray-700">{row.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <Button
            type="button"
            onClick={onImport}
            isLoading={isCreating}
            loadingText={MANAGE_STUDENTS_TEXT.creatingAccounts}
          >
            {MANAGE_STUDENTS_TEXT.createAccounts}
          </Button>
        </div>
      </div>
    )}
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
      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => downloadCredentials(result.created)}
        >
          {MANAGE_STUDENTS_TEXT.downloadCredentials}
        </Button>
      </div>
    )}
  </div>
);
