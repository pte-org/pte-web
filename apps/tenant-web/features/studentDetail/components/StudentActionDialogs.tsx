import type { ReactElement } from "react";
import { Alert, ConfirmDialog } from "@pte/ui";
import { GeneratedCredentialsModal } from "@/features/userManagement/components";
import type { useStudentDetailActions } from "../hooks/useStudentDetailActions";
import type { StudentDetailText } from "../hooks/useStudentDetailText";

interface StudentActionDialogsProps {
  name: string;
  text: StudentDetailText;
  actions: ReturnType<typeof useStudentDetailActions>;
}

export const StudentActionDialogs = ({ name, text, actions }: StudentActionDialogsProps): ReactElement => (
  <>
    <ConfirmDialog open={actions.suspendOpen} title={text.suspendDialog.title}
      description={<div className="flex flex-col gap-2">
        <span>{text.suspendDialog.description(name)}</span>
        {actions.suspendError && <Alert tone="error">{actions.suspendError}</Alert>}
      </div>}
      confirmLabel={text.suspendDialog.confirm} cancelLabel={text.suspendDialog.cancel}
      tone="danger" isConfirming={actions.suspending}
      onConfirm={actions.confirmSuspend} onClose={actions.closeSuspend} />
    <GeneratedCredentialsModal open={actions.credentials !== null}
      credentials={actions.credentials} onClose={actions.closeCredentials} />
  </>
);
