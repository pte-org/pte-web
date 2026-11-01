"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateItemRequest } from "@pte/api-client";
import { Button } from "@pte/ui";
import { SKILLS } from "../constants";
import { useEditorText, useSkillLabels } from "../hooks/useTemplateText";
import type { PoolSlot } from "../utils/pool";
import { WEIGHT_FIELD } from "../utils/weights";

interface TemplateItemsEditorProps {
  items: readonly ScoreTemplateItemRequest[];
  editable: boolean;
  onRemove: (taskTypeKey: string) => void;
  onWeightChange: (taskTypeKey: string, skill: (typeof SKILLS)[number], value: number) => void;
  /** Cells the host may not change; omitted means every cell follows `editable`. */
  isWeightEditable?: (taskTypeKey: string, skill: (typeof SKILLS)[number]) => boolean;
  /** Published-question coverage per task type; the column is hidden when omitted. */
  pool?: ReadonlyMap<string, PoolSlot>;
}

function PoolBadge({
  slot,
  ok,
  short,
}: {
  slot: PoolSlot | undefined;
  ok: string;
  short: string;
}): ReactElement | null {
  if (!slot) return null;
  const tone = slot.ready
    ? "bg-green-50 text-green-700 ring-green-200"
    : "bg-red-50 text-red-700 ring-red-200";
  const title = slot.ready
    ? ok
    : short.replace("{available}", String(slot.available)).replace("{required}", String(slot.required));
  return (
    <span
      title={title}
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {slot.available}/{slot.required}
    </span>
  );
}

const WEIGHT_INPUT_CLASS =
  "w-20 rounded border border-[var(--control-border)] bg-[var(--surface-card)] px-2 py-1 text-sm text-[var(--ink-primary)] outline-none focus:border-[var(--action)] disabled:bg-transparent disabled:border-transparent";

export const TemplateItemsEditor = ({
  items,
  editable,
  onRemove,
  onWeightChange,
  isWeightEditable,
  pool,
}: TemplateItemsEditorProps): ReactElement => {
  const text = useEditorText();
  const labels = useSkillLabels();
  const lockedByRule = (taskTypeKey: string, skill: (typeof SKILLS)[number]): boolean =>
    editable && isWeightEditable?.(taskTypeKey, skill) === false;

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-[var(--shell-border)] text-xs uppercase text-[var(--ink-muted)]">
          <tr>
            <th className="px-3 py-2">{text.COL_TASK}</th>
            <th className="px-3 py-2">{text.COL_COUNT}</th>
            {pool && <th className="px-3 py-2">{text.COL_POOL}</th>}
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
              {pool && (
                <td className="px-3 py-2">
                  <PoolBadge
                    slot={pool.get(item.taskTypeKey)}
                    ok={text.POOL_OK}
                    short={text.POOL_SHORT}
                  />
                </td>
              )}
              {SKILLS.map((skill) => (
                <td key={skill} className="px-3 py-2">
                  {/* The tooltip sits on a wrapper: a disabled input does not reliably show its own title. */}
                  <span
                    className="inline-block"
                    title={lockedByRule(item.taskTypeKey, skill) ? text.WEIGHT_LOCKED : undefined}
                  >
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      disabled={!editable || lockedByRule(item.taskTypeKey, skill)}
                      aria-label={`${item.taskTypeKey} ${labels[skill]}`}
                      className={WEIGHT_INPUT_CLASS}
                      value={item[WEIGHT_FIELD[skill]]}
                      onChange={(event) => {
                        const parsed = Number(event.target.value);
                        onWeightChange(item.taskTypeKey, skill, Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
                      }}
                    />
                  </span>
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
