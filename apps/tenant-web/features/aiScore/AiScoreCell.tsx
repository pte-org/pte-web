import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { AI_SCORE_TEXT } from "./constants";

interface AiScoreCellProps {
  /** The score already formatted by the table that renders it. */
  score: string;
  fallback: boolean;
}

/** An AI score in a table cell, marked as low confidence when the AI used a degraded path. */
export const AiScoreCell = ({ score, fallback }: AiScoreCellProps): ReactElement => (
  <span className="inline-flex flex-wrap items-center gap-2">
    {score}
    {fallback && <Badge variant="warning">{AI_SCORE_TEXT.LOW_CONFIDENCE}</Badge>}
  </span>
);
