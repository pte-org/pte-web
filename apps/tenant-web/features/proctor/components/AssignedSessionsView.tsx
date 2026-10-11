"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Button, PageHeader } from "@pte/ui";
import { useAssignedProctorSessions } from "../api";
import type { AssignedProctorSessionResponse } from "@pte/api-client";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function sessionStatusLabel(status: string): { label: string; className: string } {
  switch (status) {
    case "OPEN":
      return { label: "Đang diễn ra", className: "bg-green-100 text-green-800" };
    case "SCHEDULED":
      return { label: "Đã lên lịch", className: "bg-blue-100 text-blue-800" };
    case "CLOSED":
      return { label: "Đã kết thúc", className: "bg-slate-100 text-slate-700" };
    case "CANCELLED":
      return { label: "Đã hủy", className: "bg-red-100 text-red-800" };
    default:
      return { label: status, className: "bg-slate-100 text-slate-600" };
  }
}

export function AssignedSessionsView(): ReactElement {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, isError, error, refetch } = useAssignedProctorSessions(page, pageSize);

  const sessions = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader
        title="Phòng thi được phân công"
        subtitle="Danh sách các ca thi bạn được phân công làm giám thị"
      />

      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <p className="text-sm text-slate-500">Đang tải danh sách phòng thi...</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-800">
            {error instanceof Error ? error.message : "Không thể tải danh sách phòng thi"}
          </p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <h3 className="text-base font-semibold text-slate-900">Không có ca thi nào</h3>
          <p className="mt-1 text-sm text-slate-500">
            Hiện tại bạn chưa được phân công làm giám thị cho ca thi nào.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-3">Tên ca thi</th>
                  <th scope="col" className="px-6 py-3">Trạng thái</th>
                  <th scope="col" className="px-6 py-3">Thời gian mở</th>
                  <th scope="col" className="px-6 py-3">Thời gian đóng</th>
                  <th scope="col" className="px-6 py-3">Vai trò</th>
                  <th scope="col" className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session: AssignedProctorSessionResponse) => {
                  const statusInfo = sessionStatusLabel(session.status);
                  const isOpen = session.status === "OPEN";
                  const sessionId = session.examSessionPublicId || session.sessionPublicId || "";
                  const roleName = (session.assignmentRole || session.role) === "LEAD_PROCTOR" ? "Trưởng phòng thi" : "Giám thị";

                  return (
                    <tr key={sessionId || session.assignmentPublicId} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{session.name}</div>
                        <div className="font-mono text-xs text-slate-400">
                          #{sessionId ? sessionId.slice(0, 8).toUpperCase() : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDateTime(session.opensAt)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDateTime(session.closesAt)}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {roleName}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/proctor/audit-log/${sessionId}`}>
                            <Button variant="secondary" size="sm">
                              Nhật ký
                            </Button>
                          </Link>
                          {isOpen ? (
                            <Link href={`/proctor/sessions/${sessionId}`}>
                              <Button variant="primary" size="sm">
                                Vào giám sát
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/proctor/sessions/${sessionId}`}>
                              <Button variant="secondary" size="sm">
                                Xem phòng
                              </Button>
                            </Link>
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
                Trang {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Trang trước
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
