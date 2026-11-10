"use client";

import type { ReactElement } from "react";
import { Badge, TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { uncalibratedLabel } from "../rubricView";
import type { AzureBandThresholdResponse, AzureMappingResponse } from "../types";
import { RubricSection } from "./_RubricSection";

interface AzureBandMappingProps {
  mapping: AzureMappingResponse;
}

interface ThresholdTableProps {
  title: string;
  inputRule: string | null;
  thresholds: AzureBandThresholdResponse[];
}

const ThresholdTable = ({ title, inputRule, thresholds }: ThresholdTableProps): ReactElement => {
  const { messages: M } = useScoringRubricText();
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
      {inputRule && <p className="text-xs text-[var(--ink-secondary)]">{inputRule}</p>}
      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>{M.azureBand}</TableHead>
            <TableHead>{M.azureMinScore}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {thresholds.map((threshold) => (
            <TableRow key={threshold.band}>
              <TableCell>{threshold.band}</TableCell>
              <TableCell>{threshold.minAzureScore}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </div>
  );
};

/**
 * Azure 0-100 scores to Pearson 0-5 bands. While the table is uncalibrated its label is always shown next to the
 * title; the label text comes from the API.
 */
export const AzureBandMapping = ({ mapping }: AzureBandMappingProps): ReactElement => {
  const { messages: M, format } = useScoringRubricText();
  const notice = uncalibratedLabel(mapping, M.azureUncalibrated);
  const hasThresholds =
    mapping.pronunciationBands.length > 0 || mapping.oralFluencyBands.length > 0;

  return (
    <RubricSection
      title={M.azureTitle}
      hint={format("azureVersion", { version: mapping.version })}
      badge={notice && <Badge variant="warning">{notice}</Badge>}
    >
      {hasThresholds ? (
        <div className="grid gap-4 md:grid-cols-2">
          <ThresholdTable
            title={M.azurePronunciation}
            inputRule={mapping.pronunciationInput}
            thresholds={mapping.pronunciationBands}
          />
          <ThresholdTable
            title={M.azureOralFluency}
            inputRule={mapping.oralFluencyInput}
            thresholds={mapping.oralFluencyBands}
          />
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-secondary)]">{M.azureNoThresholds}</p>
      )}
    </RubricSection>
  );
};
