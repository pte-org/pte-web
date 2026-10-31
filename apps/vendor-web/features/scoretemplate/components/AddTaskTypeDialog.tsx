"use client";

import { useState, type ReactElement } from "react";
import type { QuestionTypeResponse } from "@pte/api-client";
import { Button, Modal, Select } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { findAvailableTaskTypes, getAddTaskTypeBlocker, taskTypeKeyOf } from "../addTaskType";
import {
  EXAM_TEMPLATE_SECTIONS,
  SCORE_TEMPLATE_ALL_TAB,
  SCORE_TEMPLATE_ITEM_HEADERS as RAW_SCORE_TEMPLATE_ITEM_HEADERS,
  SCORE_TEMPLATE_SECTION_LABELS as RAW_SCORE_TEMPLATE_SECTION_LABELS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "../constants";
import type { ScoreTemplateItemDraft } from "../types";

interface AddTaskTypeDialogProps {
  open: boolean;
  onClose: () => void;
  /** The tab the dialog was opened from: a skill fixes the section, "All" lets the admin pick one. */
  activeTab: string;
  questionTypes: QuestionTypeResponse[];
  items: ScoreTemplateItemDraft[];
  onAdd: (type: QuestionTypeResponse) => void;
}

/** The small "add task type" form. Whoever shows it decides what opens it (a menu entry, an empty-state button). */
export const AddTaskTypeDialog = ({
  open,
  onClose,
  activeTab,
  questionTypes,
  items,
  onAdd,
}: AddTaskTypeDialogProps): ReactElement => {
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const H = useAdminCopy(RAW_SCORE_TEMPLATE_ITEM_HEADERS);
  const sectionLabels = useAdminCopy(RAW_SCORE_TEMPLATE_SECTION_LABELS);
  const [pickedSection, setPickedSection] = useState("");
  const [typeKey, setTypeKey] = useState("");

  const fixedSection = activeTab === SCORE_TEMPLATE_ALL_TAB ? "" : activeTab;
  const section = fixedSection || pickedSection;
  const available = findAvailableTaskTypes(questionTypes, items, section);
  const blocker = getAddTaskTypeBlocker(questionTypes, items, section);
  const selected = available.find((type) => taskTypeKeyOf(type) === typeKey);

  const close = (): void => {
    setPickedSection("");
    setTypeKey("");
    onClose();
  };
  const handleAdd = (): void => {
    if (!selected) return;
    onAdd(selected);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title={T.ADD_TYPE}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            {T.CANCEL_ACTION}
          </Button>
          <Button onClick={handleAdd} disabled={!selected}>
            {T.ADD_TYPE}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!fixedSection && (
          <Select
            id="exam-template-add-section"
            label={H.SECTION}
            value={pickedSection}
            onChange={(event) => {
              setPickedSection(event.target.value);
              setTypeKey("");
            }}
            placeholder={T.ADD_SECTION_PLACEHOLDER}
            options={EXAM_TEMPLATE_SECTIONS.map((value) => ({
              value,
              label: sectionLabels[value],
            }))}
          />
        )}
        <Select
          id="exam-template-add-type"
          label={H.TASK_TYPE}
          value={typeKey}
          onChange={(event) => setTypeKey(event.target.value)}
          disabled={!section || available.length === 0}
          placeholder={!section ? T.NO_SECTION_SELECTED : T.ADD_TYPE_PLACEHOLDER}
          options={available.map((type) => ({
            value: taskTypeKeyOf(type),
            label: `${type.displayName} (${taskTypeKeyOf(type)})`,
          }))}
        />
        {blocker && <p className="text-sm text-[var(--ink-secondary)]">{T[blocker]}</p>}
      </div>
    </Modal>
  );
};
