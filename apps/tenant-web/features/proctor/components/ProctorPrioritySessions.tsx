"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { ProctorWorkspaceSessionResponse } from "@pte/api-client";
import { Button, DashboardPanel, StatusBadge } from "@pte/ui";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";

interface ProctorPrioritySessionsProps {
  sessions: ProctorWorkspaceSessionResponse[];
  timezone?: string;
  isLoading: boolean;
  onViewToday: () => void;
}

const PRIORITY_SESSION_LIMIT = 5;

interface ProctorPrioritySessionRowProps {
  session: ProctorWorkspaceSessionResponse;
  timezone?: string;
}

const ProctorPrioritySessionRow = ({
  session,
  timezone,
}: ProctorPrioritySessionRowProps): ReactElement => {
  const text = useProctorWorkspaceText();
  const router = useRouter();
  const dateTime = new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
    timeZone: timezone,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const blockingLabel = (session: ProctorWorkspaceSessionResponse): string => {
    switch (session.monitoringBlockingReason) {
      case "WINDOW_NOT_OPENED":
        return text.format("monitoringOpensAt", {
          time: dateTime.format(new Date(session.opensAt)),
        });
      case "WINDOW_CLOSED":
        return text.monitoringWindowClosed;
      default:
        return text.monitoringUnavailable;
    }
  };
  const sessionId = session.examSessionPublicId;
  const scheduled = session.status === "SCHEDULED";
  const statusLabel =
    session.status === "OPEN"
      ? text.statusOpen
      : scheduled
        ? text.statusScheduled
        : session.status === "CANCELLED"
          ? text.statusCancelled
          : text.statusClosed;
  return (
    <div
      key={session.assignmentPublicId || sessionId}
      className="flex flex-col gap-4 py-5 first:pt-1 last:pb-1 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-words text-sm font-semibold text-[var(--ink-primary)]">
            {session.name}
          </span>
          <StatusBadge
            label={statusLabel}
            variant={
              session.status === "OPEN"
                ? "success"
                : scheduled
                  ? "info"
                  : session.status === "CANCELLED"
                    ? "danger"
                    : "neutral"
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--ink-muted)]">
          <span>
            {text.tableColOpensAt}: {dateTime.format(new Date(session.opensAt))}
          </span>
          <span>
            {text.tableColClosesAt}: {dateTime.format(new Date(session.closesAt))}
          </span>
          <span>
            {session.assignmentRole === "LEAD_PROCTOR" ? text.roleLead : text.roleProctor}
          </span>
        </div>
        {!session.canMonitor && (
          <p className="text-xs text-[var(--ink-secondary)]">{blockingLabel(session)}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          appearance="ghost"
          size="sm"
          onClick={() => router.push(`/proctor/audit-log/${sessionId}`)}
        >
          {text.auditLog}
        </Button>
        <Button
          variant={session.canMonitor ? "primary" : "secondary"}
          size="sm"
          onClick={() => router.push(`/proctor/attendance/${sessionId}`)}
        >
          {text.openSession}
        </Button>
      </div>
    </div>
  );
};

export const ProctorPrioritySessions = ({
  sessions,
  timezone,
  isLoading,
  onViewToday,
}: ProctorPrioritySessionsProps): ReactElement => {
  const text = useProctorWorkspaceText();
  const priority = sessions.slice(0, PRIORITY_SESSION_LIMIT);
  const isUpcoming = (session: ProctorWorkspaceSessionResponse): boolean =>
    !session.canMonitor && session.monitoringBlockingReason === "WINDOW_NOT_OPENED";
  const otherSessions = priority.filter((session) => !session.canMonitor && !isUpcoming(session));
  const groups = [
    {
      title: text.priorityTitle,
      sessions: priority.filter((session) => session.canMonitor),
      empty: text.priorityEmpty,
    },
    {
      title: text.cardUpcomingTitle,
      sessions: priority.filter(isUpcoming),
      empty: text.upcomingEmpty,
    },
    ...(otherSessions.length
      ? [{ title: text.otherSessions, sessions: otherSessions, empty: text.priorityEmpty }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {groups.map((group, index) => (
        <DashboardPanel
          key={group.title}
          title={group.title}
          actions={
            index === 0 ? (
              <Button variant="secondary" appearance="ghost" size="sm" onClick={onViewToday}>
                {text.viewTodaySchedule}
              </Button>
            ) : undefined
          }
          status={isLoading ? "loading" : group.sessions.length === 0 ? "empty" : "content"}
          loadingLabel={text.loading}
          empty={{ title: group.empty }}
        >
          <div className="divide-y divide-[var(--divider)]">
            {group.sessions.map((session) => (
              <ProctorPrioritySessionRow
                key={session.assignmentPublicId || session.examSessionPublicId}
                session={session}
                timezone={timezone}
              />
            ))}
          </div>
        </DashboardPanel>
      ))}
    </div>
  );
};
