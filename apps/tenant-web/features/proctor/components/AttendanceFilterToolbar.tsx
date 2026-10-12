"use client";

import { useState, type ReactElement } from "react";
import { Button, Input } from "@pte/ui";
import type { AttendanceStatus, AttendanceSummaryResponse } from "@pte/api-client";

interface AttendanceFilterToolbarProps {
  currentStatus: AttendanceStatus | "ALL";
  summary?: AttendanceSummaryResponse;
  currentSearch: string;
  onFilterChange: (status: AttendanceStatus | "ALL") => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
}

export function AttendanceFilterToolbar({
  currentStatus,
  summary,
  currentSearch,
  onFilterChange,
  onSearchChange,
  onRefresh,
}: AttendanceFilterToolbarProps): ReactElement {
  const [searchInput, setSearchInput] = useState(currentSearch);

  const tabs = [
    { id: "ALL", label: "Tất cả", count: summary?.totalEnrollments },
    { id: "UNMARKED", label: "Chưa điểm danh", count: summary?.unmarkedCount },
    { id: "PRESENT", label: "Có mặt", count: summary?.presentCount },
    { id: "ABSENT", label: "Vắng mặt", count: summary?.absentCount },
  ] as const;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-1">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-[var(--surface-default)] text-[var(--ink-primary)] shadow-sm"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]"
              }`}
            >
              {tab.label} {tab.count !== undefined ? `(${tab.count})` : ""}
            </button>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearchChange(searchInput.trim());
        }}
        className="flex items-center gap-2"
      >
        <Input
          id="attendance-search-input"
          type="search"
          placeholder="Tìm tên hoặc email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-64"
        />
        <Button type="submit" variant="secondary" size="sm">
          Tìm
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onRefresh} title="Làm mới">
          Tải lại
        </Button>
      </form>
    </div>
  );
}
