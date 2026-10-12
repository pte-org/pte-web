import { useState, type ReactElement } from "react";
import { Select } from "@pte/ui";
import { STAFF_WORK_STATUSES, type StaffVisibleWorkStatus } from "../constants";
import { useStaffWorkspaceFilters } from "../hooks/useStaffWorkspaceFilters";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffFilterToolbar } from "../filters/StaffFilterToolbar";
import { ExaminerBoard } from "./ExaminerBoard";
import { ExaminerTable } from "./ExaminerTable";

interface ExaminerTrackingTabProps { publicId: string; text: StaffDetailText; active: boolean }

export const ExaminerTrackingTab = ({ publicId, text, active }: ExaminerTrackingTabProps): ReactElement => {
  const filters = useStaffWorkspaceFilters();
  const [board, setBoard] = useState(true);
  const [status, setStatus] = useState<StaffVisibleWorkStatus | "ALL">("ALL");
  const key = JSON.stringify([filters.applied, filters.revision, status]);
  return <div className="flex flex-col gap-5">
    <StaffFilterToolbar active={active} examiner text={text} filters={filters} />
    <div className="flex flex-wrap gap-3">
      <Select label={text.display} value={board ? "board" : "table"}
        options={[{ value: "board", label: text.board }, { value: "table", label: text.table }]}
        onChange={(event) => setBoard(event.target.value === "board")} />
      <Select label={text.workStatus} value={status} options={[
        { value: "ALL", label: text.allStatuses }, ...STAFF_WORK_STATUSES.map((value) => ({ value, label: text[value] })),
      ]} onChange={(event) => {
        const value = STAFF_WORK_STATUSES.find((item) => item === event.target.value);
        if (value || event.target.value === "ALL") setStatus(value ?? "ALL");
      }} />
    </div>
    {board ? <ExaminerBoard key={key} publicId={publicId} filters={filters.applied} status={status} text={text} active={active} />
      : <ExaminerTable key={key} publicId={publicId} filters={filters.applied} status={status} text={text} active={active} />}
  </div>;
};
