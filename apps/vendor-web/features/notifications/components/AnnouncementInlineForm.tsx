"use client";

import { useRef, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { AnnouncementCreateRequest, AnnouncementResponse } from "@pte/api-client";
import { Button, DateTimeInput, FormActions, Input, Select, Textarea, UnsavedChangesGuard, useLeaveAfterSave } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  announcementDateGap,
  announcementWindowInvalid,
  toIsoValue,
  toLocalValue,
} from "../announcementWindow";

interface AnnouncementInlineFormProps {
  announcement: AnnouncementResponse;
  isSaving: boolean;
  onCancel: () => void;
  /** Resolves true once the draft is saved. */
  onSubmit: (payload: AnnouncementCreateRequest, expectedDraftVersion: number) => Promise<boolean>;
}


export function AnnouncementInlineForm({
  announcement,
  isSaving,
  onCancel,
  onSubmit,
}: AnnouncementInlineFormProps): ReactElement {
  const T = useAdminCopy({
    CANCEL: "Cancel",
    SAVE: "Save draft",
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
  const [title, setTitle] = useState(announcement.title);
  const [body, setBody] = useState(announcement.body);
  const [category, setCategory] = useState<AnnouncementCreateRequest["category"]>(
    announcement.category,
  );
  const [importance, setImportance] = useState<AnnouncementCreateRequest["importance"]>(
    announcement.importance,
  );
  const [affectedFrom, setAffectedFrom] = useState(toLocalValue(announcement.affectedFrom));
  const [affectedUntil, setAffectedUntil] = useState(toLocalValue(announcement.affectedUntil));

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const leaveAfterSave = useLeaveAfterSave();
  const isDirty =
    title !== announcement.title ||
    body !== announcement.body ||
    category !== announcement.category ||
    importance !== announcement.importance ||
    affectedFrom !== toLocalValue(announcement.affectedFrom) ||
    affectedUntil !== toLocalValue(announcement.affectedUntil);

  const gapMessage = (value: string): string | undefined => {
    const gap = announcementDateGap(value);
    return gap === "TIME_REQUIRED" ? T.TIME_REQUIRED : gap === "DATE_REQUIRED" ? T.DATE_REQUIRED : undefined;
  };
  const fromError = gapMessage(affectedFrom);
  const untilError =
    gapMessage(affectedUntil) ??
    (!fromError && announcementWindowInvalid(affectedFrom, affectedUntil) ? T.WINDOW_ERROR : undefined);
  const formInvalid = Boolean(fromError || untilError);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (formInvalid) return;
    void onSubmit(
      {
        title: title.trim(),
        body: body.trim(),
        category,
        importance,
        affectedFrom: toIsoValue(affectedFrom),
        affectedUntil: toIsoValue(affectedUntil),
        correctionOfPublicId: announcement.correctionOfPublicId ?? null,
      },
      announcement.version,
    ).then((saved) => {
      if (saved) leaveAfterSave.settle();
    });
  };

  return (
    <form ref={formRef} className="space-y-4" onSubmit={submit}>
      <Input
        id="announcement-title-inline"
        label={T.TITLE}
        value={title}
        maxLength={150}
        required
        onChange={(event) => setTitle(event.target.value)}
        disabled={isSaving}
      />
      <Textarea
        id="announcement-body-inline"
        label={T.MESSAGE}
        value={body}
        maxLength={5000}
        required
        onChange={(event) => setBody(event.target.value)}
        disabled={isSaving}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="announcement-category-inline"
          label={T.CATEGORY}
          options={categoryOptions}
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as AnnouncementCreateRequest["category"])
          }
          disabled={isSaving}
        />
        <Select
          id="announcement-importance-inline"
          label={T.IMPORTANCE}
          options={importanceOptions}
          value={importance}
          onChange={(event) =>
            setImportance(event.target.value as AnnouncementCreateRequest["importance"])
          }
          disabled={isSaving}
        />
        <div className="sm:col-span-2">
          <DateTimeInput
            id="announcement-affected-from-inline"
            label={T.AFFECTED_FROM}
            value={affectedFrom}
            error={fromError}
            onChange={(event) => setAffectedFrom(event.target.value)}
            disabled={isSaving}
          />
        </div>
        <div className="sm:col-span-2">
          <DateTimeInput
            id="announcement-affected-until-inline"
            label={T.AFFECTED_UNTIL}
            value={affectedUntil}
            error={untilError}
            onChange={(event) => setAffectedUntil(event.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>
      <FormActions>
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          {T.CANCEL}
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {T.SAVE}
        </Button>
      </FormActions>
      <UnsavedChangesGuard
        isDirty={isDirty}
        isSaving={isSaving}
        onSaveAndLeave={(proceed) => leaveAfterSave.request(proceed, () => formRef.current?.requestSubmit())}
        onNavigate={(href) => router.push(href)}
      />
    </form>
  );
}
