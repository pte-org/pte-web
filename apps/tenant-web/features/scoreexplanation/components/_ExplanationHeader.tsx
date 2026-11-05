"use client";

import type { ReactElement } from "react";
import { Alert, Badge, DescriptionList, type DescriptionItem } from "@pte/ui";
import { NO_VALUE } from "../constants";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { ScoreExplanationResponse } from "../types";

interface ExplanationHeaderProps {
  explanation: ScoreExplanationResponse;
}

const formatDate = (value: string, locale: "vi" | "en"): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

/** Template, pinned rubric version and publication state of the explained attempt. */
export const ExplanationHeader = ({ explanation }: ExplanationHeaderProps): ReactElement => {
  const { locale, messages: M, format } = useScoreExplanationText();

  const items: DescriptionItem[] = [
    {
      label: M.examTemplate,
      value: explanation.examDefinitionPublicId
        ? format("examTemplateValue", {
            id: explanation.examDefinitionPublicId,
            version: explanation.examDefinitionVersion ?? NO_VALUE,
          })
        : NO_VALUE,
    },
    { label: M.rubricVersion, value: explanation.rubricVersionPublicId ?? NO_VALUE },
    {
      label: M.snapshotSchema,
      value:
        explanation.schemaVersion === null
          ? M.liveRecompute
          : format("snapshotSchemaValue", { version: explanation.schemaVersion }),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold text-[var(--ink-primary)]">{M.title}</h1>
        <Badge variant={explanation.published ? "success" : "warning"}>
          {explanation.published ? M.statusPublished : M.statusProvisional}
        </Badge>
        {explanation.published && explanation.publishedAt && (
          <span className="text-xs text-[var(--ink-secondary)]">
            {format("publishedAt", { date: formatDate(explanation.publishedAt, locale) })}
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--ink-secondary)]">{M.subtitle}</p>
      <DescriptionList items={items} variant="inline" />
      {!explanation.published && <Alert tone="info">{M.provisionalNote}</Alert>}
      {explanation.includesUnselectedAiScores && <Alert tone="warning">{M.unselectedAiNote}</Alert>}
    </div>
  );
};
