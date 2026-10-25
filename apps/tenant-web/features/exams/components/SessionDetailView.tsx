"use client";

import { usePathname } from "next/navigation";

import { useState, type ReactElement } from "react";
import {
  ConfirmDialog,
  LoadingState,
  useLocale,
  useDashboardBreadcrumbLabel,
  useToast,
} from "@pte/ui";
import { errorMessage as mutationErrorMessage } from "@/features/examoperations/errorMessage";
import { useCancelSession, useCloseSession, useOpenSession, useSession } from "../api";
import { ExamDetailTabs } from "./ExamDetailTabs";

interface SessionDetailViewProps {
  sessionPublicId: string;
}

export const SessionDetailView = ({ sessionPublicId }: SessionDetailViewProps): ReactElement => {
  const { t } = useLocale();
  const { showToast } = useToast();
  const { data: session, isLoading } = useSession(sessionPublicId);
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, session?.name);
  const open = useOpenSession(sessionPublicId);
  const close = useCloseSession(sessionPublicId);
  const cancel = useCancelSession(sessionPublicId);
  const [pendingAction, setPendingAction] = useState<"close" | "cancel" | null>(null);

  if (isLoading || !session) {
    return <LoadingState rows={4} />;
  }

  const lifecycleError = mutationErrorMessage(
    open.error ?? close.error ?? cancel.error,
    t("tenant.examOverview.lifecycleError", "Unable to update the exam status."),
  );
  const canOpen = session.status === "SCHEDULED";
  const canClose = session.status === "OPEN";
  const canCancel = ["READY", "SCHEDULED"].includes(session.status);

  return (
    <div className="flex flex-col gap-5">
      <ExamDetailTabs
        session={session}
        sessionPublicId={sessionPublicId}
        lifecycle={{
          lifecycleError,
          onOpen: () =>
            open.mutate(undefined, {
              onSuccess: () =>
                showToast(t("tenant.examOverview.openSuccess", "Exam opened."), {
                  tone: "success",
                }),
            }),
          onClose: () => setPendingAction("close"),
          onCancel: () => setPendingAction("cancel"),
          canOpen,
          canClose,
          canCancel,
          openPending: open.isPending,
          closePending: close.isPending,
          cancelPending: cancel.isPending,
        }}
      />

      <ConfirmDialog
        open={pendingAction === "close"}
        title={t("tenant.examOverview.closeConfirmTitle", "Close this exam now?")}
        description={t(
          "tenant.examOverview.closeConfirm",
          "Students who are still working will no longer be able to submit answers. You must close the session before publishing results.",
        )}
        confirmLabel={t("tenant.examOverview.close", "Close exam")}
        cancelLabel={t("tenant.examOverview.keepExam", "Go back")}
        tone="danger"
        isConfirming={close.isPending}
        onConfirm={() =>
          close.mutate(undefined, {
            onSuccess: () =>
              showToast(t("tenant.examOverview.closeSuccess", "Exam closed."), { tone: "success" }),
            onSettled: () => setPendingAction(null),
          })
        }
        onClose={() => setPendingAction(null)}
      />
      <ConfirmDialog
        open={pendingAction === "cancel"}
        title={t("tenant.examOverview.cancelConfirmTitle", "Cancel this exam?")}
        description={t(
          "tenant.examOverview.cancelConfirm",
          "Students will not be able to access it.",
        )}
        confirmLabel={t("tenant.examOverview.cancel", "Cancel exam")}
        cancelLabel={t("tenant.examOverview.keepExam", "Go back")}
        tone="danger"
        isConfirming={cancel.isPending}
        onConfirm={() =>
          cancel.mutate(undefined, {
            onSuccess: () =>
              showToast(t("tenant.examOverview.cancelSuccess", "Exam cancelled."), {
                tone: "success",
              }),
            onSettled: () => setPendingAction(null),
          })
        }
        onClose={() => setPendingAction(null)}
      />
    </div>
  );
};
