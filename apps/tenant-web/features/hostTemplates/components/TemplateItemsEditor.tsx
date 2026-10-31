"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateItemRequest } from "@pte/api-client";
import { Button } from "@pte/ui";
import { SKILLS } from "../constants";
import { useEditorText, useSkillLabels } from "../hooks/useTemplateText";
import { WEIGHT_FIELD } from "../utils/weights";

interface TemplateItemsEditorProps {
  items: readonly ScoreTemplateItemRequest[];
  editable: boolean;
  onRemove: (taskTypeKey: string) => void;
  onWeightChange: (taskTypeKey: string, skill: (typeof SKILLS)[number], value: number) => void;
}

const WEIGHT_INPUT_CLASS =
  "w-20 rounded border border-[var(--control-border)] bg-[var(--surface-card)] px-2 py-1 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--action)] disabled:bg-transparent disabled:border-transparent";

export const TemplateItemsEditor = ({
  items,
  editable,
  onRemove,
  onWeightChange,
}: TemplateItemsEditorProps): ReactElement => {
  const text = useEditorText();
  const labels = useSkillLabels();

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--shell-border)] text-xs uppercase text-[var(--ink-muted)]">
          <tr>
            <th className="px-3 py-2">{text.COL_TASK}</th>
            <th className="px-3 py-2">{text.COL_COUNT}</th>
            {SKILLS.map((skill) => (
              <th key={skill} className="px-3 py-2">
                {labels[skill]}
              </th>
            ))}
            {editable && <th className="px-3 py-2" />}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.taskTypeKey} className="border-b border-[var(--shell-border)] last:border-0">
              <td className="px-3 py-2">
                <span className="font-mono text-xs text-[var(--ink-primary)]">{item.taskTypeKey}</span>
                <span className="ml-2 text-xs text-[var(--ink-muted)]">{labels[item.section as keyof typeof labels] ?? item.section}</span>
              </td>
              <td className="px-3 py-2 text-[var(--ink-secondary)]">
                {item.minCount === item.maxCount ? item.maxCount : `${item.minCount}–${item.maxCount}`}
              </td>
              {SKILLS.map((skill) => (
                <td key={skill} className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    disabled={!editable}
                    aria-label={`${item.taskTypeKey} ${labels[skill]}`}
                    className={WEIGHT_INPUT_CLASS}
                    value={item[WEIGHT_FIELD[skill]]}
                    onChange={(event) => {
                      const parsed = Number(event.target.value);
                      onWeightChange(item.taskTypeKey, skill, Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
                    }}
                  />
                </td>
              ))}
              {editable && (
                <td className="px-3 py-2 text-right">
                  <Button variant="danger" appearance="ghost" size="sm" onClick={() => onRemove(item.taskTypeKey)}>
                    {text.REMOVE}
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
