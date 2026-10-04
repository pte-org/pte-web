"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import type { AnnouncementCreateRequest, AnnouncementResponse } from "@pte/api-client";
import { Button, FormActions, Input, Modal, Select, Textarea } from "@pte/ui";

interface AnnouncementFormModalProps {
  open: boolean;
  announcement: AnnouncementResponse | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: AnnouncementCreateRequest, expectedDraftVersion?: number) => Promise<void>;
}

const toLocalValue = (value: string | null): string =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const toIsoValue = (value: string): string | null => (value ? new Date(value).toISOString() : null);

export function AnnouncementFormModal({
  open,
  announcement,
  isSaving,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps): ReactElement {
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

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
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
      title={announcement ? "Edit announcement draft" : "New announcement"}
      size="lg"
      footer={
        <FormActions>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="announcement-form" isLoading={isSaving}>
            {announcement ? "Save draft" : "Create draft"}
          </Button>
        </FormActions>
      }
    >
      <form id="announcement-form" className="space-y-4" onSubmit={(event) => void submit(event)}>
        <Input
          id="announcement-title"
          label="Title"
          value={title}
          maxLength={150}
          required
          onChange={(event) => setTitle(event.target.value)}
        />
        <Textarea
          id="announcement-body"
          label="Message"
          value={body}
          maxLength={5000}
          required
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="announcement-category"
            label="Category"
            options={[
              { label: "System notice", value: "SYSTEM_NOTICE" },
              { label: "Maintenance", value: "MAINTENANCE" },
              { label: "Session", value: "SESSION" },
              { label: "Application", value: "APPLICATION" },
              { label: "Billing", value: "BILLING" },
            ]}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as AnnouncementCreateRequest["category"])
            }
          />
          <Select
            id="announcement-importance"
            label="Importance"
            options={[
              { label: "Informational", value: "INFO" },
              { label: "Important", value: "IMPORTANT" },
            ]}
            value={importance}
            onChange={(event) =>
              setImportance(event.target.value as AnnouncementCreateRequest["importance"])
            }
          />
          <Input
            id="announcement-affected-from"
            label="Affected from"
            type="datetime-local"
            value={affectedFrom}
            onChange={(event) => setAffectedFrom(event.target.value)}
          />
          <Input
            id="announcement-affected-until"
            label="Affected until"
            type="datetime-local"
            value={affectedUntil}
            onChange={(event) => setAffectedUntil(event.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
