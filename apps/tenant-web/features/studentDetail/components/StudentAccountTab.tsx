"use client";

import { useMemo, useState, type ReactElement } from "react";
import type { StudentDetailResponse } from "@pte/api-client";
import { Alert, Button, Input, PencilIcon, ProfileAccountPanel } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useUpdateStudentProfile } from "../api";
import type { StudentDetailText } from "../hooks/useStudentDetailText";
import { formFromAccount, type StudentProfileForm } from "../utils";
import { StudentAccountDescription } from "./StudentAccountDescription";

interface StudentAccountTabProps {
  account: StudentDetailResponse;
  studentPublicId: string;
  text: StudentDetailText;
}

export const StudentAccountTab = ({
  account,
  studentPublicId,
  text,
}: StudentAccountTabProps): ReactElement => {
  const update = useUpdateStudentProfile();
  const [form, setForm] = useState<StudentProfileForm>(() => formFromAccount(account));
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  const original = useMemo(() => formFromAccount(account), [account]);
  const isDirty = JSON.stringify(form) !== JSON.stringify(original);
  const error = update.error ? getUserFacingApiErrorMessage(update.error, text.genericError) : null;

  const reset = (): void => {
    setForm(original);
    setSaved(false);
    setEditing(false);
  };

  const startEditing = (): void => {
    setForm(formFromAccount(account));
    setSaved(false);
    setEditing(true);
  };

  const updateField = (field: keyof StudentProfileForm, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <ProfileAccountPanel
      title={text.account.title}
      description={text.account.subtitle}
      actions={!editing && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<PencilIcon className="h-4 w-4" />}
            onClick={startEditing}
          >
            {text.account.edit}
          </Button>
      )}
    >
        {error && <Alert tone="error">{error}</Alert>}
        {saved && <Alert tone="success">{text.account.saved}</Alert>}

        {editing ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label={text.account.fullName}
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
              />
              <Input
                label={text.account.email}
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              <Input
                label={text.account.phone}
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
              <Input
                label={text.account.dateOfBirth}
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => updateField("dateOfBirth", event.target.value)}
              />
            </div>
            <StudentAccountDescription
              account={account}
              text={text}
              includeEditableFields={false}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" disabled={update.isPending} onClick={reset}>
                {text.suspendDialog.cancel}
              </Button>
              <Button
                disabled={!isDirty}
                isLoading={update.isPending}
                onClick={() => {
                  setSaved(false);
                  update.mutate(
                    { publicId: studentPublicId, payload: form },
                    {
                      onSuccess: () => {
                        setSaved(true);
                        setEditing(false);
                      },
                    },
                  );
                }}
              >
                {text.account.save}
              </Button>
            </div>
          </div>
        ) : (
          <StudentAccountDescription account={account} text={text} />
        )}
    </ProfileAccountPanel>
  );
};
