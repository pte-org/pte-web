"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, LoadingState, PageHeader } from "@pte/ui";
import { errorMessage as mutationErrorMessage } from "@/features/examoperations/errorMessage";
import { SESSION_DETAIL_TEXT, SESSION_STATUS_LABELS, SESSION_STATUS_VARIANT } from "../constants";
import { useCancelSession, useCloseSession, useOpenSession, useSession } from "../api";
import { ExamDetailTabs } from "./ExamDetailTabs";
import { ExamPreviewModal } from "./ExamPreviewModal";

interface SessionDetailViewProps {
  sessionPublicId: string;
}

const T = SESSION_DETAIL_TEXT;

export const SessionDetailView = ({ sessionPublicId }: SessionDetailViewProps): ReactElement => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { data: session, isLoading } = useSession(sessionPublicId);
  const open = useOpenSession(sessionPublicId);
  const close = useCloseSession(sessionPublicId);
  const cancel = useCancelSession(sessionPublicId);

  if (isLoading || !session) {
    return <LoadingState rows={4} />;
  }

  const lifecycleError = mutationErrorMessage(open.error ?? close.error ?? cancel.error);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/host/exams" className="text-sm text-[var(--brand-ink)] hover:underline">
        {T.BACK}
      </Link>

      <PageHeader
        title={session.name}
        actions={
          <div className="flex items-center gap-3">
            {session.snapshotPublicId && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="rounded-lg border border-action px-4 py-2 text-sm font-semibold text-action hover:bg-[var(--action-tint)]"
              >
                {T.VIEW_EXAM}
              </button>
            )}
            <Badge variant={SESSION_STATUS_VARIANT[session.status]}>
              {SESSION_STATUS_LABELS[session.status]}
            </Badge>
            {session.status === "SCHEDULED" && (
              <button
                type="button"
                onClick={() => open.mutate()}
                disabled={open.isPending}
                className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-action/25 hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {T.OPEN_EXAM}
              </button>
            )}
            {session.status === "OPEN" && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(T.CLOSE_EXAM_CONFIRM_CUTOFF)) close.mutate();
                }}
                disabled={close.isPending}
                className="rounded-lg border border-[var(--shell-border)] px-4 py-2 text-sm font-semibold text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {T.CLOSE_EXAM}
              </button>
            )}
            {["DRAFT", "PREPARING", "READY", "SCHEDULED"].includes(session.status) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(T.CANCEL_EXAM_CONFIRM)) cancel.mutate();
                }}
                disabled={cancel.isPending}
                className="rounded-lg border border-[var(--blush-action)] px-4 py-2 text-sm font-semibold text-[var(--blush-action)] hover:bg-[var(--blush-tint)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {T.CANCEL_EXAM}
              </button>
            )}
          </div>
        }
      />

      <ExamPreviewModal
        sessionPublicId={sessionPublicId}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {lifecycleError && <Alert tone="error">{lifecycleError}</Alert>}
      <ExamDetailTabs session={session} sessionPublicId={sessionPublicId} />
    </div>
  );
};
