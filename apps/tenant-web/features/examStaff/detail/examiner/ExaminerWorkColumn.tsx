import { useState, type ReactElement } from "react";
import type { StaffWorkspaceQuery, StaffWorkStatus } from "@pte/api-client";
import { BoardColumn, Button, EmptyState, LoadingState, PaginationControls } from "@pte/ui";
import { useStaffExaminerSessions } from "../api";
import { STAFF_BOARD_PAGE_SIZE } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffWorkspaceError } from "../components/StaffWorkspaceError";
import { ExaminerSessionCard } from "./ExaminerSessionCard";
import { ExaminerSessionTable } from "./ExaminerSessionTable";

interface ExaminerWorkColumnProps {
  publicId: string; filters: StaffWorkspaceQuery; status: StaffWorkStatus;
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
  return <BoardColumn title={status === "UNAVAILABLE" ? text.exceptions : text[status]} summary={summary}
    actions={<Button variant="secondary" isLoading={query.isFetching} onClick={() => { void query.refetch(); }}>{text.refresh}</Button>}
    footer={query.isSuccess && <PaginationControls meta={query.data.meta} disabled={query.isFetching} onPageChange={setPage} />}>
    {query.isError ? <StaffWorkspaceError error={query.error} text={text} retry={() => { void query.refetch(); }} />
      : query.isPending ? <LoadingState rows={3} /> : !query.data.data.length ? <EmptyState title={text.emptyWork} />
        : status === "UNAVAILABLE" ? <ExaminerSessionTable rows={query.data.data} text={text} />
          : query.data.data.map((row) => <ExaminerSessionCard key={row.session.sessionPublicId} row={row} text={text} />)}
  </BoardColumn>;
};
