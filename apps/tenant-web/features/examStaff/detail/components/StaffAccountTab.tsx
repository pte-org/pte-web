import { useEffect, type ReactElement } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import { Alert, Button, Input, PencilIcon, ProfileAccountPanel, useToast } from "@pte/ui";
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
  const { showToast } = useToast();
  useEffect(() => { onEditState(editor.dirty, editor.pending); }, [editor.dirty, editor.pending, onEditState]);
  useEffect(() => { if (editor.saved) showToast(text.saved, { tone: "success" }); }, [editor.saved, showToast, text.saved]);
  return <ProfileAccountPanel title={text.account} description={text.accountDescription}
    actions={!editor.editing && <Button variant="secondary" size="sm" leftIcon={<PencilIcon />}
      onClick={editor.start}>{text.edit}</Button>}>
    {editor.error && <Alert tone="error">{editor.error}</Alert>}
    {editor.editing ? <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label={text.fullName} value={editor.form.fullName} disabled={editor.pending}
          onChange={(event) => editor.change("fullName", event.target.value)} />
        <Input label={text.email} type="email" value={editor.form.email} disabled={editor.pending}
          onChange={(event) => editor.change("email", event.target.value)} />
        <Input label={text.phone} type="tel" value={editor.form.phone} disabled={editor.pending}
          onChange={(event) => editor.change("phone", event.target.value)} />
        <Input label={text.dateOfBirth} type="date" value={editor.form.dateOfBirth} disabled={editor.pending}
          onChange={(event) => editor.change("dateOfBirth", event.target.value)} />
      </div>
      <StaffAccountDescription account={account} text={text} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" disabled={editor.pending} onClick={editor.cancel}>{text.cancel}</Button>
        <Button disabled={!editor.dirty} isLoading={editor.pending} onClick={editor.save}>{text.save}</Button>
      </div>
    </div> : <StaffAccountDescription account={account} text={text} />}
  </ProfileAccountPanel>;
};
