"use client";

import { useState, type ReactElement } from "react";
import { Alert, PageHeader } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAMS_TEXT } from "../constants";
import { useActiveScoreTemplate, useCreateExamWorkflow, useSessions } from "../api";
import { SessionTable } from "./SessionTable";
import { CreateExamWizard } from "./CreateExamWizard";

export const ExamsListView = (): ReactElement => {
  const { data: sessions, isLoading } = useSessions();
  const create = useCreateExamWorkflow();
  const activeTemplate = useActiveScoreTemplate();

  const [createOpen, setCreateOpen] = useState(false);

  const confirmCreate = (input: Parameters<typeof create.mutate>[0]): void => {
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

      <CreateExamWizard
        key={createOpen ? "createExamWizard-open" : "createExamWizard-closed"}
        open={createOpen}
        onClose={() => {
          create.reset();
          setCreateOpen(false);
        }}
        onSubmit={confirmCreate}
        activeTemplate={activeTemplate.data}
        templateLoading={activeTemplate.isLoading}
        templateError={activeTemplate.error}
        error={create.error}
        isSubmitting={create.isPending}
      />
    </div>
  );
};
