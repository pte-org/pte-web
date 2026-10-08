"use client";

import type { ReactElement } from "react";
import { ExamPreviewSurface } from "./ExamPreviewSurface";
import type { ExamSession } from "../types";

interface ExamQuestionsTabProps {
  session: ExamSession;
  sessionPublicId: string;
}

export const ExamQuestionsTab = ({
  session,
  sessionPublicId,
}: ExamQuestionsTabProps): ReactElement => (
  <div className="min-w-0">
    <ExamPreviewSurface
      sessionPublicId={sessionPublicId}
      snapshotPublicId={session.snapshotPublicId}
      enabled={Boolean(session.snapshotPublicId)}
    />
  </div>
);
