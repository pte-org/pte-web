import type { ReactElement } from "react";
import type { StaffWorkspaceQuery, StaffWorkStatus } from "@pte/api-client";
import { Alert, Board } from "@pte/ui";
import { STAFF_BOARD_STATUSES } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { ExaminerWorkColumn } from "./ExaminerWorkColumn";

interface ExaminerBoardProps {
  publicId: string; filters: StaffWorkspaceQuery; status: StaffWorkStatus | "ALL";
  text: StaffDetailText; active: boolean;
}

export const ExaminerBoard = ({ publicId, filters, status, text, active }: ExaminerBoardProps): ReactElement => {
  // This selects visible request-backed columns, never filters a page of returned records.
  const columns = STAFF_BOARD_STATUSES.filter((value) => status === "ALL" || status === value);
  const key = JSON.stringify(filters);
  return <div className="flex flex-col gap-5">
    {columns.length > 0 && <Board label={text.tracking}>
      {columns.map((value) => <ExaminerWorkColumn key={`${key}-${value}`} publicId={publicId}
        filters={filters} status={value} text={text} active={active} />)}
    </Board>}
    {(status === "ALL" || status === "UNAVAILABLE") && <>
      <Alert tone="warning">{text.exceptionsDescription}</Alert>
      <ExaminerWorkColumn key={`${key}-UNAVAILABLE`} publicId={publicId} filters={filters}
        status="UNAVAILABLE" text={text} active={active} />
    </>}
  </div>;
};
