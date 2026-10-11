import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { ExaminerSessionResponse } from "@pte/api-client";
import { ActionMenu, DataTable, EyeIcon, StatusBadge, type DataTableColumn } from "@pte/ui";
import { STAFF_DETAIL_ROUTES } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { formatStaffDate } from "../utils";
import { ExaminerProgress } from "./ExaminerProgress";

interface ExaminerSessionTableProps { rows: ExaminerSessionResponse[]; text: StaffDetailText }

export const ExaminerSessionTable = ({ rows, text }: ExaminerSessionTableProps): ReactElement => {
  const router = useRouter();
  const columns: DataTableColumn<ExaminerSessionResponse>[] = [
    { key: "name", header: text.session, cell: (row) => row.session.name, sortable: false },
    { key: "start", header: text.start, cell: (row) => formatStaffDate(row.session.opensAt, text.locale, text.unscheduled), sortable: false },
    { key: "status", header: text.sessionStatus, cell: (row) => <StatusBadge label={text[row.session.sessionStatus]} variant="neutral" />, sortable: false },
    { key: "work", header: text.workStatus, cell: (row) => <StatusBadge label={text[row.progress.workStatus]}
      variant={row.progress.workStatus === "COMPLETED" ? "success" : row.progress.workStatus === "UNAVAILABLE" ? "warning" : "neutral"} />, sortable: false },
    { key: "publication", header: text.publication, cell: (row) => <StatusBadge label={text[row.progress.publicationStatus]} variant="neutral" />, sortable: false },
    { key: "attempts", header: text.assignedAttempts, cell: (row) => row.progress.assignedAttemptCount, sortable: false },
    { key: "progress", header: text.progress, cell: (row) => <ExaminerProgress text={text}
      eligible={row.progress.eligibleAnswerCount} submitted={row.progress.submittedAnswerCount} percent={row.progress.progressPercent} />, sortable: false },
  ];
  return <DataTable rows={rows} columns={columns} getRowKey={(row) => row.session.sessionPublicId}
    showSearch={false} clientSideFiltering={false} clientSideSorting={false} clientSidePagination={false}
    emptyTitle={text.emptyWork} rowActions={(row) => <ActionMenu label={text.details} items={[
      { label: text.details, icon: EyeIcon, onSelect: () => router.push(STAFF_DETAIL_ROUTES.session(row.session.sessionPublicId)) },
    ]} />} />;
};
