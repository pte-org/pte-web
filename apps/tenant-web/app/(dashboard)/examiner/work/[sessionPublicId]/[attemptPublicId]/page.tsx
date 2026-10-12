"use client";

import type { ReactElement } from "react";
import { use } from "react";
import { ExaminerAttemptDetailView } from "@/features/examiner/ExaminerAttemptDetailView";

interface PageProps {
  params: Promise<{ sessionPublicId: string; attemptPublicId: string }>;
}

export default function ExaminerAttemptDetailPage({ params }: PageProps): ReactElement {
  const { sessionPublicId, attemptPublicId } = use(params);
  return (
    <ExaminerAttemptDetailView
      sessionPublicId={sessionPublicId}
      attemptPublicId={attemptPublicId}
    />
  );
}
