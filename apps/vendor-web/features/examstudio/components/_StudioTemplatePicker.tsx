"use client";

import { useState, type ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Button, ChevronDownIcon, Input, Modal } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";
import { PICKER_PAGE_SIZE, filterPickerTemplates } from "../templatePicker";

interface StudioTemplatePickerProps {
  template: ScoreTemplateResponse;
  /** Every template that can be shown: the active one and the drafts. */
  templates: ScoreTemplateResponse[];
  onSelect: (publicId: string) => void;
  /** Present only when the shown template is locked and has no draft to switch to. */
  onCreateDraft?: () => void;
  isCreatingDraft: boolean;
}

/**
 * One button for "which template am I looking at": it opens a searchable list, so the choice stays
 * usable with a hundred templates.
 */
export const StudioTemplatePicker = ({
  template,
  templates,
  onSelect,
  onCreateDraft,
  isCreatingDraft,
}: StudioTemplatePickerProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PICKER_PAGE_SIZE);
  const matches = filterPickerTemplates(templates, query);

  return (
    <>
      <Button size="sm" variant="secondary" appearance="outline" onClick={() => setOpen(true)}>
        <span className="flex items-center gap-2">
          <span>
            {template.name} v{template.version}
          </span>
          <Badge variant={template.status === "ACTIVE" ? "success" : "warning"}>
            {template.status}
          </Badge>
          <ChevronDownIcon className="h-4 w-4" />
        </span>
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={text.PICKER_TITLE}
        size="xl"
        closeOnBackdropClick
        footer={
          <>
            {onCreateDraft && (
              <Button variant="ghost" isLoading={isCreatingDraft} onClick={onCreateDraft}>
                {text.CREATE_DRAFT}
              </Button>
            )}
            <Button onClick={() => setOpen(false)}>{text.PICKER_DONE}</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            id="studio-template-search"
            label={text.PICKER_SEARCH}
            placeholder={text.PICKER_SEARCH}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShown(PICKER_PAGE_SIZE);
            }}
          />
          <p className="text-xs text-[var(--ink-muted)]">{text.PICKER_HINT}</p>
          <ul className="max-h-[50vh] divide-y divide-[var(--shell-border)] overflow-y-auto rounded-lg border border-[var(--shell-border)]">
            {matches.slice(0, shown).map((candidate) => {
              const isWorking = candidate.publicId === template.publicId;
              return (
                <li key={candidate.publicId} className="px-3 py-2">
                  <label className="flex min-w-0 cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="studio-working-template"
                      checked={isWorking}
                      onChange={() => onSelect(candidate.publicId)}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[var(--ink-primary)]">
                        {candidate.name} v{candidate.version}
                      </span>
                      <span className="block truncate font-mono text-xs text-[var(--ink-muted)]">
                        {candidate.code} · {candidate.items.length} {text.PICKER_TASK_TYPES}
                      </span>
                    </span>
                    <Badge variant={candidate.status === "ACTIVE" ? "success" : "warning"}>
                      {candidate.status}
                    </Badge>
                  </label>
                </li>
              );
            })}
            {matches.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-[var(--ink-muted)]">
                {text.PICKER_EMPTY}
              </li>
            )}
          </ul>
          {matches.length > shown && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShown((current) => current + PICKER_PAGE_SIZE)}
            >
              {text.PICKER_MORE.replace("{count}", String(matches.length - shown))}
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};
