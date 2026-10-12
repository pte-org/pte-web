"use client";

import { useCallback, type ReactElement } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, PageHeader, Skeleton } from "@pte/ui";
import { useAssignedProctorSessions } from "../api";
import { useClientTimezone } from "../hooks/useClientTimezone";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";

interface AssignedSessionPickerProps {
  mode: "attendance" | "audit-log";
  title: string;
  subtitle: string;
}

export function AssignedSessionPicker({
  mode,
  title,
  subtitle,
}: AssignedSessionPickerProps): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const text = useProctorWorkspaceText();
  const { timezone, isResolved } = useClientTimezone();

  const rawPage = parseInt(searchParams.get("page") ?? "0", 10);
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const pageSize = 20;

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
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

  const { data, isLoading, isError, refetch } = useAssignedProctorSessions({
    scope: "ALL",
    timezone: isResolved ? timezone : undefined,
    page,
    size: pageSize,
  });

  const sessions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const getTargetUrl = (sessionPublicId: string): string => {
    return mode === "attendance"
      ? `/proctor/attendance/${sessionPublicId}`
      : `/proctor/audit-log/${sessionPublicId}`;
  };

  const getActionLabel = (): string => {
    return mode === "attendance" ? "Điểm danh" : "Xem nhật ký";
  };

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">{text.error}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => void refetch()}>
            {text.retry}
          </Button>
        </div>
      )}

      {!isLoading && !isError && sessions.length === 0 && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] p-8 text-center text-[var(--ink-muted)]">
          <p className="text-base font-medium">{text.empty}</p>
          <p className="mt-1 text-sm">Bạn chưa được phân công phụ trách ca thi nào.</p>
        </div>
      )}

      {!isLoading && !isError && sessions.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--ink-secondary)] uppercase">
                <tr>
                  <th className="px-6 py-4">{text.tableColName}</th>
                  <th className="px-6 py-4">{text.tableColStatus}</th>
                  <th className="px-6 py-4">{text.tableColOpensAt}</th>
                  <th className="px-6 py-4">{text.tableColClosesAt}</th>
                  <th className="px-6 py-4 text-right">{text.tableColActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--ink-primary)]">
                {sessions.map((session) => {
                  const sessionId = session.sessionPublicId ?? session.examSessionPublicId;
                  return (
                    <tr key={sessionId} className="transition-colors hover:bg-[var(--surface-subtle)]">
                      <td className="px-6 py-4 font-medium">
                        <div>{session.name}</div>
                        <div className="text-xs text-[var(--ink-muted)]">
                          Mã: {sessionId.slice(0, 8)}…
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--ink-secondary)]">
                        {session.opensAt ? new Date(session.opensAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--ink-secondary)]">
                        {session.closesAt ? new Date(session.closesAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={getTargetUrl(sessionId)}>
                          <Button variant="primary" size="sm">
                            {getActionLabel()}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] px-6 py-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage(page - 1)}
              >
                {text.prevPage}
              </Button>
              <span className="text-sm text-[var(--ink-muted)]">
                {text.pageIndicator
                  .replace("{page}", String(page + 1))
                  .replace("{totalPages}", String(totalPages))}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                {text.nextPage}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
