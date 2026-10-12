"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, FileDropzone } from "@pte/ui";
import { parseRosterFile } from "@/features/examoperations/cleanRosterFile";
import { RosterColumnWarnings } from "@/features/examoperations/components/RosterColumnWarnings";
import { RosterTemplateButton } from "@/features/examoperations/components/RosterTemplateButton";
import { errorMessage } from "@/features/examoperations/errorMessage";
import type {
  CreatedAccount,
  RosterColumnIssues,
  RosterRow,
  SkippedRow,
} from "@/features/examoperations/types";
import { useCreateTenantStudents } from "../api";
import { MANAGE_STUDENTS_TEXT as T } from "../constants";

interface ImportStudentsPanelProps {
  onCreated: (created: CreatedAccount[], skipped: SkippedRow[]) => void;
}

export const ImportStudentsPanel = ({ onCreated }: ImportStudentsPanelProps): ReactElement => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [columnIssues, setColumnIssues] = useState<RosterColumnIssues | null>(null);
  const [parseError, setParseError] = useState<string>();
  const [isReviewing, setIsReviewing] = useState(false);
  const createStudents = useCreateTenantStudents();

  const handleFileSelected = (selected: File): void => {
    setFile(selected);
    setRows(null);
    setColumnIssues(null);
    setParseError(undefined);
    createStudents.reset();
  };

  const handleReview = async (): Promise<void> => {
    if (!file) return;
    setIsReviewing(true);
    setParseError(undefined);
    try {
      const result = await parseRosterFile(file);
      setRows(result.rows);
      setColumnIssues(result);
    } catch (error) {
      setParseError(errorMessage(error));
    } finally {
      setIsReviewing(false);
    }
  };

  const handleImport = (): void => {
    if (!rows) return;
    createStudents.mutate(rows, {
      onSuccess: (response) => {
        onCreated(response.created, response.skipped);
        setFile(null);
        setRows(null);
        setColumnIssues(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <RosterTemplateButton />
      <FileDropzone
        id="student-roster-file"
        label={T.fileLabel}
        description={T.fileDescription}
        accept=".xlsx"
        file={file}
        disabled={createStudents.isPending}
        onFileSelect={handleFileSelected}
      />

      {parseError && <Alert tone="error">{parseError}</Alert>}
      {!!createStudents.error && <Alert tone="error">{errorMessage(createStudents.error)}</Alert>}

      {rows ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-700">{T.rowsFound(rows.length)}</p>
          <RosterColumnWarnings issues={columnIssues} />
          <div>
            <Button
              type="button"
              onClick={handleImport}
              isLoading={createStudents.isPending}
              loadingText={T.importingAccounts}
            >
              {T.importAccounts}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleReview()}
            disabled={!file}
            isLoading={isReviewing}
            loadingText={T.reviewing}
          >
            {T.reviewFile}
          </Button>
        </div>
      )}
    </div>
  );
};
