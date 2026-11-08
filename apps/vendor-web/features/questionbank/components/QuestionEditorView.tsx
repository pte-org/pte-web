"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { Alert, Button, LoadingState, useDashboardBreadcrumbLabel } from "@pte/ui";
import { GenerationDrawer } from "@/features/questiongeneration/components";
import { generationLiveHref } from "@/features/questiongeneration/liveConstants";
import { generationMessages } from "@/features/questiongeneration/messages/en";
import { useQuestion } from "../api";
import {
  QUESTION_EDITOR_ERRORS as RAW_QUESTION_EDITOR_ERRORS,
  QUESTION_EDITOR_TEXT as RAW_QUESTION_EDITOR_TEXT,
} from "../constants";
import { QuestionEditorWithPreview } from "./QuestionEditorWithPreview";
import { useAdminCopy } from "@/features/i18n/adminCopy";

export const NewQuestionView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  useDashboardBreadcrumbLabel(pathname, T.NEW_TITLE);
  return (
    <div className="space-y-5">
      <QuestionEditorWithPreview
        onSaved={() => router.push("/admin/questions")}
        onCancel={() => router.push("/admin/questions")}
        sidePanel={
          <Button type="button" className="w-full" onClick={() => setDrawerOpen(true)}>
            ✦ {generationMessages.generatingTitle}
          </Button>
        }
      />
      <GenerationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onJobCreated={(jobId) => {
          setDrawerOpen(false);
          // The run is followed on its own page, where each agent's work shows as it is written.
          router.push(generationLiveHref(jobId));
        }}
      />
    </div>
  );
};

export const EditQuestionView = ({ publicId }: { publicId: string }): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const E = useAdminCopy(RAW_QUESTION_EDITOR_ERRORS);
  const router = useRouter();
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, T.EDIT_TITLE);
  const { data: question, isLoading, isError } = useQuestion(publicId);

  if (isLoading) return <LoadingState rows={8} />;
  if (isError || !question) return <Alert tone="error">{E.LOAD_QUESTION}</Alert>;
  if (question.status === "PENDING_APPROVAL")
    return <Alert tone="warning">{E.PENDING_APPROVAL}</Alert>;
  if (question.status === "ARCHIVED") return <Alert tone="warning">{E.ARCHIVED}</Alert>;
  return (
    <div className="space-y-5">
      <QuestionEditorWithPreview
        question={question}
        saveAsRevision={question.status === "APPROVED"}
        // Back to where the writer came from: the question's detail (a published question's edits
        // are saved into a new revision, so that is the page to land on).
        onSaved={(saved) => router.push(`/admin/questions/${saved.publicId}`)}
        onCancel={() => router.push(`/admin/questions/${question.publicId}`)}
      />
    </div>
  );
};
