import type { ReactElement } from "react";
import { DescriptionList, ProgressBar } from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface ExaminerProgressProps {
  eligible: number | null;
  submitted: number | null;
  percent: number | null;
  text: StaffDetailText;
}

export const ExaminerProgress = ({ eligible, submitted, percent, text }: ExaminerProgressProps): ReactElement => {
  const verified = eligible !== null && submitted !== null && percent !== null
    && Number.isFinite(percent) && percent >= 0 && percent <= 100
    && eligible >= 0 && submitted >= 0 && submitted <= eligible;
  if (!verified) return <DescriptionList items={[{ label: text.progress, value: text.unavailableProgress }]} />;
  if (eligible === 0) return <DescriptionList items={[{ label: text.progress, value: text.noWork }]} />;
  return <div className="flex flex-col gap-3">
    <DescriptionList items={[
      { label: text.eligibleAnswers, value: eligible }, { label: text.submittedAnswers, value: submitted },
      { label: text.progress, value: `${percent}%` },
    ]} />
    <ProgressBar value={percent} max={100} label={text.progress} />
  </div>;
};
