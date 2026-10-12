"use client";

import { useState, type ReactElement } from "react";
import { ExaminerQueueView } from "./ExaminerQueueView";
import { ExaminerAttemptDetailView } from "./ExaminerAttemptDetailView";

export const ExaminerWorkView = (): ReactElement => {
  const [selected, setSelected] = useState<{
    sessionPublicId: string;
    attemptPublicId: string;
  } | null>(null);

  if (selected) {
    return (
      <ExaminerAttemptDetailView
        sessionPublicId={selected.sessionPublicId}
        attemptPublicId={selected.attemptPublicId}
        onBack={() => setSelected(null)}
      />
    );
  }

  return <ExaminerQueueView />;
};
