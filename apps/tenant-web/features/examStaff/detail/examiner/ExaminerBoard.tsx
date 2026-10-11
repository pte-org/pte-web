import type { ReactElement } from "react";
import type { StaffWorkspaceQuery } from "@pte/api-client";
import { Board } from "@pte/ui";
import { STAFF_BOARD_STATUSES, type StaffVisibleWorkStatus } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { ExaminerWorkColumn } from "./ExaminerWorkColumn";

interface ExaminerBoardProps {
  publicId: string; filters: StaffWorkspaceQuery; status: StaffVisibleWorkStatus | "ALL";
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
  </div>;
};
