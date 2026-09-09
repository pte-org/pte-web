"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, Input, Modal, Select } from "@pte/ui";
import {
  CREATE_SESSION_FOR_PROGRAM_ERRORS,
  CREATE_SESSION_FOR_PROGRAM_TEXT,
  CREATE_SESSION_TEXT,
  EMPTY_CREATE_SESSION,
} from "../constants";
import { validateCreateSession } from "../utils/validateCreateSession";
import { useBlueprints, useBulkCreateSessionForProgram } from "../api";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useProgramRoster } from "@/features/programs/api";
import { isProgramCurrentlyActive } from "@/features/programs/utils/isProgramCurrentlyActive";
import type { ProgramResponse } from "@pte/api-client";
import type { CreateSessionErrors, CreateSessionInput, SessionBatchState } from "../types";

interface CreateSessionForProgramModalProps {
  open: boolean;
  onClose: () => void;
  program: ProgramResponse;
  programLabel: string;
}

const T = CREATE_SESSION_FOR_PROGRAM_TEXT;

type FormErrors = CreateSessionErrors & { studentsPerSession?: string };

function parsePositiveInt(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function batchRowTone(status: SessionBatchState["status"]): "info" | "success" | "error" {
  if (status === "success") return "success";
  if (status === "sessionError" || status === "enrollError") return "error";
  return "info";
}

const BatchRow = ({ batch, onRetry }: { batch: SessionBatchState; onRetry: () => void }): ReactElement => {
  const failed = batch.status === "sessionError" || batch.status === "enrollError";
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{T.BATCH_LABEL(batch.index + 1, batch.total)}</span>
        <span
          className={
            batchRowTone(batch.status) === "success"
              ? "text-xs text-green-700"
              : batchRowTone(batch.status) === "error"
                ? "text-xs text-red-600"
                : "text-xs text-gray-500"
          }
        >
          {T.BATCH_STATUS[batch.status]}
          {batch.status === "success" && ` (${batch.enrolled.length}/${batch.studentPublicIds.length})`}
        </span>
        {failed && <span className="text-xs text-red-600">{errorMessage(batch.error)}</span>}
      </div>
      <div className="flex items-center gap-2">
        {batch.status === "success" && batch.session && (
          <Link href={`/host/exams/${batch.session.id}`} className="text-sm text-blue-700 hover:underline">
            {T.VIEW_SESSION}
          </Link>
        )}
        {failed && (
          <Button type="button" variant="secondary" onClick={onRetry}>
            {T.RETRY_BATCH}
          </Button>
        )}
      </div>
    </div>
  );
};

