"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, DateInput, Input, Modal, Select } from "@pte/ui";
import {
  getUserFacingApiErrorMessage,
  type PlatformAssignableRole,
  type UserResponse,
} from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  PLATFORM_ASSIGNABLE_ROLE_OPTIONS,
  PLATFORM_USER_TEXT as RAW_PLATFORM_USER_TEXT,
} from "../constants";
import type { CreateDraft, PlatformUserEditDraft } from "../types";
import { assignableRoleOf } from "../utils/assignableRole";

export type { CreateDraft, PlatformUserEditDraft } from "../types";

type CreateModalProps = {
  open: boolean;
  draft: CreateDraft;
  error: unknown;
  isPending: boolean;
  onDraftChange: (draft: CreateDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export const PlatformUserCreateModal = ({
  open,
  draft,
  error,
  isPending,
  onDraftChange,
  onSubmit,
  onClose,
}: CreateModalProps): ReactElement => {
  const T = useAdminCopy(RAW_PLATFORM_USER_TEXT);
  const roleOptions = useAdminCopy(PLATFORM_ASSIGNABLE_ROLE_OPTIONS);

  return (
    <Modal
      open={open}
      title={T.CREATE_TITLE}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {T.CANCEL}
          </Button>
          <Button type="submit" form="platform-user-create" isLoading={isPending}>
            {T.CREATE}
          </Button>
        </>
      }
    >
      <form id="platform-user-create" className="space-y-4" onSubmit={onSubmit}>
        {Boolean(error) && (
          <Alert tone="error">{getUserFacingApiErrorMessage(error, T.FORM_ERROR)}</Alert>
        )}
        <Input
          id="platform-user-full-name"
          label={T.FULL_NAME}
          value={draft.fullName}
          onChange={(event) => onDraftChange({ ...draft, fullName: event.target.value })}
          required
        />
        <Input
          id="platform-user-email"
          type="email"
          label={T.EMAIL}
          value={draft.email}
          onChange={(event) => onDraftChange({ ...draft, email: event.target.value })}
          required
        />
        <Alert tone="info">{T.PASSWORD_AUTO_GENERATED}</Alert>
        <Select
          id="platform-user-role"
          label={T.ROLE}
          options={roleOptions}
          value={draft.role}
          onChange={(event) =>
            onDraftChange({ ...draft, role: event.target.value as PlatformAssignableRole })
          }
        />
      </form>
    </Modal>
  );
};

type ProfileModalProps = {
  target: UserResponse | null;
  error: unknown;
  isPending: boolean;
  onSave: (draft: PlatformUserEditDraft) => void;
  onClose: () => void;
};

const editDraftFor = (target: UserResponse | null): PlatformUserEditDraft => ({
  fullName: target?.fullName ?? "",
  phone: target?.phone ?? "",
  dateOfBirth: target?.dateOfBirth ?? null,
  role: assignableRoleOf(target),
});

export const PlatformUserProfileModal = ({
  target,
  error,
  isPending,
  onSave,
  onClose,
}: ProfileModalProps): ReactElement => {
  const T = useAdminCopy(RAW_PLATFORM_USER_TEXT);
  const roleOptions = useAdminCopy(PLATFORM_ASSIGNABLE_ROLE_OPTIONS);
  const [draft, setDraft] = useState<PlatformUserEditDraft>(() => editDraftFor(target));

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSave({ ...draft, fullName: draft.fullName.trim(), phone: draft.phone?.trim() ?? "" });
  };

  return (
    <Modal
      open={target !== null}
      title={T.PROFILE_TITLE}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {T.CANCEL}
          </Button>
          <Button type="submit" form="platform-user-profile" isLoading={isPending}>
            {T.SAVE}
          </Button>
        </>
      }
    >
      <form id="platform-user-profile" className="space-y-4" onSubmit={submit}>
        {Boolean(error) && (
          <Alert tone="error">{getUserFacingApiErrorMessage(error, T.FORM_ERROR)}</Alert>
        )}
        <Input
          id="platform-user-profile-full-name"
          label={T.FULL_NAME}
          value={draft.fullName}
          onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
          required
        />
        <Input
          id="platform-user-profile-email"
          label={T.EMAIL}
          value={target?.email ?? ""}
          readOnly
          helperText={T.EMAIL_IMMUTABLE}
        />
        <Select
          id="platform-user-profile-role"
          label={T.ROLE}
          options={roleOptions}
          value={draft.role}
          onChange={(event) =>
            setDraft({ ...draft, role: event.target.value as PlatformAssignableRole })
          }
        />
        <Input
          id="platform-user-profile-phone"
          label={T.PHONE}
          value={draft.phone ?? ""}
          onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
        />
        <DateInput
          id="platform-user-profile-date-of-birth"
          label={T.DATE_OF_BIRTH}
          value={draft.dateOfBirth ?? ""}
          onChange={(event) => setDraft({ ...draft, dateOfBirth: event.target.value || null })}
          max={new Date().toISOString().slice(0, 10)}
        />
      </form>
    </Modal>
  );
};
