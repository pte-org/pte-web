"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import type { ProctorWorkspaceSessionResponse } from "@pte/api-client";
import { Button, Skeleton } from "@pte/ui";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";

export interface ProctorPrioritySessionsProps {
  sessions: ProctorWorkspaceSessionResponse[];
  isLoading: boolean;
  onViewToday: () => void;
}

function sessionStatusBadgeClass(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-800";
    case "SCHEDULED":
      return "bg-blue-100 text-blue-800";
    case "CLOSED":
      return "bg-slate-100 text-slate-700";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function ProctorPrioritySessions({
  sessions,
  isLoading,
  onViewToday,
}: ProctorPrioritySessionsProps): ReactElement {
  const text = useProctorWorkspaceText();

  const formatDateTime = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "OPEN":
        return text.statusOpen;
      case "SCHEDULED":
        return text.statusScheduled;
      case "CLOSED":
        return text.statusClosed;
      case "CANCELLED":
        return text.statusCancelled;
      default:
        return status;
    }
  };

  const priorityItems = sessions.slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{text.priorityTitle}</h3>
          <p className="text-xs text-slate-500">{text.prioritySubtitle}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onViewToday}>
          {text.viewTodaySchedule}
        </Button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : priorityItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            {text.priorityEmpty}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {priorityItems.map((session) => {
              const sessionId = session.examSessionPublicId;
              const roleName =
                session.assignmentRole === "LEAD_PROCTOR" ? text.roleLead : text.roleProctor;

              return (
                <div
                  key={session.assignmentPublicId || sessionId}
                  className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-slate-900">{session.name}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sessionStatusBadgeClass(
                          session.status,
                        )}`}
                      >
                        {getStatusLabel(session.status)}
                      </span>
                      <span className="text-xs text-slate-500">({roleName})</span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span>
                        {text.tableColOpensAt}: {formatDateTime(session.opensAt)}
                      </span>
                      <span>
                        {text.tableColClosesAt}: {formatDateTime(session.closesAt)}
                      </span>
                      {session.monitoringBlockingReason && !session.canMonitor && (
                        <span className="text-amber-700">
                          {text.blockedReasonPrefix}
                          {session.monitoringBlockingReason}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/proctor/audit-log/${sessionId}`}>
                      <Button variant="secondary" size="sm">
                        {text.auditLog}
                      </Button>
                    </Link>

                    {session.canMonitor ? (
                      <Link href={`/proctor/sessions/${sessionId}`}>
                        <Button variant="primary" size="sm">
                          {text.enterMonitoring}
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/proctor/sessions/${sessionId}`}>
                        <Button variant="secondary" size="sm">
                          {text.viewRoom}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
