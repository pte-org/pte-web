"use client";

import { type ReactElement } from "react";
import Link from "next/link";
import { LoadingState, PageHeader, useLocale } from "@pte/ui";
import { errorMessage as mutationErrorMessage } from "@/features/examoperations/errorMessage";
import { useCancelSession, useCloseSession, useOpenSession, useSession } from "../api";
import { ExamDetailTabs } from "./ExamDetailTabs";

interface SessionDetailViewProps {
  sessionPublicId: string;
}

export const SessionDetailView = ({ sessionPublicId }: SessionDetailViewProps): ReactElement => {
  const { t } = useLocale();
  const { data: session, isLoading } = useSession(sessionPublicId);
  const open = useOpenSession(sessionPublicId);
  const close = useCloseSession(sessionPublicId);
  const cancel = useCancelSession(sessionPublicId);

  if (isLoading || !session) {
    return <LoadingState rows={4} />;
  }

  const lifecycleError = mutationErrorMessage(
    open.error ?? close.error ?? cancel.error,
    t("tenant.examOverview.lifecycleError", "Unable to update the exam status."),
  );
  const canOpen = session.status === "SCHEDULED";
  const canClose = session.status === "OPEN";
  const canCancel = ["DRAFT", "PREPARING", "READY", "SCHEDULED"].includes(session.status);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/host/exams" className="text-sm text-[var(--brand-ink)] hover:underline">
        {t("tenant.examOverview.back", "Back to exams")}
      </Link>

      <PageHeader title={session.name} />

      <ExamDetailTabs
        session={session}
        sessionPublicId={sessionPublicId}
        lifecycle={{
          lifecycleError,
          onOpen: () => open.mutate(),
          onClose: () => {
            if (
              window.confirm(
                t(
                  "tenant.examOverview.closeConfirm",
                  "Close this exam now? Students who are still working will no longer be able to submit answers. You must close the session before publishing results.",
                ),
              )
            ) {
              close.mutate();
            }
          },
          onCancel: () => {
            if (
              window.confirm(
                t(
                  "tenant.examOverview.cancelConfirm",
                  "Cancel this exam? Students will not be able to access it.",
                ),
              )
            ) {
              cancel.mutate();
            }
          },
          canOpen,
          canClose,
          canCancel,
          openPending: open.isPending,
          closePending: close.isPending,
          cancelPending: cancel.isPending,
        }}
      />
    </div>
  );
};
