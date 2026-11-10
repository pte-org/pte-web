"use client";

import { useCallback, useEffect, useMemo, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { ProctorScope } from "@pte/api-client";
import { Button, DataTable, ErrorState, PaginationControls, Select } from "@pte/ui";
import { useAssignedProctorSessions } from "../api";
import { useClientTimezone, useMidnightBoundaryRefresh } from "../hooks/useClientTimezone";
import { useAssignedSessionTable } from "../hooks/useAssignedSessionTable";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";
import { PROCTOR_QUERY_KEYS } from "../queryKeys";

const VALID_SCOPES: ProctorScope[] = ["ALL", "ACCESSIBLE", "UPCOMING", "TODAY"];

function parseScope(value: string | null): ProctorScope {
  if (value && VALID_SCOPES.includes(value as ProctorScope)) {
    return value as ProctorScope;
  }
  return "ACCESSIBLE";
}

export const AssignedSessionsView = (): ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const text = useProctorWorkspaceText();

  const { timezone, isResolved: isTimezoneResolved } = useClientTimezone();

  const scope = parseScope(searchParams.get("scope"));
  const rawPage = parseInt(searchParams.get("page") ?? "0", 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const pageSize = 20;

  const updateUrl = useCallback(
    (newScope: ProctorScope, newPage = 0) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("scope", newScope);
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

  const listQuery = useAssignedProctorSessions({
    page,
    size: pageSize,
    scope,
    timezone,
  });

  const dayEnd = listQuery.data?.dayEnd;
  const handleMidnight = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: PROCTOR_QUERY_KEYS.all });
  }, [queryClient]);

  useMidnightBoundaryRefresh({
    dayEnd,
    timezone,
    onMidnight: handleMidnight,
  });

  const sessions = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const totalElements = meta?.totalElements ?? 0;
  const isOutOfRange = Boolean(meta && totalElements > 0 && page >= totalPages);

  useEffect(() => {
    if (isOutOfRange) {
      updateUrl(scope, Math.max(0, totalPages - 1));
    }
  }, [isOutOfRange, page, scope, totalPages, updateUrl]);

  const scopeTabs: Array<{ id: ProctorScope; label: string }> = useMemo(
    () => [
      { id: "ALL", label: text.filterAll },
      { id: "ACCESSIBLE", label: text.filterAccessible },
      { id: "UPCOMING", label: text.filterUpcoming },
      { id: "TODAY", label: text.filterToday },
    ],
    [text],
  );

  const { columns, renderRowActions } = useAssignedSessionTable();

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {listQuery.isError ? (
        <ErrorState
          title={text.error}
          action={
            <Button variant="secondary" size="sm" onClick={() => void listQuery.refetch()}>
              {text.retry}
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={sessions}
          getRowKey={(row) => row.assignmentPublicId || row.examSessionPublicId || ""}
          isLoading={listQuery.isLoading || (scope === "TODAY" && !isTimezoneResolved)}
          emptyTitle={scope === "ALL" ? text.empty : text.emptyInScope}
          rowActions={renderRowActions}
          clientSideFiltering={false}
          clientSideSorting={false}
          clientSidePagination={false}
          showSearch={false}
          filters={
            <Select
              aria-label={text.filterScopeLabel}
              value={scope}
              options={scopeTabs.map((tab) => ({ value: tab.id, label: tab.label }))}
              onChange={(event) => {
                const value = event.target.value;
                const selected = VALID_SCOPES.find((entry) => entry === value);
                if (selected) updateUrl(selected, 0);
              }}
            />
          }
          pagination={
            meta && meta.totalPages > 1 ? (
              <PaginationControls
                meta={meta}
                onPageChange={(nextPage) => updateUrl(scope, nextPage)}
                disabled={listQuery.isLoading}
              />
            ) : null
          }
        />
      )}
    </div>
  );
};
