import { useState, type ReactElement } from "react";
import type { StaffWorkspaceQuery } from "@pte/api-client";
import { LoadingState, PaginationControls } from "@pte/ui";
import { useStaffExaminerSessions } from "../api";
import { STAFF_WORKSPACE_PAGE_SIZE, type StaffVisibleWorkStatus } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffWorkspaceError } from "../components/StaffWorkspaceError";
import { ExaminerSessionTable } from "./ExaminerSessionTable";

interface ExaminerTableProps {
  publicId: string; filters: StaffWorkspaceQuery; status: StaffVisibleWorkStatus | "ALL";
  text: StaffDetailText; active: boolean;
}

export const ExaminerTable = ({ publicId, filters, status, text, active }: ExaminerTableProps): ReactElement => {
  const [page, setPage] = useState(0);
  const query = useStaffExaminerSessions(publicId, {
    ...filters, workStatus: status, page, size: STAFF_WORKSPACE_PAGE_SIZE, direction: "desc",
  }, active);
  return <div className="flex flex-col gap-4">
    {query.isError ? <StaffWorkspaceError error={query.error} text={text} retry={() => { void query.refetch(); }} />
      : query.isPending ? <LoadingState /> : <>
        <ExaminerSessionTable rows={query.data.data} text={text} />
        <PaginationControls meta={query.data.meta} disabled={query.isFetching} onPageChange={setPage} />
      </>}
  </div>;
};
