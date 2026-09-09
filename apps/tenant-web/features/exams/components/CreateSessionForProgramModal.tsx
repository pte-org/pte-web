"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Button, Input, Modal, Select } from "@pte/ui";
import { CREATE_SESSION_FOR_PROGRAM_TEXT, CREATE_SESSION_TEXT, EMPTY_CREATE_SESSION } from "../constants";
import { validateCreateSession } from "../utils/validateCreateSession";
import { useBlueprints, useBulkCreateSessionForProgram } from "../api";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useProgramRoster } from "@/features/programs/api";
import { isProgramCurrentlyActive } from "@/features/programs/utils/isProgramCurrentlyActive";
import type { ProgramResponse } from "@pte/api-client";
import type { CreateSessionErrors, CreateSessionInput } from "../types";

interface CreateSessionForProgramModalProps {
  open: boolean;
  onClose: () => void;
  program: ProgramResponse;
  programLabel: string;
}

const T = CREATE_SESSION_FOR_PROGRAM_TEXT;

export const CreateSessionForProgramModal = ({
  open,
  onClose,
  program,
  programLabel,
}: CreateSessionForProgramModalProps): ReactElement => {
  const [form, setForm] = useState<CreateSessionInput>(EMPTY_CREATE_SESSION);
  const [errors, setErrors] = useState<CreateSessionErrors>({});

  const { data: blueprints, isLoading: blueprintsLoading } = useBlueprints();
  const { data: roster, isLoading: rosterLoading } = useProgramRoster(program.publicId);
  const { createSession, bulkEnrollStudents, createdSession, run, retryEnroll, reset } =
    useBulkCreateSessionForProgram();

  const studentPublicIds = (roster ?? []).map((entry) => entry.student.publicId);
  const rosterIsEmpty = !rosterLoading && studentPublicIds.length === 0;
  // Gate submission on the roster fetch actually having resolved, not just
  // on "not currently known to be empty" — otherwise clicking submit while
  // `useProgramRoster` is still loading would silently create a session
  // with an empty `studentPublicIds` array (0 enrolled), landing on the
  // success branch below with nobody actually enrolled.
  const canSubmit = !rosterLoading && studentPublicIds.length > 0;
  const isProgramActive = isProgramCurrentlyActive(program);

  const handleChange = (field: keyof CreateSessionInput, value: string): void =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const handleClose = (): void => {
    reset();
    setForm(EMPTY_CREATE_SESSION);
    setErrors({});
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!canSubmit) return;
    const nextErrors = validateCreateSession(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    run({ ...form, studentPublicIds });
  };

  const blueprintOptions = (blueprints ?? []).map((blueprint) => ({
    label: blueprint.name,
    value: blueprint.id,
  }));

  // Step 2 (enroll) failed after step 1 (create session) already succeeded
  // — show a retry that re-runs only the enroll step against the
  // already-created session, never a second "create session" submission.
  if (createdSession && bulkEnrollStudents.isError) {
    return (
      <Modal open={open} onClose={handleClose} title={T.TITLE(programLabel)}>
        <div className="flex flex-col gap-4">
          <Alert tone="error" title={T.ENROLL_FAILED_TITLE}>
            {errorMessage(bulkEnrollStudents.error)}
          </Alert>
          <div className="flex gap-3">
            <Button type="button" onClick={() => retryEnroll(studentPublicIds)} isLoading={bulkEnrollStudents.isPending}>
              {T.RETRY_ENROLL}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClose}>
              {T.DONE}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (createdSession && bulkEnrollStudents.isSuccess) {
    return (
      <Modal open={open} onClose={handleClose} title={T.TITLE(programLabel)}>
        <div className="flex flex-col gap-4">
          <Alert tone="success">{T.SUCCESS_TITLE(bulkEnrollStudents.data.enrolled.length)}</Alert>
          <div className="flex gap-3">
            <Link
              href={`/host/exams/${createdSession.id}`}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              {T.VIEW_SESSION}
            </Link>
            <Button type="button" variant="secondary" onClick={handleClose}>
              {T.DONE}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  const isSubmitting = createSession.isPending || bulkEnrollStudents.isPending;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={T.TITLE(programLabel)}
      size="xl"
      footer={
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
            disabled={isSubmitting || !canSubmit}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createSession.isPending ? T.SUBMITTING : bulkEnrollStudents.isPending ? T.ENROLLING : T.SUBMIT}
          </button>
        </>
      }
    >
      {!!createSession.error && (
        <div className="mb-4">
          <Alert tone="error">{errorMessage(createSession.error)}</Alert>
        </div>
      )}
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
      </form>
    </Modal>
  );
};
