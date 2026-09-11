"use client";

import { useState, type ReactElement } from "react";
import { ApiError } from "@pte/api-client";
import { Alert, PageHeader } from "@pte/ui";
import { EXAMS_TEXT } from "../constants";
import { useCreateSession, useSessions } from "../api";
import type { CreateSessionInput } from "../types";
import { SessionTable } from "./SessionTable";
import { CreateSessionModal } from "./CreateSessionModal";

function mutationErrorMessage(error: unknown): string | undefined {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error ? error.message : undefined;
}

export const ExamsListView = (): ReactElement => {
  const { data: sessions, isLoading } = useSessions();
  const create = useCreateSession();

  const [createOpen, setCreateOpen] = useState(false);

  const confirmCreate = (input: CreateSessionInput): void => {
    create.mutate(input, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const createErrorMessage = mutationErrorMessage(create.error);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={EXAMS_TEXT.TITLE}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
          >
            + {EXAMS_TEXT.ADD_EXAM}
          </button>
        }
      />

      {createErrorMessage && !createOpen && <Alert tone="error">{createErrorMessage}</Alert>}

      <SessionTable sessions={sessions ?? []} isLoading={isLoading} />

      <CreateSessionModal
        key={createOpen ? "createSession-open" : "createSession-closed"}
        open={createOpen}
        onClose={() => {
          create.reset();
          setCreateOpen(false);
        }}
        onSubmit={confirmCreate}
        error={createErrorMessage}
        isSubmitting={create.isPending}
      />
    </div>
  );
};
