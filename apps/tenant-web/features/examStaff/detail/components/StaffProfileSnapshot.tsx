import type { ReactElement } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import { Button, LoadingState } from "@pte/ui";
import { useStaffOverview } from "../api";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffWorkspaceError } from "./StaffWorkspaceError";
import { useStaffWorkspaceFilters } from "../hooks/useStaffWorkspaceFilters";
import { StaffFilterToolbar } from "../filters/StaffFilterToolbar";
import { ProctorOverview } from "../proctor/ProctorOverview";
import { NextProctorSessions } from "../proctor/NextProctorSessions";
import { ExaminerOverview } from "../examiner/ExaminerOverview";

interface StaffProfileSnapshotProps { account: ExamStaffAccountResponse; text: StaffDetailText; active: boolean }

export const StaffProfileSnapshot = ({ account, text, active }: StaffProfileSnapshotProps): ReactElement => {
  const filters = useStaffWorkspaceFilters();
  const query = useStaffOverview(account.publicId, filters.applied, active);
  return <div className="flex flex-col gap-5">
    <StaffFilterToolbar filters={filters} text={text} active={active} examiner={account.roles.includes("EXAMINER")} />
    <div className="flex justify-end">
      <Button variant="secondary" isLoading={query.isFetching} onClick={() => { void query.refetch(); }}>{text.refresh}</Button>
    </div>
    {query.isError ? <StaffWorkspaceError error={query.error} text={text} retry={() => { void query.refetch(); }} />
      : query.isPending ? <LoadingState /> : <>
        {query.data.proctor && <ProctorOverview data={query.data.proctor} text={text} />}
        {query.data.examiner && <ExaminerOverview data={query.data.examiner} text={text} />}
      </>}
    {account.roles.includes("PROCTOR") && <NextProctorSessions publicId={account.publicId} text={text} active={active} />}
  </div>;
};
