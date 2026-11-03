"use client";

import type { ReactElement } from "react";
import { Alert } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT, SECONDS_PER_MINUTE } from "../constants";
import type { StudioTile } from "../types";

interface TemplateSectionProps {
  tile: StudioTile;
}

const formatSeconds = (seconds: number): string =>
  seconds >= SECONDS_PER_MINUTE
    ? `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`
    : `${seconds}s`;

const fill = (message: string, values: Record<string, string | number>): string =>
  Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`{${name}}`, String(value)),
    message,
  );

/**
 * What the template says about the task type. The template is where the counts and times are set, so
 * this screen only reports them.
 */
export const TemplateSection = ({ tile }: TemplateSectionProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { item } = tile;

  if (item === null) {
    return <Alert tone="info">{text.IN_TEMPLATE_OFF}</Alert>;
  }

  const facts = [
    {
      label: text.QUESTION_COUNT,
      value: String(item.maxCount),
      tone: "text-[var(--action)]",
    },
    ...(item.prepSeconds > 0
      ? [
          {
            label: text.PREP_TIME,
            value: formatSeconds(item.prepSeconds),
            tone: "text-[var(--cream-action)]",
          },
        ]
      : []),
    {
      label: text.RESPONSE_TIME,
      value: formatSeconds(item.responseSeconds),
      tone: "text-[var(--mint-action)]",
    },
  ];

  return (
    <div className="space-y-3">
      <dl className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline gap-1.5">
            <dt className="text-xs text-[var(--ink-muted)]">{fact.label}</dt>
            <dd className={`text-sm font-semibold ${fact.tone}`}>{fact.value}</dd>
          </div>
        ))}
      </dl>
      {tile.state !== "ready" && (
        <Alert tone="warning">
          {fill(text.POOL_SHORT, {
            available: tile.available,
            missing: tile.required - tile.available,
          })}
        </Alert>
      )}
    </div>
  );
};
