import type { ReactElement } from "react";
import { QuantityStepper } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { isGateTriggered, LAB_SPECS, labItemScore } from "../constants/labItems";

interface LabItemEditorProps {
  taskKey: string;
  values: readonly number[];
  onChange: (index: number, value: number) => void;
  copy: AboutPteCopy;
}

/** Controls for one sample item plus the item-score working, following the question type's real rule. */
export const LabItemEditor = ({ taskKey, values, onChange, copy }: LabItemEditorProps): ReactElement => {
  const spec = LAB_SPECS[taskKey];
  const text = copy.simulation.lab;
  const score = labItemScore(spec, values);
  const label = (key: string): string => text.counters[key as keyof typeof text.counters] ?? key;
  const [first = 0, second = 0] = values;
  const maxSum = spec.controls.reduce((sum, control) => sum + control.max, 0);
  const working = {
    traits: isGateTriggered(spec, values)
      ? text.gateHit
      : `(${values.join(" + ")}) ÷ ${maxSum} × 100 = ${score}`,
    ratio: `${first} ÷ ${spec.controls[0].max} × 100 = ${score}`,
    plusMinus: `max(${first} − ${second}, 0) ÷ ${spec.controls[0].max} × 100 = ${score}`,
    single: `${first === 1 ? text.counters.correct : text.counters.incorrect} → ${score}`,
  }[spec.rule];
  return (
    <div className="space-y-3 border-t border-[var(--shell-border)] bg-[var(--surface-subtle)] px-3 py-3">
      <p className="text-xs text-[var(--ink-secondary)]">{text.ruleHint[spec.rule]}</p>
      <div className="space-y-2">
        {spec.controls.map((control, index) => (
          <div key={control.key} className="flex items-center justify-between gap-3">
            <span className="text-sm text-[var(--ink-primary)]">
              {label(control.key)}
              <span className="ml-1 text-xs text-[var(--ink-muted)]">{`/ ${control.max}`}</span>
              {control.gate && <span className="ml-1 text-xs text-rose-600">{`(${copy.flow.gate})`}</span>}
            </span>
            <QuantityStepper
              value={values[index]}
              min={0}
              max={control.max}
              onChange={(value) => onChange(index, value)}
              displayMode="value"
            />
          </div>
        ))}
      </div>
      <p className="rounded-md bg-[var(--surface-card)] px-2 py-1 font-mono text-xs text-[var(--ink-primary)]">
        {`${copy.flow.itemFormula} = ${working}`}
      </p>
    </div>
  );
};
