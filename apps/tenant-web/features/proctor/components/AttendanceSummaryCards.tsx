"use client";

import type { ReactElement } from "react";
import type { AttendanceSummaryResponse } from "@pte/api-client";
import { StatCard } from "@pte/ui";

interface AttendanceSummaryCardsProps {
  summary?: AttendanceSummaryResponse;
  isLoading?: boolean;
}

export function AttendanceSummaryCards({
  summary,
  isLoading = false,
}: AttendanceSummaryCardsProps): ReactElement {
  const total = summary?.totalEnrollments ?? 0;
  const unmarked = summary?.unmarkedCount ?? 0;
  const present = summary?.presentCount ?? 0;
  const absent = summary?.absentCount ?? 0;
  const late = summary?.lateCount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label="Tổng số thí sinh"
        value={isLoading ? "—" : String(total)}
        footnote="Tổng số lượng thí sinh đăng ký"
        accent="blue"
      />
      <StatCard
        label="Chưa điểm danh"
        value={isLoading ? "—" : String(unmarked)}
        footnote="Chưa cập nhật trạng thái"
        accent="cream"
      />
      <StatCard
        label="Có mặt"
        value={isLoading ? "—" : String(present)}
        footnote="Đã xác nhận có mặt"
        accent="mint"
      />
      <StatCard
        label="Vắng mặt"
        value={isLoading ? "—" : String(absent)}
        footnote="Ghi nhận vắng mặt"
        accent="blush"
      />
      <StatCard
        label="Đến trễ"
        value={isLoading ? "—" : String(late)}
        footnote="Ghi nhận đến muộn"
        accent="cream"
      />
    </div>
  );
}
