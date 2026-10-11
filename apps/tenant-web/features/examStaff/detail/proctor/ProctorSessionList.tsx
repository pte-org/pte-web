import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { StaffSessionResponse } from "@pte/api-client";
import { ActionMenu, CollapsibleSection, DataTable, EyeIcon, StatusBadge, type DataTableColumn } from "@pte/ui";
import { STAFF_DETAIL_ROUTES } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { formatStaffDate, staffScheduleDay } from "../utils";

interface ProctorSessionListProps { rows: StaffSessionResponse[]; text: StaffDetailText; grouped?: boolean }

export const ProctorSessionList = ({ rows, text, grouped = false }: ProctorSessionListProps): ReactElement => {
  const router = useRouter();
  const columns: DataTableColumn<StaffSessionResponse>[] = [
    { key: "name", header: text.session, cell: (row) => row.name, sortable: false },
    { key: "start", header: text.start, cell: (row) => formatStaffDate(row.opensAt, text.locale, text.unscheduled), sortable: false },
    { key: "end", header: text.end, cell: (row) => formatStaffDate(row.closesAt, text.locale, text.unscheduled), sortable: false },
    { key: "status", header: text.sessionStatus, cell: (row) => <StatusBadge label={text[row.sessionStatus]}
      variant={row.sessionStatus === "OPEN" ? "success" : row.sessionStatus === "CANCELLED" ? "warning" : "neutral"} />, sortable: false },
  ];
  const table = (pageRows: StaffSessionResponse[]): ReactElement => <DataTable rows={pageRows} columns={columns}
    getRowKey={(row) => row.sessionPublicId} showSearch={false} clientSideFiltering={false}
    clientSideSorting={false} clientSidePagination={false} emptyTitle={text.emptySchedule}
    rowActions={(row) => <ActionMenu label={text.details} items={[{ label: text.details, icon: EyeIcon,
      onSelect: () => router.push(STAFF_DETAIL_ROUTES.session(row.sessionPublicId)) }]} />} />;
  if (!grouped || !rows.length) return table(rows);
  // Group only this server page for presentation; totals still come from response.meta.
  const groups = new Map<string, StaffSessionResponse[]>();
  rows.forEach((row) => {
    const day = staffScheduleDay(row.opensAt, text.locale, text.unscheduled);
    groups.set(day, [...(groups.get(day) ?? []), row]);
  });
  return <div className="flex flex-col gap-5">{Array.from(groups, ([day, sessions]) =>
    <CollapsibleSection key={day} title={day}>{table(sessions)}</CollapsibleSection>,
  )}</div>;
};
