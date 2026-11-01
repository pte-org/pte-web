"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, useLocale } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { EXAMS_TEXT } from "../constants";
import { useCreateExamWorkflow, useSelectableTemplates, useSessions } from "../api";
import { SessionTable } from "./SessionTable";
import { CreateExamWizard } from "./CreateExamWizard";

export const ExamsListView = (): ReactElement => {
  const { t } = useLocale();
  const { data: sessions, isLoading } = useSessions();
  const create = useCreateExamWorkflow();
  const selectable = useSelectableTemplates();

  const [createOpen, setCreateOpen] = useState(false);

  const confirmCreate = (input: Parameters<typeof create.mutate>[0]): void => {
    create.mutate(input, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const createErrorMessage = errorMessage(create.error);

  return (
    <div className="flex flex-col gap-5">
      {createErrorMessage && !createOpen && <Alert tone="error">{createErrorMessage}</Alert>}

      <SessionTable
        sessions={sessions ?? []}
        isLoading={isLoading}
        toolbarActions={
          <Button onClick={() => setCreateOpen(true)}>
            + {t("tenant.createExam.TITLE", EXAMS_TEXT.ADD_EXAM)}
          </Button>
        }
      />

      <CreateExamWizard
        key={`${createOpen ? "createExamWizard-open" : "createExamWizard-closed"}-${selectable.defaultTemplate?.publicId ?? "no-template"}-${selectable.templates.length}`}
        open={createOpen}
        onClose={() => {
          create.reset();
          setCreateOpen(false);
        }}
        onSubmit={confirmCreate}
        activeTemplate={selectable.defaultTemplate}
        templates={selectable.templates}
        templateError={selectable.error}
        error={create.error}
        isSubmitting={create.isPending}
      />
    </div>
  );
};
