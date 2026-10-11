import type { ReactElement } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import { LoadingState } from "@pte/ui";
import { useStaffOverview } from "../api";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffWorkspaceError } from "./StaffWorkspaceError";
import { ProctorOverview } from "../proctor/ProctorOverview";
import { ExaminerOverview } from "../examiner/ExaminerOverview";

interface StaffProfileSnapshotProps { account: ExamStaffAccountResponse; text: StaffDetailText; active: boolean }

export const StaffProfileSnapshot = ({ account, text, active }: StaffProfileSnapshotProps): ReactElement => {
  const query = useStaffOverview(account.publicId, {}, active);
  return <div className="flex flex-col gap-5">
    {query.isError ? <StaffWorkspaceError error={query.error} text={text} retry={() => { void query.refetch(); }} />
      : query.isPending ? <LoadingState /> : <>
        {query.data.proctor && <ProctorOverview data={query.data.proctor} text={text} />}
        {query.data.examiner && <ExaminerOverview data={query.data.examiner} text={text} />}
      </>}
  </div>;
};
