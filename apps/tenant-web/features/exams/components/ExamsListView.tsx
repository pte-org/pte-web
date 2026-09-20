"use client";

import { useState, type ReactElement } from "react";
import { Alert, PageHeader } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAMS_TEXT } from "../constants";
import { useCreateSession, useSessions } from "../api";
import type { CreateSessionInput } from "../types";
import { SessionTable } from "./SessionTable";
import { CreateSessionModal } from "./CreateSessionModal";

export const ExamsListView = (): ReactElement => {
  const { data: sessions, isLoading } = useSessions();
  const create = useCreateSession();

  const [createOpen, setCreateOpen] = useState(false);

  const confirmCreate = (input: CreateSessionInput): void => {
    create.mutate(input, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const createErrorMessage = errorMessage(create.error);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={EXAMS_TEXT.TITLE}
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-action/25 hover:bg-action-hover"
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