export const CreateSessionForProgramModal = ({
  open,
  onClose,
  program,
  programLabel,
}: CreateSessionForProgramModalProps): ReactElement => {
  const [form, setForm] = useState<CreateSessionInput>(EMPTY_CREATE_SESSION);
  const [studentsPerSession, setStudentsPerSession] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: blueprints, isLoading: blueprintsLoading } = useBlueprints();
  const { data: roster, isLoading: rosterLoading } = useProgramRoster(program.publicId);
  const { batches, isRunning, run, retryBatch, reset } = useBulkCreateSessionForProgram();

  const studentPublicIds = (roster ?? []).map((entry) => entry.student.publicId);
  const rosterIsEmpty = !rosterLoading && studentPublicIds.length === 0;
  // Gate submission on the roster fetch actually having resolved, not just
  // on "not currently known to be empty" — otherwise submitting while
  // `useProgramRoster` is still loading would silently create a session
  // with an empty `studentPublicIds` array (0 enrolled).
  const canSubmit = !rosterLoading && studentPublicIds.length > 0;
  const isProgramActive = isProgramCurrentlyActive(program);

  const handleChange = (field: keyof CreateSessionInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleClose = (): void => {
    reset();
    setForm(EMPTY_CREATE_SESSION);
    setStudentsPerSession("");
    setErrors({});
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    const nextErrors: FormErrors = validateCreateSession(form);
    if (studentsPerSession.trim() && parsePositiveInt(studentsPerSession) === undefined) {
      nextErrors.studentsPerSession = CREATE_SESSION_FOR_PROGRAM_ERRORS.STUDENTS_PER_SESSION_INVALID;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    run({ ...form, studentPublicIds, studentsPerSession: parsePositiveInt(studentsPerSession) });
  };

  const blueprintOptions = (blueprints ?? []).map((blueprint) => ({
    label: blueprint.name,
    value: blueprint.id,
  }));

  const hasStarted = batches.length > 0;
  const allSucceeded = hasStarted && batches.every((batch) => batch.status === "success");
  const totalEnrolled = batches.reduce((sum, batch) => sum + batch.enrolled.length, 0);
  const previewBatchCount = parsePositiveInt(studentsPerSession)
    ? Math.ceil(studentPublicIds.length / (parsePositiveInt(studentsPerSession) as number))
    : 1;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={T.TITLE(programLabel)}
      size="xl"
      footer={
        hasStarted ? (
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            {isRunning ? T.CANCEL : T.DONE}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {T.CANCEL}
            </button>
            <button
              type="submit"
              form="create-session-for-program-form"
              disabled={!canSubmit}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {T.SUBMIT}
            </button>
          </>
        )
      }
    >
      {hasStarted ? (
        <div className="flex flex-col gap-4">
          {allSucceeded && <Alert tone="success">{T.ALL_DONE_TITLE(totalEnrolled, batches.length)}</Alert>}
          <div className="flex flex-col gap-2">
            {batches.map((batch) => (
              <BatchRow key={batch.index} batch={batch} onRetry={() => retryBatch(batch.index)} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {!blueprintsLoading && blueprintOptions.length === 0 && (
            <div className="mb-4">
              <Alert tone="warning">{CREATE_SESSION_TEXT.NO_BLUEPRINTS}</Alert>
            </div>
          )}
          {!isProgramActive && (
            <div className="mb-4">
              <Alert tone="warning">{T.INACTIVE_PROGRAM_WARNING}</Alert>
            </div>
          )}
          {rosterIsEmpty ? (
            <div className="mb-4">
              <Alert tone="warning">{T.EMPTY_ROSTER_WARNING}</Alert>
            </div>
          ) : (
            <p className="mb-4 text-sm text-gray-600">
              {T.ROSTER_HEADING}: {rosterLoading ? T.ROSTER_LOADING : T.ROSTER_COUNT(studentPublicIds.length)}
            </p>
          )}
          <form id="create-session-for-program-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label={CREATE_SESSION_TEXT.NAME_LABEL}
              placeholder={CREATE_SESSION_TEXT.NAME_PLACEHOLDER}
              value={form.name}
              error={errors.name}
              onChange={(event) => handleChange("name", event.target.value)}
            />
            <Select
              label={CREATE_SESSION_TEXT.BLUEPRINT_LABEL}
              placeholder={CREATE_SESSION_TEXT.BLUEPRINT_PLACEHOLDER}
              options={blueprintOptions}
              value={form.blueprintPublicId}
              error={errors.blueprintPublicId}
              disabled={blueprintsLoading}
              onChange={(event) => handleChange("blueprintPublicId", event.target.value)}
            />
            <Input
              type="datetime-local"
              label={CREATE_SESSION_TEXT.OPENS_AT_LABEL}
              value={form.opensAt}
              error={errors.opensAt}
              onChange={(event) => handleChange("opensAt", event.target.value)}
            />
            <Input
              type="datetime-local"
              label={CREATE_SESSION_TEXT.CLOSES_AT_LABEL}
              value={form.closesAt}
              error={errors.closesAt}
              onChange={(event) => handleChange("closesAt", event.target.value)}
            />
            <Input
              type="number"
              min={1}
              label={T.STUDENTS_PER_SESSION_LABEL}
              placeholder={T.STUDENTS_PER_SESSION_PLACEHOLDER}
              helperText={T.STUDENTS_PER_SESSION_HELPER}
              error={errors.studentsPerSession}
              value={studentsPerSession}
              onChange={(event) => setStudentsPerSession(event.target.value)}
            />
            {!rosterIsEmpty && parsePositiveInt(studentsPerSession) !== undefined && (
              <p className="text-sm text-gray-600">{T.BATCH_PREVIEW(previewBatchCount)}</p>
            )}
            {previewBatchCount > 1 && (
              <Alert tone="warning">{T.LEAD_TIME_WARNING}</Alert>
            )}
          </form>
        </>
      )}
      {isRunning && (
        <p className="mt-4 text-sm text-gray-500">{T.RUNNING}</p>
      )}
    </Modal>
  );
};
