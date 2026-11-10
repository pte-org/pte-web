import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";

interface RepeatPolicyFieldProps {
  wizardText: typeof CREATE_EXAM_WIZARD_TEXT;
  avoidRepeats: boolean;
  onChange: (avoidRepeats: boolean) => void;
}

/** Whether the exam may reuse questions from the centre's earlier exams or should prefer new ones. */
export function RepeatPolicyField({
  wizardText,
  avoidRepeats,
  onChange,
}: RepeatPolicyFieldProps): ReactElement {
  return (
    <Select
      label={wizardText.REPEAT_LABEL}
      value={avoidRepeats ? "AVOID" : "ALLOW"}
      onChange={(event) => onChange(event.target.value === "AVOID")}
      options={[
        { value: "ALLOW", label: wizardText.REPEAT_ALLOW },
        { value: "AVOID", label: wizardText.REPEAT_AVOID },
      ]}
      helperText={avoidRepeats ? wizardText.REPEAT_AVOID_HINT : wizardText.REPEAT_ALLOW_HINT}
    />
  );
}
