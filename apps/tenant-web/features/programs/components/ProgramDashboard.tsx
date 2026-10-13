"use client";

import { Alert, Button, LoadingState, StatCard } from "@pte/ui";
import { useProgramDashboard } from "../api";
import { useProgramDetailText } from "../hooks/useProgramDetailText";

interface ProgramDashboardProps {
  organizationPublicId: string;
  programPublicId: string;
}

export const ProgramDashboard = ({ organizationPublicId, programPublicId }: ProgramDashboardProps) => {
  const text = useProgramDetailText();
  const query = useProgramDashboard(organizationPublicId, programPublicId);
  return (
    <div className="flex flex-col gap-5">
      {query.isError ? <Alert tone="error">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{text.overviewFailed}</span>
          <Button variant="secondary" onClick={() => void query.refetch()}>{text.retry}</Button>
        </div>
      </Alert> : !query.data ? <LoadingState rows={2} /> : (
        <div className="grid grid-cols-2 gap-4">
          <StatCard label={text.classes} value={String(query.data.classCount)} compact />
          <StatCard label={text.students} value={String(query.data.studentCount)} compact />
        </div>
      )}
    </div>
  );
};
