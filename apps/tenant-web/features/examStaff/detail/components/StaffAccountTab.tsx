import { useEffect, type ReactElement } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import { Alert, Button, PencilIcon, ProfileAccountPanel } from "@pte/ui";
import { useStaffAccountForm } from "../hooks/useStaffAccountForm";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { StaffAccountDescription } from "./StaffAccountDescription";

interface StaffAccountTabProps {
  account: ExamStaffAccountResponse;
  text: StaffDetailText;
  onEditState: (dirty: boolean, pending: boolean) => void;
}

export const StaffAccountTab = ({ account, text, onEditState }: StaffAccountTabProps): ReactElement => {
  const editor = useStaffAccountForm(account, text);
  useEffect(() => { onEditState(editor.dirty, editor.pending); }, [editor.dirty, editor.pending, onEditState]);
  return <ProfileAccountPanel title={text.account} description={text.accountDescription}
    actions={!editor.editing && <Button variant="secondary" size="sm" leftIcon={<PencilIcon />}
      onClick={editor.start}>{text.edit}</Button>}>
    {editor.error && <Alert tone="error">{editor.error}</Alert>}
    {editor.saved && <Alert tone="success">{text.saved}</Alert>}
    <StaffAccountDescription account={account} editor={editor} text={text} />
    {editor.editing && <div className="flex flex-wrap justify-end gap-2">
      <Button variant="secondary" disabled={editor.pending} onClick={editor.cancel}>{text.cancel}</Button>
      <Button disabled={!editor.dirty} isLoading={editor.pending} onClick={editor.save}>{text.save}</Button>
    </div>}
  </ProfileAccountPanel>;
};
