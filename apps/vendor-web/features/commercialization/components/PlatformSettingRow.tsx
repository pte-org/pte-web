"use client";

import type { ReactElement } from "react";
import { ClockIcon, Input, UsersIcon, useLocale } from "@pte/ui";
import type { PlatformSettingResponse } from "@pte/api-client";
import type { PlatformSettingPresentation, PlatformSettingsText } from "../constants";

interface PlatformSettingRowProps {
  setting: PlatformSettingResponse;
  presentation: PlatformSettingPresentation;
  text: PlatformSettingsText;
  value: string;
  onChange: (value: string) => void;
}

const HOURS_PER_DAY = 24;

/** A tinted icon tile per kind of setting, in the colours the rest of the admin uses for people and for time. */
const SETTING_ICON = {
  people: { Icon: UsersIcon, tile: "bg-[var(--sky-tint)] text-[var(--sky-action)]" },
  time: { Icon: ClockIcon, tile: "bg-[var(--cream-tint)] text-[var(--cream-action)]" },
} as const;

const fill = (template: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce((out, [key, item]) => out.replace(`{${key}}`, String(item)), template);

/**
 * One setting on one line: its name, what it does and its default on the left, a compact number field with its unit
 * on the right, so the number and its unit stay together however wide the card is.
 */
export function PlatformSettingRow({ setting, presentation, text, value, onChange }: PlatformSettingRowProps): ReactElement {
  const { locale } = useLocale();
  const hours = Number(value);
  const days = presentation.hoursAsDays && value.trim() !== "" && Number.isFinite(hours) && hours >= HOURS_PER_DAY
    ? (hours / HOURS_PER_DAY).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", { maximumFractionDigits: 1 })
    : null;
  const inputId = `setting-${setting.key}`;
  const { Icon, tile } = SETTING_ICON[presentation.hoursAsDays ? "time" : "people"];

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div className="flex min-w-0 items-start gap-3 sm:max-w-[60%]">
        <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tile}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--ink-primary)]">
            {presentation.label}
          </label>
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">{presentation.description}</p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            {fill(text.DEFAULT_LABEL, { value: setting.defaultValue, unit: presentation.unit })}
          </p>
        </div>
      </div>
      <div className="w-full shrink-0 sm:w-52">
        <Input
          id={inputId}
          type="number"
          inputMode="numeric"
          min={setting.minimum ?? undefined}
          max={setting.maximum ?? undefined}
          step={1}
          required
          value={value}
          // The unit is a block of its own at the end of the field, set off by a rule, so the field reads as number + unit.
          rightAction={
            <span className="-mr-3 flex shrink-0 items-center self-stretch rounded-r-lg border-l border-[var(--control-border)] bg-[var(--surface-subtle)] px-3 text-xs text-[var(--ink-secondary)]">
              {presentation.unit}
            </span>
          }
          onChange={(event) => onChange(event.target.value)}
        />
        {days && (
          <p className="mt-2 text-right">
            <span className="rounded-full bg-[var(--sky-tint)] px-2.5 py-0.5 text-xs font-medium text-[var(--sky-action)]">
              {fill(text.DAYS_APPROX, { days })}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
