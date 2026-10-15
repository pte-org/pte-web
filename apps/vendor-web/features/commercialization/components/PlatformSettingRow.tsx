import { Input } from "@pte/ui";
import type { PlatformSettingResponse } from "@pte/api-client";
import type { PlatformSettingPresentation } from "../constants";
import type { ReactElement } from "react";

interface PlatformSettingRowProps {
  setting: PlatformSettingResponse;
  presentation: PlatformSettingPresentation;
  value: string;
  onChange: (value: string) => void;
}

export function PlatformSettingRow({
  setting,
  presentation,
  value,
  onChange,
}: PlatformSettingRowProps): ReactElement {
  return (
    <div className="grid gap-3 py-5 first:pt-0 last:pb-0">
      <Input
        id={`setting-${setting.key}`}
        label={presentation.label}
        helperText={presentation.description}
        type="number"
        inputMode="numeric"
        min={setting.minimum ?? undefined}
        max={setting.maximum ?? undefined}
        step={1}
        required
        value={value}
        rightAction={
          <span className="shrink-0 text-xs text-[var(--ink-muted)]">
            {presentation.unit}
          </span>
        }
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="text-xs text-[var(--ink-secondary)]">{presentation.impact}</p>
    </div>
  );
}
