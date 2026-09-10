"use client";

import type { ReactElement } from "react";
import { Alert, DataTable, LoadingState, type DataTableColumn } from "@pte/ui";
import type { ProgramDashboardResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { PROGRAM_DASHBOARD_TABLE_HEADERS, PROGRAM_DASHBOARD_TEXT } from "../constants";
import { useProgramDashboard } from "../api";

interface ProgramDashboardProps {
  organizationPublicId: string;
  programPublicId: string;
  classLabel: string;
}

export const ProgramDashboard = ({
  organizationPublicId,
  programPublicId,
  classLabel,
}: ProgramDashboardProps): ReactElement | null => {
  const { data: dashboard, isLoading, isError, error } = useProgramDashboard(organizationPublicId, programPublicId);

  if (isError) {
    return <Alert tone="error">{errorMessage(error, PROGRAM_DASHBOARD_TEXT.loadFailed)}</Alert>;
  }

  if (isLoading || !dashboard) {
    return <LoadingState rows={2} />;
  }

  const columns: DataTableColumn<ProgramDashboardResponse["classes"][number]>[] = [
    { key: "name", header: PROGRAM_DASHBOARD_TABLE_HEADERS.NAME, cell: (row) => row.className },
    { key: "students", header: PROGRAM_DASHBOARD_TABLE_HEADERS.STUDENTS, cell: (row) => row.studentCount },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-2xl font-semibold text-gray-900">{dashboard.classCount}</p>
          <p className="text-sm text-gray-500">{PROGRAM_DASHBOARD_TEXT.classCount(classLabel)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-2xl font-semibold text-gray-900">{dashboard.studentCount}</p>
          <p className="text-sm text-gray-500">{PROGRAM_DASHBOARD_TEXT.studentCount}</p>
        </div>
      </div>

      {dashboard.classes.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-gray-900">{PROGRAM_DASHBOARD_TEXT.tableHeading(classLabel)}</h4>
          <DataTable columns={columns} rows={dashboard.classes} getRowKey={(row) => row.classPublicId} />
        </div>
      )}
    </div>
  );
};
