"use client";

import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import type { MonitoringStudentResponse } from "@pte/api-client";

interface MonitoringStudentTableProps {
  students: MonitoringStudentResponse[];
  selectedStudentPublicId?: string | null;
  onSelectStudent: (student: MonitoringStudentResponse) => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("vi-VN", {
    timeStyle: "medium",
  }).format(date);
}

export function MonitoringStudentTable({
  students,
  selectedStudentPublicId,
  onSelectStudent,
}: MonitoringStudentTableProps): ReactElement {
  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
        Không có thí sinh nào trong danh sách phòng thi.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Thí sinh</th>
            <th scope="col" className="px-4 py-3">Lượt thi</th>
            <th scope="col" className="px-4 py-3">Trạng thái</th>
            <th scope="col" className="px-4 py-3">Bắt đầu</th>
            <th scope="col" className="px-4 py-3">Tín hiệu cuối</th>
            <th scope="col" className="px-4 py-3 text-center">Vi phạm</th>
            <th scope="col" className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => {
            const isSelected = selectedStudentPublicId === student.studentPublicId;
            return (
              <tr
                key={student.studentPublicId}
                className={
                  "transition-colors hover:bg-slate-50 " +
                  (isSelected ? "bg-blue-50/50" : "")
                }
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{student.displayName}</div>
                  <div className="text-xs text-slate-500">{student.email ?? "—"}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">
                  {student.attemptNumber ? `#${student.attemptNumber}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                      (student.status === "IN_PROGRESS"
                        ? "bg-blue-100 text-blue-800"
                        : student.status === "SUBMITTED"
                          ? "bg-green-100 text-green-800"
                          : student.status === "ABANDONED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700")
                    }
                  >
                    {student.status === "IN_PROGRESS"
                      ? "Đang thi"
                      : student.status === "SUBMITTED"
                        ? "Đã nộp"
                        : student.status === "ABANDONED"
                          ? "Bỏ dở"
                          : "Chưa thi"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {formatTime(student.startedAt)}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  {formatTime(student.lastSeenAt)}
                </td>
                <td className="px-4 py-3 text-center">
                  {student.manualViolationCount > 0 ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                      {student.manualViolationCount}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onSelectStudent(student)}
                  >
                    Chi tiết
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
