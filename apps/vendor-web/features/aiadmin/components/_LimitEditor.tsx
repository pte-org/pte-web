import type { ReactElement } from "react";
import { Input } from "@pte/ui";
import type { AiAdminCopy, GenerationLimit } from "../constants";

interface LimitEditorProps {
  limit: GenerationLimit;
  value: string;
  invalid: boolean;
  copy: AiAdminCopy;
  /** Shown under the field while the value is valid. */
  hint?: string;
  onChange: (value: string) => void;
}

/** The field of one generation limit while the panel is being edited. */
export const LimitEditor = ({ limit, value, invalid, copy, hint, onChange }: LimitEditorProps): ReactElement => {
  const message = invalid
    ? copy.LIMIT_INVALID.replace("{min}", String(limit.min)).replace("{max}", String(limit.max))
    : hint;
  return (
    <div className="flex flex-col gap-1">
      <Input aria-label={copy[limit.label]} type="number" min={limit.min} max={limit.max} className="w-28"
        value={value} onChange={(event) => onChange(event.target.value)} />
      {message ? <p className="text-xs text-[var(--ink-muted)]">{message}</p> : null}
    </div>
  );
};
