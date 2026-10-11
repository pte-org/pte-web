import type { ReactElement } from "react";
import { CircularProgressChart, DescriptionList, ProgressBar } from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface ExaminerProgressProps {
  eligible: number | null;
  submitted: number | null;
  percent: number | null;
  text: StaffDetailText;
  variant?: "bar" | "circle";
}

export const ExaminerProgress = ({ eligible, submitted, percent, text, variant = "bar" }: ExaminerProgressProps): ReactElement => {
  const validProgress = eligible !== null && submitted !== null && percent !== null
    && Number.isFinite(percent) && percent >= 0 && percent <= 100
    && eligible >= 0 && submitted >= 0 && submitted <= eligible;
  if (variant === "circle") {
    const hasWork = validProgress && eligible > 0;
    return (
      <div className="grid gap-4 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <CircularProgressChart
          value={hasWork ? percent : null}
          max={100}
          valueLabel={hasWork ? `${percent}%` : text.emptyValue}
          ariaLabel={text.progress}
          caption={
            !validProgress ? text.emptyValue : eligible === 0 ? text.noWork : text.progress
          }
          tone="brand"
        />
        <DescriptionList
          items={[
            { label: text.eligibleAnswers, value: validProgress ? eligible : text.emptyValue },
            { label: text.submittedAnswers, value: validProgress ? submitted : text.emptyValue },
            { label: text.progress, value: !validProgress ? text.emptyValue : eligible === 0 ? text.noWork : `${percent}%` },
          ]}
        />
      </div>
    );
  }
  if (!validProgress) return <DescriptionList items={[{ label: text.progress, value: text.emptyValue }]} />;
  if (eligible === 0) return <DescriptionList items={[{ label: text.progress, value: text.noWork }]} />;
  return <div className="flex flex-col gap-3">
    <DescriptionList items={[
      { label: text.eligibleAnswers, value: eligible }, { label: text.submittedAnswers, value: submitted },
      { label: text.progress, value: `${percent}%` },
    ]} />
    <ProgressBar value={percent} max={100} label={text.progress} />
  </div>;
};
