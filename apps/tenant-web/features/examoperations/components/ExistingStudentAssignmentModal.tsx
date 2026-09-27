"use client";

import { useEffect, useState, type ReactElement } from "react";
import { DEFAULT_PAGE_SIZE, type StudentRosterRow } from "@pte/api-client";
import { Alert, Button, Input, LoadingState, Modal, PaginationControls } from "@pte/ui";
import { useStudentRoster } from "@/features/studentSearch/api";
import { errorMessage } from "../errorMessage";
import { useEnrollExistingStudents, useSessionRoster } from "../api";
import { EXISTING_STUDENT_ASSIGNMENT_TEXT } from "./constants";

interface ExistingStudentAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
}

const T = EXISTING_STUDENT_ASSIGNMENT_TEXT;

function studentLabel(student: StudentRosterRow): string {
  const identifiers = [student.email, student.username, student.studentCode].filter(Boolean);
  return identifiers.join(" · ");
}

export const ExistingStudentAssignmentModal = ({
  open,
  onClose,
  sessionPublicId,
}: ExistingStudentAssignmentModalProps): ReactElement => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const assignStudents = useEnrollExistingStudents(sessionPublicId);
  const { data: sessionRoster, isLoading: rosterLoading } = useSessionRoster(sessionPublicId, open);
  const studentsQuery = useStudentRoster(
    {
      page,
      size: DEFAULT_PAGE_SIZE,
      search,
      assignmentStatus: "ALL",
      sort: "FULL_NAME",
      direction: "ASC",
    },
    open,
  );

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [open, searchInput]);

  const assignedStudentIds = new Set((sessionRoster ?? []).map((entry) => entry.student.publicId));
  const availableStudents = (studentsQuery.data?.data ?? []).filter(
    (student) => student.status === "ACTIVE" && !assignedStudentIds.has(student.studentPublicId),
  );
  const visibleStudentIds = availableStudents.map((student) => student.studentPublicId);
  const allVisibleSelected =
    visibleStudentIds.length > 0 &&
    visibleStudentIds.every((id) => selectedStudentIds.includes(id));
  const queryError = errorMessage(studentsQuery.error);
  const assignError = errorMessage(assignStudents.error);
  const isLoading = rosterLoading || studentsQuery.isLoading;

  const toggleStudent = (studentPublicId: string): void => {
    setSelectedStudentIds((current) =>
      current.includes(studentPublicId)
        ? current.filter((id) => id !== studentPublicId)
        : [...current, studentPublicId],
    );
  };

  const toggleAllVisible = (): void => {
    setSelectedStudentIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleStudentIds.includes(id));
      return [...new Set([...current, ...visibleStudentIds])];
    });
  };

  const handleClose = (): void => {
    assignStudents.reset();
    setSearchInput("");
    setSearch("");
    setPage(0);
    setSelectedStudentIds([]);
    onClose();
  };

  const handleSubmit = (): void => {
    if (selectedStudentIds.length === 0) return;
    assignStudents.mutate(selectedStudentIds, { onSuccess: handleClose });
  };

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
            disabled={selectedStudentIds.length === 0}
            isLoading={assignStudents.isPending}
            loadingText={T.SUBMITTING}
          >
            {T.SUBMIT}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label={T.SEARCH_LABEL}
          placeholder={T.SEARCH_PLACEHOLDER}
          helperText={T.SEARCH_HELPER}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          autoFocus
        />

        {queryError && <Alert tone="error">{queryError || T.LOAD_ERROR}</Alert>}
        {assignError && <Alert tone="error">{assignError}</Alert>}

        {isLoading ? (
          <LoadingState rows={4} />
        ) : (
          <>
            {availableStudents.length > 0 && (
              <label className="flex items-center gap-2 border-b border-gray-100 pb-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {T.SELECT_ALL}
              </label>
            )}

            <div className="max-h-72 overflow-y-auto rounded-md border border-gray-200">
              {availableStudents.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {availableStudents.map((student) => (
                    <label
                      key={student.studentPublicId}
                      className="flex cursor-pointer items-start gap-3 px-3 py-3 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student.studentPublicId)}
                        onChange={() => toggleStudent(student.studentPublicId)}
                        aria-label={`Select ${student.fullName}`}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-900">
                          {student.fullName}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {studentLabel(student)}
                          {student.className ? ` · ${student.className}` : ""}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-8 text-center text-sm text-gray-500">
                  {studentsQuery.data?.meta.totalElements ? T.NO_MATCHES : T.NO_STUDENTS}
                </p>
              )}
            </div>

            {studentsQuery.data && studentsQuery.data.meta.totalPages > 1 && (
              <PaginationControls
                meta={studentsQuery.data.meta}
                onPageChange={setPage}
                disabled={studentsQuery.isFetching || assignStudents.isPending}
                totalItemsLabel={T.TOTAL_ITEMS(studentsQuery.data.meta.totalElements)}
              />
            )}
          </>
        )}

        <p className="text-sm text-gray-600">{T.SELECTED(selectedStudentIds.length)}</p>
      </div>
    </Modal>
  );
};
