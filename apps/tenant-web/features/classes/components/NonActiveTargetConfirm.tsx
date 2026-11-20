"use client";

import type { ReactElement } from "react";
import { Alert, TypedConfirmInput } from "@pte/ui";
import { useClassFlowText } from "../hooks/useClassFlowText";

interface NonActiveTargetConfirmProps {
  /** The destination Class name the Host must type verbatim. */
  targetName: string;
  /** Current value of the confirm input — owned by the caller so it can gate submit. */
  typed: string;
  onTypedChange: (next: string) => void;
}

/**
 * Warning + typed-confirm shown when a transfer/merge targets a non-ACTIVE Class.
 *
 * The input itself is the shared `TypedConfirmInput` primitive from `@pte/ui`; this
 * wrapper only supplies the Class-specific warning copy and the mismatch hint.
 */
export const NonActiveTargetConfirm = ({
  targetName,
  typed,
  onTypedChange,
}: NonActiveTargetConfirmProps): ReactElement => {
  const tf = useClassFlowText();
  const values = { name: targetName };
  return (
  <div className="mt-3 flex flex-col gap-2" data-testid="non-active-target-confirm">
    <Alert tone="warning" title={tf("nonActiveChip")}>
      {tf("nonActiveBody", values)}
    </Alert>
    <TypedConfirmInput
      expectedValue={targetName}
      label={tf("typeToConfirm", values)}
      placeholder={targetName}
      helperText={
        typed.length > 0 && typed !== targetName
          ? tf("mismatchHint", values)
          : undefined
      }
      value={typed}
      onValueChange={onTypedChange}
    />
  </div>
  );
};
