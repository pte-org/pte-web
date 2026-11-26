"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import type { AnnouncementCreateRequest, AnnouncementResponse } from "@pte/api-client";
import { Button, DateTimeInput, FormActions, Input, Modal, Select, Textarea } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  announcementDateGap,
  announcementWindowInvalid,
  toIsoValue,
  toLocalValue,
} from "../announcementWindow";

interface AnnouncementFormModalProps {
  open: boolean;
  announcement: AnnouncementResponse | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: AnnouncementCreateRequest, expectedDraftVersion?: number) => Promise<void>;
}


export function AnnouncementFormModal({
  open,
  announcement,
  isSaving,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps): ReactElement {
  const T = useAdminCopy({
    EDIT_TITLE: "Edit announcement draft",
    NEW_TITLE: "New announcement",
    CANCEL: "Cancel",
    SAVE: "Save draft",
    CREATE: "Create draft",
    TITLE: "Title",
    MESSAGE: "Message",
    CATEGORY: "Category",
    IMPORTANCE: "Importance",
    AFFECTED_FROM: "Affected from",
    AFFECTED_UNTIL: "Affected until",
    WINDOW_ERROR: "The end must be after the start.",
    TIME_REQUIRED: "Choose a time.",
    DATE_REQUIRED: "Choose a date.",
  });
  const categoryOptions = useAdminCopy([
    { label: "System notice", value: "SYSTEM_NOTICE" },
    { label: "Maintenance", value: "MAINTENANCE" },
    { label: "Session", value: "SESSION" },
    { label: "Application", value: "APPLICATION" },
    { label: "Billing", value: "BILLING" },
  ]);
  const importanceOptions = useAdminCopy([
    { label: "Informational", value: "INFO" },
    { label: "Important", value: "IMPORTANT" },
  ]);
  const [title, setTitle] = useState(() => announcement?.title ?? "");
  const [body, setBody] = useState(() => announcement?.body ?? "");
  const [category, setCategory] = useState<AnnouncementCreateRequest["category"]>(
    () => announcement?.category ?? "SYSTEM_NOTICE",
  );
  const [importance, setImportance] = useState<AnnouncementCreateRequest["importance"]>(
    () => announcement?.importance ?? "INFO",
  );
  const [affectedFrom, setAffectedFrom] = useState(() =>
    toLocalValue(announcement?.affectedFrom ?? null),
  );
  const [affectedUntil, setAffectedUntil] = useState(() =>
    toLocalValue(announcement?.affectedUntil ?? null),
  );

  const gapMessage = (value: string): string | undefined => {
    const gap = announcementDateGap(value);
    return gap === "TIME_REQUIRED" ? T.TIME_REQUIRED : gap === "DATE_REQUIRED" ? T.DATE_REQUIRED : undefined;
  };
  const fromError = gapMessage(affectedFrom);
  const untilError =
    gapMessage(affectedUntil) ??
    (!fromError && announcementWindowInvalid(affectedFrom, affectedUntil) ? T.WINDOW_ERROR : undefined);
  const formInvalid = Boolean(fromError || untilError);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (formInvalid) return;
    await onSubmit(
      {
        title: title.trim(),
        body: body.trim(),
        category,
        importance,
        affectedFrom: toIsoValue(affectedFrom),
        affectedUntil: toIsoValue(affectedUntil),
        correctionOfPublicId: announcement?.correctionOfPublicId ?? null,
      },
      announcement?.version,
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={announcement ? T.EDIT_TITLE : T.NEW_TITLE}
      size="lg"
      footer={
        <FormActions>
          <Button variant="ghost" onClick={onClose}>
            {T.CANCEL}
          </Button>
          <Button type="submit" form="announcement-form" isLoading={isSaving}>
            {announcement ? T.SAVE : T.CREATE}
          </Button>
        </FormActions>
      }
    >
      <form id="announcement-form" className="space-y-4" onSubmit={(event) => void submit(event)}>
        <Input
          id="announcement-title"
          label={T.TITLE}
          value={title}
          maxLength={150}
          required
          onChange={(event) => setTitle(event.target.value)}
        />
        <Textarea
          id="announcement-body"
          label={T.MESSAGE}
          value={body}
          maxLength={5000}
          required
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="announcement-category"
            label={T.CATEGORY}
            options={categoryOptions}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as AnnouncementCreateRequest["category"])
            }
          />
          <Select
            id="announcement-importance"
            label={T.IMPORTANCE}
            options={importanceOptions}
            value={importance}
            onChange={(event) =>
              setImportance(event.target.value as AnnouncementCreateRequest["importance"])
            }
          />
          <div className="sm:col-span-2">
            <DateTimeInput
              id="announcement-affected-from"
              label={T.AFFECTED_FROM}
              value={affectedFrom}
              error={fromError}
              onChange={(event) => setAffectedFrom(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <DateTimeInput
              id="announcement-affected-until"
              label={T.AFFECTED_UNTIL}
              value={affectedUntil}
              error={untilError}
              onChange={(event) => setAffectedUntil(event.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
