import type { ReactElement } from "react";
import { Alert, ConfirmDialog } from "@pte/ui";
import { GeneratedCredentialsModal } from "@/features/userManagement";
import type { useStaffAccountActions } from "../hooks/useStaffAccountActions";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface StaffActionDialogsProps {
  actions: ReturnType<typeof useStaffAccountActions>;
  name: string;
  text: StaffDetailText;
}

export const StaffActionDialogs = ({ actions, name, text }: StaffActionDialogsProps): ReactElement => {
  const send = actions.command === "send";
  const suspend = actions.command === "suspend";
  const title = send ? text.sendTitle : suspend ? text.suspendTitle : text.reactivateTitle;
  const description = text.format(send ? "sendDescription" : suspend ? "suspendDescription" : "reactivateDescription", { name });
  return <>
    <ConfirmDialog open={actions.command !== null} title={title}
      description={<div className="flex flex-col gap-2">
        <span>{description}</span>
        {actions.error && <Alert tone="error">{actions.error}</Alert>}
      </div>}
      confirmLabel={send ? text.sendCredentials : suspend ? text.suspend : text.reactivate}
      cancelLabel={text.cancel} tone={suspend ? "danger" : "primary"}
      isConfirming={actions.pending} onConfirm={actions.confirm} onClose={actions.close} />
    <GeneratedCredentialsModal open={actions.credentials !== null}
      credentials={actions.credentials} onClose={actions.closeCredentials} />
  </>;
};
