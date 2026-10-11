import { useId, type ReactElement } from "react";
import { Alert, Button, CollapsibleSection, Input, Select } from "@pte/ui";
import { STAFF_SESSION_STATUSES } from "../constants";
import type { StaffFilterState } from "../types";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffWorkspaceError } from "../components/StaffWorkspaceError";
import { useStaffSessionOptions } from "./api";

interface StaffFilterToolbarProps {
  filters: StaffFilterState;
  text: StaffDetailText;
  examiner?: boolean;
  active: boolean;
}

export const StaffFilterToolbar = ({ filters, text, examiner = false, active }: StaffFilterToolbarProps): ReactElement => {
  const options = useStaffSessionOptions(active);
  const id = useId();
  return <CollapsibleSection title={text.filters} subtitle={text.timezone}>
    <div className="flex flex-col gap-4">
      {options.isError && <StaffWorkspaceError error={options.error} text={text} retry={() => { void options.refetch(); }} />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Input id={`${id}-from`} label={text.from} type="date" value={filters.draft.fromDate}
          onChange={(event) => filters.change({ fromDate: event.target.value })} />
        <Input id={`${id}-to`} label={text.to} type="date" value={filters.draft.toDate}
          onChange={(event) => filters.change({ toDate: event.target.value })} />
        <Select id={`${id}-session`} label={text.session} value={filters.draft.sessionPublicId}
          disabled={options.isPending || options.isError} options={[
            { value: "", label: text.allSessions }, ...(options.data ?? []).map((session) => ({
              value: session.publicId, label: session.sessionCode ? `${session.name} (${session.sessionCode})` : session.name,
            })),
          ]} onChange={(event) => filters.change({ sessionPublicId: event.target.value })} />
        <Select id={`${id}-status`} label={text.sessionStatus} value={filters.draft.sessionStatus}
          options={[{ value: "ALL", label: text.allStatuses }, ...STAFF_SESSION_STATUSES.map((value) => ({ value, label: text[value] }))]}
          onChange={(event) => {
            const status = STAFF_SESSION_STATUSES.find((value) => value === event.target.value);
            if (status || event.target.value === "ALL") filters.change({ sessionStatus: status ?? "ALL" });
          }} />
        {examiner && <Select id={`${id}-publication`} label={text.publication} value={filters.draft.publicationStatus}
          options={[{ value: "ALL", label: text.allPublications }, { value: "PUBLISHED", label: text.PUBLISHED },
            { value: "UNPUBLISHED", label: text.UNPUBLISHED }]}
          onChange={(event) => {
            const value = event.target.value;
            if (value === "ALL" || value === "PUBLISHED" || value === "UNPUBLISHED") filters.change({ publicationStatus: value });
          }} />}
      </div>
      {filters.invalidDates && <Alert tone="error">{text.dateInvalid}</Alert>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={filters.clear}>{text.clear}</Button>
        <Button onClick={filters.apply}>{text.apply}</Button>
      </div>
    </div>
  </CollapsibleSection>;
};
