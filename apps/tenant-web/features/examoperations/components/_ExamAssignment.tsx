"use client";

import type { ReactElement } from "react";
import { Button } from "@aptis/ui";
import { ROSTER_TEXT } from "./constants";
import type { ExamOption } from "../types";

interface ExamAssignmentProps {
  exams: ExamOption[];
  selectedExamId: string;
  onSelect: (id: string) => void;
  onDownload: () => void;
  canDownload: boolean;
}

export const ExamAssignment = ({
  exams,
  selectedExamId,
  onSelect,
  onDownload,
  canDownload,
}: ExamAssignmentProps): ReactElement => (
  <div className="flex flex-col gap-3">
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700">
        {ROSTER_TEXT.ASSIGN_LABEL}
      </span>
      <select
        value={selectedExamId}
        onChange={(event) => onSelect(event.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="">{ROSTER_TEXT.ASSIGN_PLACEHOLDER}</option>
        {exams.map((exam) => (
          <option key={exam.id} value={exam.id}>
            {exam.name}
          </option>
        ))}
      </select>
    </label>
    <Button
      type="button"
      variant="secondary"
      onClick={onDownload}
      disabled={!canDownload}
    >
      {ROSTER_TEXT.DOWNLOAD}
    </Button>
  </div>
);
