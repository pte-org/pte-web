import type { ReactElement } from "react";
import { LoadingState, PaginationControls } from "@pte/ui";
import { useStaffProctorSessions } from "../api";
import { STAFF_WORKSPACE_PAGE_SIZE } from "../constants";
import { useStaffWorkspaceFilters } from "../hooks/useStaffWorkspaceFilters";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffFilterToolbar } from "../filters/StaffFilterToolbar";
import { StaffWorkspaceError } from "../components/StaffWorkspaceError";
import { ProctorSessionList } from "./ProctorSessionList";

interface ProctorScheduleTabProps {
  publicId: string;
  text: StaffDetailText;
  active: boolean;
}

export const ProctorScheduleTab = ({
  publicId,
  text,
  active,
}: ProctorScheduleTabProps): ReactElement => {
  const filters = useStaffWorkspaceFilters();
  const query = useStaffProctorSessions(
    publicId,
    {
      ...filters.applied,
      page: filters.page,
      size: STAFF_WORKSPACE_PAGE_SIZE,
      direction: "asc",
    },
    active,
  );
  return (
    <div className="flex flex-col gap-5">
      <StaffFilterToolbar filters={filters} text={text} active={active} />
      {query.isError ? (
        <StaffWorkspaceError
          error={query.error}
          text={text}
          retry={() => {
            void query.refetch();
          }}
        />
      ) : query.isPending ? (
        <LoadingState />
      ) : (
        <>
          <ProctorSessionList rows={query.data.data} text={text} />
          <PaginationControls
            meta={query.data.meta}
            disabled={query.isFetching}
            onPageChange={filters.setPage}
          />
        </>
      )}
    </div>
  );
};
