"use client";

import type { ReactElement } from "react";
import { Badge, Button, Input, SortableList } from "@pte/ui";
import type { PromptEditCopy } from "../promptEditConstants";
import { newSectionId, removeAt, reorderByIds, replaceAt } from "../promptEditing";
import type { DocumentSection, PromptDocumentDraft } from "../promptText";
import { AutoGrowTextarea } from "./_AutoGrowTextarea";
import { PromptOutputEditor } from "./_PromptOutputEditor";
import { SectionFold, isLongSection } from "./_SectionFold";

interface PromptDocumentEditorProps {
  draft: PromptDocumentDraft;
  copy: PromptEditCopy;
  readOnly: boolean;
  /** Sections the system depends on: shown, never edited, moved or removed. */
  lockedIds: readonly string[];
  onChange: (draft: PromptDocumentDraft) => void;
}


/** An output section lists the fields of the AI's reply; the code that reads the reply needs them as they are. */
const isOutput = (section: DocumentSection): boolean => section.fields !== null;

/**
 * A prompt edited like a document: a title, an opening and any number of sections, each a heading over a box of free
 * text. Sections are added and removed with one click and reordered by dragging. The output section of a prompt is only
 * shown: its field names are read by code.
 */
export const PromptDocumentEditor = ({
  draft, copy, readOnly, lockedIds, onChange,
}: PromptDocumentEditorProps): ReactElement => {
  const isLocked = (section: DocumentSection): boolean => lockedIds.includes(section.id);
  return (
  <div className="space-y-5">
    <Input
      aria-label={copy.TITLE_LABEL}
      className="text-lg font-semibold"
      value={draft.title}
      disabled={readOnly}
      onChange={(event) => onChange({ ...draft, title: event.target.value })}
    />
    <AutoGrowTextarea
      aria-label={copy.INTRO_LABEL}
      placeholder={copy.INTRO_LABEL}
      value={draft.intro}
      disabled={readOnly}
      onChange={(event) => onChange({ ...draft, intro: event.target.value })}
    />
    <SortableList
      items={draft.sections}
      getId={(section) => section.id}
      onReorder={readOnly ? undefined : (ids) => onChange({ ...draft, sections: reorderByIds(draft.sections, ids) })}
      isLocked={(section) => isOutput(section) || isLocked(section)}
      dragHandleLabel={copy.DRAG_HANDLE}
      columnsClassName="sm:grid-cols-1"
      handleInside
      renderCells={(section, index) => {
        const update = (next: DocumentSection): void =>
          onChange({ ...draft, sections: replaceAt(draft.sections, index, next) });
        const label = section.title || copy.SECTION_TITLE;
        if (section.fields) {
          const fields = section.fields;
          return (
            <SectionFold long={isLongSection(section)} label={label}
              header={<h3 className="px-1 text-sm font-semibold text-[var(--ink-primary)]">{section.title}</h3>}>
              <PromptOutputEditor text={section.text} rows={fields} copy={copy} readOnly={readOnly}
                onRowsChange={(rows) => update({ ...section, fields: rows })} />
            </SectionFold>
          );
        }
        if (isLocked(section)) {
          return (
            <SectionFold long={isLongSection(section)} label={label} header={<>
              <h3 className="px-1 text-sm font-semibold text-[var(--ink-primary)]">{section.title}</h3>
              <Badge>{copy.LOCKED}</Badge>
            </>}>
              <AutoGrowTextarea aria-label={section.title} value={section.text} disabled readOnly />
            </SectionFold>
          );
        }
        return (
          <SectionFold long={isLongSection(section)} label={label} header={<>
            <Input aria-label={copy.SECTION_TITLE} placeholder={copy.SECTION_TITLE} className="flex-1 font-semibold"
              value={section.title} disabled={readOnly} onChange={(event) => update({ ...section, title: event.target.value })} />
            {!readOnly && (
              <Button variant="danger" appearance="ghost" size="sm" iconOnly aria-label={copy.DELETE_SECTION}
                onClick={() => onChange({ ...draft, sections: removeAt(draft.sections, index) })}>✕</Button>
            )}
          </>}>
            <AutoGrowTextarea aria-label={label} placeholder={copy.SECTION_PLACEHOLDER} value={section.text}
              disabled={readOnly} onChange={(event) => update({ ...section, text: event.target.value })} />
          </SectionFold>
        );
      }}
    />
    {!readOnly && (
      <Button
        variant="secondary"
        onClick={() =>
          onChange({
            ...draft,
            sections: [...draft.sections, { id: newSectionId("", draft.sections.map((section) => section.id)), title: "", text: "", fields: null }],
          })
        }
      >
        + {copy.ADD_SECTION}
      </Button>
    )}
  </div>
  );
};
