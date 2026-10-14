import { useState, type ReactElement } from "react";
import type { StaffWorkspaceQuery } from "@pte/api-client";
import { BoardColumn, EmptyState, LoadingState, PaginationControls } from "@pte/ui";
import { useStaffExaminerSessions } from "../api";
import { STAFF_BOARD_PAGE_SIZE, type StaffVisibleWorkStatus } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffWorkspaceError } from "../components/StaffWorkspaceError";
import { ExaminerSessionCard } from "./ExaminerSessionCard";

interface ExaminerWorkColumnProps {
  publicId: string; filters: StaffWorkspaceQuery; status: StaffVisibleWorkStatus;
  text: StaffDetailText; active: boolean;
}

/** One bounded request/page per status. Remount by applied-filter key to reset all pages. */
export const ExaminerWorkColumn = ({ publicId, filters, status, text, active }: ExaminerWorkColumnProps): ReactElement => {
  const [page, setPage] = useState(0);
  const query = useStaffExaminerSessions(publicId, {
    ...filters, workStatus: status, page, size: STAFF_BOARD_PAGE_SIZE, direction: "desc",
  }, active);
  const summary = query.data ? text.format("loadedRecords", {
    loaded: query.data.data.length, total: query.data.totalByStatus[status],
  }) : undefined;
  return <BoardColumn title={text[status]} summary={summary} collapsible={false}
    footer={query.isSuccess && <PaginationControls meta={query.data.meta} disabled={query.isFetching} onPageChange={setPage} />}>
    {query.isError ? <StaffWorkspaceError error={query.error} text={text} retry={() => { void query.refetch(); }} />
      : query.isPending ? <LoadingState rows={3} /> : !query.data.data.length ? <EmptyState title={text.emptyWork} />
        : query.data.data.map((row) => <ExaminerSessionCard key={row.session.sessionPublicId} row={row} text={text} />)}
  </BoardColumn>;
};
