"use client";

import { useState, type ReactElement } from "react";
import {
  Alert,
  Button,
  Chip,
  Modal,
  StatCard,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
  useLocale,
} from "@pte/ui";
import type { RubricSimulationResponse, TaskTypeRubricResponse } from "@pte/api-client";
import { sectionTone } from "../../../lib/chipTones";
import type { SimulatorText } from "../types";

interface SimulationTraceProps {
  result: RubricSimulationResponse;
  rubric: TaskTypeRubricResponse;
  text: SimulatorText;
}

export const SimulationTrace = ({ result, rubric, text: T }: SimulationTraceProps): ReactElement => {
  const { locale } = useLocale();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const traitLabel = (key: string): string => {
    const trait = rubric.traits.find((entry) => entry.key === key);
    return (locale === "vi" ? trait?.displayNameVi : trait?.displayNameEn) ?? key;
  };

  const skillNames: Record<string, string> = {
    SPEAKING: locale === "vi" ? "Nói" : "Speaking",
    WRITING: locale === "vi" ? "Viết" : "Writing",
    READING: locale === "vi" ? "Đọc" : "Reading",
    LISTENING: locale === "vi" ? "Nghe" : "Listening",
  };

  const gate = result.scoreTrace.gateTriggeredBy;
  const hasGateConfig = rubric.gates && rubric.gates.some((g) => g.enabled);

  return (
    <div className="space-y-4" aria-live="polite">
      <StatCard label={T.score} value={`${result.rawScore} ${T.scale}`} footnote={T.scoreHint} />

      {/* Contributing skills badges */}
      {rubric.skills && rubric.skills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-[var(--ink-secondary)]">
            {locale === "vi" ? "Tính vào kỹ năng:" : "Contributing skills:"}
          </span>
          {rubric.skills.map((skill) => (
            <Chip key={skill} tone={sectionTone(skill)} size="sm">
              {skillNames[skill.toUpperCase()] ?? skill}
            </Chip>
          ))}
        </div>
      )}

      {/* Gate status */}
      {gate ? (
        <Alert tone="warning">
          {traitLabel(gate)}: {T.gateReason}
        </Alert>
      ) : hasGateConfig ? (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-xs text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <span className="font-semibold">✓</span>
          <span>{locale === "vi" ? "Điều kiện chặn: Hợp lệ (không bị 0 điểm)" : "Gate condition satisfied"}</span>
        </div>
      ) : null}

      {/* Live Trait Breakdown Table */}
      {result.scoreTrace.contributions && result.scoreTrace.contributions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--ink-secondary)]">
            <span className="font-semibold uppercase tracking-wider text-[var(--ink-primary)]">
              {locale === "vi" ? "Phân rã điểm tiêu chí" : T.details}
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)]">
            <TableRoot>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{T.trait}</TableHead>
                  <TableHead className="text-center text-xs">{T.achieved}</TableHead>
                  <TableHead className="text-center text-xs">{T.weight}</TableHead>
                  <TableHead className="text-right text-xs">{T.contribution}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.scoreTrace.contributions.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="text-xs font-medium text-[var(--ink-primary)]">
                      {traitLabel(row.key)}
                    </TableCell>
                    <TableCell className="text-center text-xs tabular-nums text-[var(--ink-secondary)]">
                      {row.achieved} / {row.max}
                    </TableCell>
                    <TableCell className="text-center text-xs tabular-nums text-[var(--ink-secondary)]">
                      {row.effectiveWeight}
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium tabular-nums text-[var(--ink-primary)]">
                      {row.weightedContribution ?? T.noValue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        </div>
      )}

      {result.formBand !== null && (
        <p className="text-xs text-[var(--ink-secondary)]">
          {T.form}: {result.formBand}
        </p>
      )}

      <Button variant="ghost" size="sm" fullWidth onClick={() => setDetailsOpen(true)}>
        {T.details}
      </Button>

      <Modal
        open={detailsOpen}
        title={T.details}
        size="xl"
        closeOnBackdropClick
        onClose={() => setDetailsOpen(false)}
        footer={
          <Button variant="ghost" onClick={() => setDetailsOpen(false)}>
            {T.close}
          </Button>
        }
      >
        <div className="space-y-3 overflow-x-auto">
          <p className="text-sm text-[var(--ink-secondary)]">
            {T.raw}: {result.scoreTrace.rawPercent}
          </p>
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableHead>{T.trait}</TableHead>
                <TableHead>{T.achieved}</TableHead>
                <TableHead>{T.weight}</TableHead>
                <TableHead>{T.contribution}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.scoreTrace.contributions.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{traitLabel(row.key)}</TableCell>
                  <TableCell>
                    {row.achieved} / {row.max}
                  </TableCell>
                  <TableCell>{row.effectiveWeight}</TableCell>
                  <TableCell>{row.weightedContribution ?? T.noValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        </div>
      </Modal>
    </div>
  );
};
