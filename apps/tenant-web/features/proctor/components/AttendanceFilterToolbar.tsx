"use client";

import { useState, type ReactElement } from "react";
import { Button, Input } from "@pte/ui";
import type { AttendanceStatus, AttendanceSummaryResponse } from "@pte/api-client";
import { getAttendanceStatusLabel, PROCTOR_TOOLBAR_TEXT as T } from "../constants";

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

  const tabs: Array<{ id: AttendanceStatus | "ALL"; label: string; count: number | undefined }> = [
    { id: "ALL", label: T.ALL_TAB, count: summary?.totalEnrollments },
    { id: "UNMARKED", label: getAttendanceStatusLabel("UNMARKED"), count: summary?.unmarkedCount },
    { id: "PRESENT", label: getAttendanceStatusLabel("PRESENT"), count: summary?.presentCount },
    { id: "LATE", label: getAttendanceStatusLabel("LATE"), count: summary?.lateCount },
    { id: "ABSENT", label: getAttendanceStatusLabel("ABSENT"), count: summary?.absentCount },
  ];

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
          placeholder={T.SEARCH_PLACEHOLDER}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-64"
        />
        <Button type="submit" variant="secondary" size="sm">
          {T.SEARCH_BTN}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onRefresh} title={T.REFRESH_TITLE}>
          {T.REFRESH_BTN}
        </Button>
      </form>
    </div>
  );
}
