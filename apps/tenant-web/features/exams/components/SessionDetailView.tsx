"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, LoadingState, PageHeader } from "@pte/ui";
import {
  AddStudentForm,
  RosterImport,
  StudentRosterTable,
} from "@/features/examoperations/components";
import { errorMessage as mutationErrorMessage } from "@/features/examoperations/errorMessage";
import {
  SESSION_DETAIL_TEXT,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_VARIANT,
} from "../constants";
import { useCloseSession, useOpenSession, useSession } from "../api";
import { ProctorAssignmentSection } from "./ProctorAssignmentSection";

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
  const { data: session, isLoading } = useSession(sessionPublicId);
  const open = useOpenSession(sessionPublicId);
  const close = useCloseSession(sessionPublicId);

  if (isLoading || !session) {
    return <LoadingState rows={4} />;
  }

  const lifecycleError = mutationErrorMessage(open.error ?? close.error);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/host/exams" className="text-sm text-blue-700 hover:underline">
        {T.BACK}
      </Link>

      <PageHeader
        title={session.name}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={SESSION_STATUS_VARIANT[session.status]}>
              {SESSION_STATUS_LABELS[session.status]}
            </Badge>
            {session.status === "SCHEDULED" && (
              <button
                type="button"
                onClick={() => open.mutate()}
                disabled={open.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        }
      />

      {lifecycleError && <Alert tone="error">{lifecycleError}</Alert>}

      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-600">
        <p>
          {formatDateTime(session.opensAt)} — {formatDateTime(session.closesAt)}
        </p>
      </div>

      <section className="flex flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{T.STUDENTS_SECTION}</h3>
        <StudentRosterTable sessionPublicId={sessionPublicId} />
        <div className="grid gap-6 border-t border-gray-100 pt-5 lg:grid-cols-2">
          <RosterImport sessionPublicId={sessionPublicId} />
          <AddStudentForm sessionPublicId={sessionPublicId} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{T.PROCTORS_SECTION}</h3>
        <ProctorAssignmentSection sessionPublicId={sessionPublicId} />
      </section>
    </div>
  );
};
