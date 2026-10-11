import type { ReactElement } from "react";
import { Button, CollapsibleSection, LoadingState } from "@pte/ui";
import { useNextStaffProctorSessions } from "../api";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffWorkspaceError } from "../components/StaffWorkspaceError";
import { ProctorSessionList } from "./ProctorSessionList";

interface NextProctorSessionsProps { publicId: string; text: StaffDetailText; active: boolean }

export const NextProctorSessions = ({ publicId, text, active }: NextProctorSessionsProps): ReactElement => {
  const query = useNextStaffProctorSessions(publicId, active);
  return <CollapsibleSection title={text.nextSessions} subtitle={text.nextDescription}
    actions={<Button variant="secondary" isLoading={query.isFetching} onClick={() => { void query.refetch(); }}>{text.refresh}</Button>}>
    {query.isError ? <StaffWorkspaceError error={query.error} text={text} retry={() => { void query.refetch(); }} />
      : query.isPending ? <LoadingState rows={3} /> : <ProctorSessionList rows={query.data.data} text={text} />}
  </CollapsibleSection>;
};
