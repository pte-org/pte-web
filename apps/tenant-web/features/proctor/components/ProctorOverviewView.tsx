"use client";

import { useCallback, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { ProctorScope } from "@pte/api-client";
import {
  Button,
  NavApplicationIcon,
  NavAuditLogIcon,
  NavSupportTicketIcon,
  NavUserGroupIcon,
  PageHeader,
} from "@pte/ui";
import { useProctorWorkspaceOverview } from "../api";
import { useClientTimezone, useMidnightBoundaryRefresh } from "../hooks/useClientTimezone";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";
import { PROCTOR_QUERY_KEYS } from "../queryKeys";
import { ProctorPrioritySessions } from "./ProctorPrioritySessions";
import { ProctorWorkspaceOverview } from "./ProctorWorkspaceOverview";

export function ProctorOverviewView(): ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const text = useProctorWorkspaceText();
  const { timezone, isResolved } = useClientTimezone();

  const overviewQuery = useProctorWorkspaceOverview(timezone);

  const handleMidnight = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: PROCTOR_QUERY_KEYS.all });
  }, [queryClient]);

  useMidnightBoundaryRefresh({
    dayEnd: overviewQuery.data?.dayEnd,
    timezone,
    onMidnight: handleMidnight,
  });

  const handleSelectScope = useCallback(
    (scope: ProctorScope) => {
      router.push(`/proctor/sessions?scope=${scope}`);
    },
    [router],
  );

  const quickLinks = [
    {
      label: text.viewMonitoring,
      href: "/proctor/sessions?scope=ACCESSIBLE",
      icon: <NavApplicationIcon className="h-5 w-5 text-indigo-600" />,
      desc: text.cardAccessibleDescription,
    },
    {
      label: text.viewAttendance,
      href: "/proctor/attendance",
      icon: <NavUserGroupIcon className="h-5 w-5 text-emerald-600" />,
      desc: text.actionRecordAttendance,
    },
    {
      label: text.viewIncidents,
      href: "/proctor/incidents",
      icon: <NavSupportTicketIcon className="h-5 w-5 text-amber-600" />,
      desc: text.incidentsSubtitle,
    },
    {
      label: text.viewAuditLog,
      href: "/proctor/audit-log",
      icon: <NavAuditLogIcon className="h-5 w-5 text-slate-600" />,
      desc: text.actionViewAudit,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <PageHeader
        title={text.overviewTitle}
        subtitle={text.overviewSubtitle}
        actions={
          <Link href="/proctor/sessions?scope=ALL">
            <Button variant="secondary" size="sm">
              {text.filterAll}
            </Button>
          </Link>
        }
      />

      {/* Overview Stat Cards */}
      <ProctorWorkspaceOverview
        counts={overviewQuery.data?.counts}
        asOf={overviewQuery.data?.asOf}
        timezone={overviewQuery.data?.timezone ?? timezone ?? undefined}
        isLoading={overviewQuery.isLoading || !isResolved}
        isError={overviewQuery.isError}
        error={overviewQuery.error}
        onRetry={() => void overviewQuery.refetch()}
        selectedScope="ALL"
        onSelectScope={handleSelectScope}
        onRefresh={() => void overviewQuery.refetch()}
      />

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-4 shadow-sm transition hover:border-slate-400 hover:shadow"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-subtle)]">
              {item.icon}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--ink-primary)]">
                {item.label}
              </div>
              <div className="truncate text-xs text-[var(--ink-muted)]">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Priority Sessions Preview */}
      <ProctorPrioritySessions
        sessions={overviewQuery.data?.prioritySessions ?? []}
        isLoading={overviewQuery.isLoading || !isResolved}
        onViewToday={() => handleSelectScope("TODAY")}
      />
    </div>
  );
}
