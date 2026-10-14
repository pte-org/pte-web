"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import type { AnnouncementCreateRequest, AnnouncementResponse } from "@pte/api-client";
import { Button, DateTimeInput, FormActions, Input, Select, Textarea } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface AnnouncementInlineFormProps {
  announcement: AnnouncementResponse;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (payload: AnnouncementCreateRequest, expectedDraftVersion: number) => Promise<void>;
}

const toLocalValue = (value: string | null): string =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const toIsoValue = (value: string): string | null => (value ? new Date(value).toISOString() : null);

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

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
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
    );
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
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
        <DateTimeInput
          id="announcement-affected-from-inline"
          label={T.AFFECTED_FROM}
          value={affectedFrom}
          onChange={(event) => setAffectedFrom(event.target.value)}
          disabled={isSaving}
        />
        <DateTimeInput
          id="announcement-affected-until-inline"
          label={T.AFFECTED_UNTIL}
          value={affectedUntil}
          onChange={(event) => setAffectedUntil(event.target.value)}
          disabled={isSaving}
        />
      </div>
      <FormActions>
        <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
          {T.CANCEL}
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {T.SAVE}
        </Button>
      </FormActions>
    </form>
  );
}
