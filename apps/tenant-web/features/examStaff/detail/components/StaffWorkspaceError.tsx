import type { ReactElement } from "react";
import { ApiError } from "@pte/api-client";
import { Button, ErrorState } from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface StaffWorkspaceErrorProps { error?: unknown; text: StaffDetailText; retry: () => void }

export const StaffWorkspaceError = ({ error, text, retry }: StaffWorkspaceErrorProps): ReactElement => (
  <ErrorState title={error instanceof ApiError && (error.status === 403 || error.status === 404)
    ? text.unavailableProfile : text.genericError}
    action={<Button variant="secondary" onClick={retry}>{text.retry}</Button>} />
);
