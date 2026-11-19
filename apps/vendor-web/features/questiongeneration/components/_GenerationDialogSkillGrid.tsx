"use client";

import { useState, type ReactElement } from "react";
import type { QuestionGenerationTaskTypeResponse } from "@pte/api-client";
import { Alert, CollapsibleSection, Tabs } from "@pte/ui";
import { GENERATION_SECTIONS, TASK_ROW_GRID } from "../dialogConstants";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import type { GenerationSelectionState } from "../hooks/useGenerationSelection";
import { selectionTotal } from "../utils/generationSelection";
import { GenerationDialogTaskTypeRow } from "./_GenerationDialogTaskTypeRow";

interface SkillGridProps {
  taskTypes: readonly QuestionGenerationTaskTypeResponse[];
  state: GenerationSelectionState;
  messages: DialogMessages;
}

/** Column captions shown once above the list, so each line carries only its controls. */
const SkillColumnHeader = ({ messages }: { messages: DialogMessages }): ReactElement => (
  <div className={`${TASK_ROW_GRID} px-3 pb-1 text-xs font-medium uppercase text-[var(--ink-muted)]`}>
    <span>{messages.taskTypeColumn}</span>
    <span>{messages.countLabel}</span>
    <span>{messages.cefrLabel}</span>
    <span>{messages.imageKindLabel}</span>
    <span />
  </div>
);

/** One collapsible block: a tab per skill (with how many of its types are ticked) and that skill's task-type list. */
export const GenerationDialogSkillGrid = ({ taskTypes, state, messages }: SkillGridProps): ReactElement => {
  const sections = GENERATION_SECTIONS.filter((section) => taskTypes.some((type) => type.section === section));
  // Open on the skill of the first ticked type (e.g. the editor's own task type), else the first skill.
  const [activeSection, setActiveSection] = useState<string>(() => state.selection.rows[0]?.section ?? sections[0] ?? "");
  if (taskTypes.length === 0) return <Alert tone="warning">{messages.noTaskTypes}</Alert>;
  const { rows } = state.selection;
  const summary = formatMessage(messages.typesSummary, { types: rows.length, items: selectionTotal(state.selection) });
  const tabs = sections.map((section) => ({
    id: section,
    label: messages[`skill${section}`],
    count: `${rows.filter((row) => row.section === section).length}/${taskTypes.filter((type) => type.section === section).length}`,
  }));
  return (
    <CollapsibleSection title={messages.typesTitle} subtitle={summary}>
      <Tabs items={tabs} value={activeSection} onChange={setActiveSection} variant="minimal" ariaLabel={messages.typesTitle} />
      <div className="pt-3">
        <SkillColumnHeader messages={messages} />
        <div className="divide-y divide-[var(--shell-border)] overflow-hidden rounded-lg border border-[var(--shell-border)]">
          {taskTypes.filter((type) => type.section === activeSection).map((type) => (
            <GenerationDialogTaskTypeRow
              key={type.taskType}
              taskType={type.taskType}
              row={rows.find((row) => row.taskType === type.taskType)}
              messages={messages}
              onToggle={() => state.toggle(type.taskType, activeSection)}
              onChange={(patch) => state.update(type.taskType, patch)}
            />
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
};
