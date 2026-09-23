"use client";

import { useState, type ReactElement } from "react";
import type { UserResponse } from "@pte/api-client";
import { Alert, Button, LoadingState, Modal } from "@pte/ui";
import { errorMessage } from "../errorMessage";
import { parseRosterFile } from "../cleanRosterFile";
import { useEnrollExistingStudents, useSessionRoster, useTenantStudents } from "../api";
import type { RosterRow } from "../types";
import { RosterDropzone } from "./_RosterDropzone";
import { EXISTING_STUDENT_IMPORT_TEXT as T } from "./constants";

interface ExistingStudentImportModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
}

interface MatchedStudent {
  row: RosterRow;
  student: UserResponse;
}

interface SkippedStudent {
  row: RosterRow;
  reason: string;
}

interface ImportPreview {
  rows: number;
  matched: MatchedStudent[];
  skipped: SkippedStudent[];
}

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function buildIndex(
  students: UserResponse[],
  value: (student: UserResponse) => string | null,
): Map<string, UserResponse[]> {
  const index = new Map<string, UserResponse[]>();
  students.forEach((student) => {
    const key = normalize(value(student));
    if (!key) return;
    index.set(key, [...(index.get(key) ?? []), student]);
  });
  return index;
}

function rowIdentifier(row: RosterRow): string {
  return row.email || row.username || row.studentCode || row.fullName || "Unknown row";
}

function matchRows(
  rows: RosterRow[],
  students: UserResponse[],
  assignedStudentIds: Set<string>,
): ImportPreview {
  const activeStudents = students.filter((student) => student.status === "ACTIVE");
  const byEmail = buildIndex(activeStudents, (student) => student.email);
  const byUsername = buildIndex(activeStudents, (student) => student.username);
  const byStudentCode = buildIndex(activeStudents, (student) => student.studentCode);
  const matched: MatchedStudent[] = [];
  const skipped: SkippedStudent[] = [];
  const matchedIds = new Set<string>();

  rows.forEach((row) => {
    const candidates = [
      [normalize(row.email), byEmail],
      [normalize(row.username), byUsername],
      [normalize(row.studentCode), byStudentCode],
    ] as const;
    const provided = candidates.some(([key]) => key.length > 0);
    const student = candidates
      .map(([key, index]) => (key ? index.get(key) : undefined))
      .find((entries) => entries?.length === 1)?.[0];

    if (!provided) {
      skipped.push({ row, reason: T.IDENTIFIER_REQUIRED });
      return;
    }
    if (!student) {
      skipped.push({ row, reason: T.SKIPPED_REASON });
      return;
    }
    if (assignedStudentIds.has(student.publicId)) {
      skipped.push({ row, reason: T.ALREADY_ENROLLED });
      return;
    }
    if (matchedIds.has(student.publicId)) {
      skipped.push({ row, reason: "This student is listed more than once in the file." });
      return;
    }

    matchedIds.add(student.publicId);
    matched.push({ row, student });
  });

  return { rows: rows.length, matched, skipped };
}

export const ExistingStudentImportModal = ({
  open,
  onClose,
  sessionPublicId,
}: ExistingStudentImportModalProps): ReactElement => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [parseError, setParseError] = useState<string>();
  const [isReviewing, setIsReviewing] = useState(false);
  const studentsQuery = useTenantStudents(open);
  const { data: sessionRoster, isLoading: rosterLoading } = useSessionRoster(sessionPublicId, open);
  const enroll = useEnrollExistingStudents(sessionPublicId);

  const reset = (): void => {
    enroll.reset();
    setFile(null);
    setPreview(null);
    setParseError(undefined);
    setIsReviewing(false);
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  const handleReview = async (): Promise<void> => {
    if (!file || !studentsQuery.data) return;
    setIsReviewing(true);
    setParseError(undefined);
    try {
      const result = await parseRosterFile(file);
      const assignedStudentIds = new Set(
        (sessionRoster ?? []).map((entry) => entry.student.publicId),
      );
      setPreview(matchRows(result.rows, studentsQuery.data, assignedStudentIds));
    } catch (error) {
      setParseError(errorMessage(error, T.IMPORT_ERROR));
    } finally {
      setIsReviewing(false);
    }
  };

  const handleSubmit = (): void => {
    if (!preview || preview.matched.length === 0) return;
    enroll.mutate(
      preview.matched.map(({ student }) => student.publicId),
      { onSuccess: handleClose },
    );
  };

  const loading = studentsQuery.isLoading || rosterLoading;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={T.TITLE}
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {T.CANCEL}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!preview || preview.matched.length === 0}
            isLoading={enroll.isPending}
            loadingText={T.SUBMITTING}
          >
            {T.SUBMIT}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{T.HELPER}</p>
        <RosterDropzone
          fileName={file?.name}
          onFileSelected={(selected) => {
            setFile(selected);
            setPreview(null);
            setParseError(undefined);
          }}
        />

        {studentsQuery.error && <Alert tone="error">{T.LOAD_ERROR}</Alert>}
        {parseError && <Alert tone="error">{parseError}</Alert>}
        {!!enroll.error && <Alert tone="error">{errorMessage(enroll.error)}</Alert>}

        {!preview && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleReview()}
            disabled={!file || loading || isReviewing || Boolean(studentsQuery.error)}
            isLoading={isReviewing}
            loadingText={T.REVIEWING}
          >
            {T.REVIEW}
          </Button>
        )}

        {loading && <LoadingState rows={3} />}

        {preview && !loading && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="rounded-md bg-blue-50 px-3 py-2 text-blue-900">
              <p>{T.ROWS_FOUND(preview.rows)}</p>
              <p className="font-medium">{T.MATCHED(preview.matched.length)}</p>
              {preview.skipped.length > 0 && <p>{T.SKIPPED(preview.skipped.length)}</p>}
            </div>

            {preview.matched.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200">
                <div className="divide-y divide-gray-100">
                  {preview.matched.map(({ row, student }) => (
                    <div key={student.publicId} className="px-3 py-2">
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {student.email} · {rowIdentifier(row)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.skipped.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <p className="font-medium">{T.SKIPPED_TITLE}</p>
                <ul className="mt-1 list-disc pl-5">
                  {preview.skipped.slice(0, 10).map(({ row, reason }, index) => (
                    <li key={`${rowIdentifier(row)}-${index}`}>
                      {rowIdentifier(row)} — {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {preview.matched.length === 0 && <Alert tone="warning">{T.NO_MATCHES}</Alert>}
          </div>
        )}
      </div>
    </Modal>
  );
};
