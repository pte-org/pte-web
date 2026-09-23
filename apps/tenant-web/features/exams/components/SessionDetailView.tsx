"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, Button, CollapsibleSection, LoadingState, PageHeader } from "@pte/ui";
import {
  ExistingStudentAssignmentModal,
  ExistingStudentImportModal,
  StudentRosterTable,
} from "@/features/examoperations/components";
import { errorMessage as mutationErrorMessage } from "@/features/examoperations/errorMessage";
import { SESSION_DETAIL_TEXT, SESSION_STATUS_LABELS, SESSION_STATUS_VARIANT } from "../constants";
import { useCancelSession, useCloseSession, useOpenSession, useSession } from "../api";
import { AnswersSection } from "./AnswersSection";
import { ClassAssignmentSection } from "./ClassAssignmentSection";
import { ProctorAssignmentSection } from "./ProctorAssignmentSection";
import { ExaminerAssignmentSection } from "./ExaminerAssignmentSection";
import { ExamPreviewModal } from "./ExamPreviewModal";

interface SessionDetailViewProps {
  sessionPublicId: string;
}

const T = SESSION_DETAIL_TEXT;

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export const SessionDetailView = ({ sessionPublicId }: SessionDetailViewProps): ReactElement => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [studentAssignmentOpen, setStudentAssignmentOpen] = useState(false);
  const [studentImportOpen, setStudentImportOpen] = useState(false);
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
      <Link href="/host/exams" className="text-sm text-blue-700 hover:underline">
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
                className="rounded-md border border-action px-4 py-2 text-sm font-semibold text-action hover:bg-blue-50"
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
                onClick={() => close.mutate()}
                disabled={close.isPending}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
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

      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
        <p>
          {formatDateTime(session.opensAt)} — {formatDateTime(session.closesAt)}
        </p>
      </div>

      <CollapsibleSection
        title={T.CLASSES_SECTION}
        className="rounded-lg border border-gray-200 bg-white p-5"
        contentClassName="flex flex-col gap-3"
      >
        <ClassAssignmentSection
          sessionPublicId={sessionPublicId}
          canModify={session.status === "SCHEDULED"}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title={T.STUDENTS_SECTION}
        className="rounded-lg border border-gray-200 bg-white p-5"
        contentClassName="flex flex-col gap-5"
        actions={
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              onClick={() => setStudentAssignmentOpen(true)}
              disabled={session.status !== "SCHEDULED"}
              title={session.status !== "SCHEDULED" ? T.AUDIENCE_NOT_SCHEDULED_NOTICE : undefined}
            >
              {T.ADD_EXISTING_STUDENTS}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setStudentImportOpen(true)}
              disabled={session.status !== "SCHEDULED"}
              title={session.status !== "SCHEDULED" ? T.AUDIENCE_NOT_SCHEDULED_NOTICE : undefined}
            >
              {T.IMPORT_EXISTING_STUDENTS}
            </Button>
          </div>
        }
      >
        {session.status !== "SCHEDULED" && (
          <Alert tone="warning">{T.AUDIENCE_NOT_SCHEDULED_NOTICE}</Alert>
        )}
        <StudentRosterTable sessionPublicId={sessionPublicId} />
      </CollapsibleSection>

      <ExistingStudentAssignmentModal
        open={studentAssignmentOpen}
        onClose={() => setStudentAssignmentOpen(false)}
        sessionPublicId={sessionPublicId}
      />
      <ExistingStudentImportModal
        open={studentImportOpen}
        onClose={() => setStudentImportOpen(false)}
        sessionPublicId={sessionPublicId}
      />

      <ProctorAssignmentSection sessionPublicId={sessionPublicId} />

      <ExaminerAssignmentSection sessionPublicId={sessionPublicId} />

      <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{T.ANSWERS_SECTION}</h3>
        <AnswersSection sessionPublicId={sessionPublicId} />
      </section>
    </div>
  );
};
