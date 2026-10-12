"use client";

import { useCallback, useMemo, type ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { ProctorScope } from "@pte/api-client";
import { Button, PageHeader, Skeleton } from "@pte/ui";
import { useAssignedProctorSessions, useProctorWorkspaceOverview } from "../api";
import { useClientTimezone, useMidnightBoundaryRefresh } from "../hooks/useClientTimezone";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";
import { PROCTOR_QUERY_KEYS } from "../queryKeys";
import { ProctorPrioritySessions } from "./ProctorPrioritySessions";
import { ProctorWorkspaceOverview } from "./ProctorWorkspaceOverview";

const VALID_SCOPES: ProctorScope[] = ["ALL", "ACCESSIBLE", "UPCOMING", "TODAY"];

function parseScope(value: string | null): ProctorScope {
  if (value && VALID_SCOPES.includes(value as ProctorScope)) {
    return value as ProctorScope;
  }
  return "ALL";
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

export function AssignedSessionsView(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const text = useProctorWorkspaceText();

  const { timezone, isResolved: isTimezoneResolved } = useClientTimezone();

  // URL-driven filter state
  const scope = parseScope(searchParams.get("scope"));
  const rawPage = parseInt(searchParams.get("page") ?? "0", 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const pageSize = 20;

  const updateUrl = useCallback(
    (newScope: ProctorScope, newPage = 0) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newScope === "ALL") {
        params.delete("scope");
      } else {
        params.set("scope", newScope);
      }
      if (newPage === 0) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  // Queries
  const overviewQuery = useProctorWorkspaceOverview(timezone);
  const listQuery = useAssignedProctorSessions({
    page,
    size: pageSize,
    scope,
    timezone,
  });

  // Midnight boundary refresh
  const handleMidnight = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: PROCTOR_QUERY_KEYS.all });
  }, [queryClient]);

  useMidnightBoundaryRefresh({
    dayEnd: overviewQuery.data?.dayEnd,
    timezone,
    onMidnight: handleMidnight,
  });

  const handleRefresh = useCallback(() => {
    void overviewQuery.refetch();
    void listQuery.refetch();
  }, [overviewQuery, listQuery]);

  const sessions = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const formatDateTime = useCallback(
    (iso: string): string => {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return iso;
      return new Intl.DateTimeFormat(text.locale === "vi" ? "vi-VN" : "en-US", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
    },
    [text.locale],
  );

  const getStatusLabel = useCallback(
    (status: string): string => {
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
    },
    [text],
  );

  const scopeFilterTabs: Array<{ id: ProctorScope; label: string }> = useMemo(
    () => [
      { id: "ALL", label: text.filterAll },
      { id: "ACCESSIBLE", label: text.filterAccessible },
      { id: "UPCOMING", label: text.filterUpcoming },
      { id: "TODAY", label: text.filterToday },
    ],
    [text],
  );

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-8">
      <PageHeader title={text.pageTitle} subtitle={text.pageSubtitle} />

      {/* Overview Cards */}
      <ProctorWorkspaceOverview
        counts={overviewQuery.data?.counts}
        asOf={overviewQuery.data?.asOf}
        timezone={overviewQuery.data?.timezone ?? timezone ?? undefined}
        isLoading={overviewQuery.isLoading || !isTimezoneResolved}
        isError={overviewQuery.isError}
        error={overviewQuery.error}
        onRetry={() => void overviewQuery.refetch()}
        selectedScope={scope}
        onSelectScope={(s) => updateUrl(s, 0)}
        onRefresh={handleRefresh}
      />

      {/* Priority Sessions Preview */}
      <ProctorPrioritySessions
        sessions={overviewQuery.data?.prioritySessions ?? []}
        isLoading={overviewQuery.isLoading || !isTimezoneResolved}
        onViewToday={() => updateUrl("TODAY", 0)}
      />

      {/* Main Scoped & Paginated List */}
      <div className="flex flex-col gap-4">
        {/* Scope Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-2">
            {text.filterScopeLabel}:
          </span>
          {scopeFilterTabs.map((tab) => {
            const isActive = scope === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => updateUrl(tab.id, 0)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        {listQuery.isLoading || (scope === "TODAY" && !isTimezoneResolved) ? (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : listQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-800">
              {listQuery.error instanceof Error ? listQuery.error.message : text.error}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => void listQuery.refetch()}
            >
              {text.retry}
            </Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              {scope === "ALL" ? text.empty : text.emptyInScope}
            </h3>
            {scope !== "ALL" && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => updateUrl("ALL", 0)}
              >
                {text.filterAll}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      {text.tableColName}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {text.tableColStatus}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {text.tableColOpensAt}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {text.tableColClosesAt}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {text.tableColRole}
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      {text.tableColActions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((session) => {
                    const sessionId = session.examSessionPublicId || session.sessionPublicId || "";
                    const roleName =
                      (session.assignmentRole || session.role) === "LEAD_PROCTOR"
                        ? text.roleLead
                        : text.roleProctor;

                    const canMonitor = session.canMonitor ?? session.status === "OPEN";

                    return (
                      <tr
                        key={session.assignmentPublicId || sessionId}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{session.name}</div>
                          <div className="font-mono text-xs text-slate-400">
                            #{sessionId ? sessionId.slice(0, 8).toUpperCase() : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sessionStatusBadgeClass(
                              session.status,
                            )}`}
                          >
                            {getStatusLabel(session.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {formatDateTime(session.opensAt)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {formatDateTime(session.closesAt)}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-700">{roleName}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/proctor/audit-log/${sessionId}`}>
                              <Button variant="secondary" size="sm">
                                {text.auditLog}
                              </Button>
                            </Link>
                            {canMonitor ? (
                              <Link href={`/proctor/sessions/${sessionId}`}>
                                <Button variant="primary" size="sm">
                                  {text.enterMonitoring}
                                </Button>
                              </Link>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <Link href={`/proctor/sessions/${sessionId}`}>
                                  <Button variant="secondary" size="sm">
                                    {text.viewRoom}
                                  </Button>
                                </Link>
                                {session.monitoringBlockingReason && (
                                  <span className="text-[10px] text-amber-700">
                                    {session.monitoringBlockingReason}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 text-sm text-slate-500">
                <div>
                  {text.format("pageIndicator", {
                    page: page + 1,
                    totalPages,
                  })}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => updateUrl(scope, Math.max(0, page - 1))}
                  >
                    {text.prevPage}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => updateUrl(scope, page + 1)}
                  >
                    {text.nextPage}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
