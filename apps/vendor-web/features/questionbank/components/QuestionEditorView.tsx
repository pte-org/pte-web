"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactElement } from "react";
import { Alert, Button, LoadingState, useDashboardBreadcrumbLabel, useLocale } from "@pte/ui";
import { GenerationDrawer } from "@/features/questiongeneration/components";
import { useGeneratedFill } from "@/features/questiongeneration/hooks/useGeneratedFill";
import { generationLiveHref } from "@/features/questiongeneration/liveConstants";
import { generationMessages as generationEn } from "@/features/questiongeneration/messages/en";
import { generationMessages as generationVi } from "@/features/questiongeneration/messages/vi";
import { useQuestion } from "../api";
import {
  QUESTION_EDITOR_ERRORS as RAW_QUESTION_EDITOR_ERRORS,
  QUESTION_EDITOR_TEXT as RAW_QUESTION_EDITOR_TEXT,
} from "../constants";
import { QuestionEditorWithPreview } from "./QuestionEditorWithPreview";
import { useAdminCopy } from "@/features/i18n/adminCopy";

export const NewQuestionView = (): ReactElement => {
  const T = useAdminCopy(RAW_QUESTION_EDITOR_TEXT);
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Back from the AI run's page: the question it wrote fills the form, nothing is saved until the person says so.
  const fill = useGeneratedFill(useSearchParams().get("fromJob"));
  useDashboardBreadcrumbLabel(pathname, T.NEW_TITLE);

  return (
    <div className="space-y-5">
      <QuestionEditorWithPreview
        onSaved={() => router.push("/admin/questions")}
        onCancel={() => router.push("/admin/questions")}
        agent={fill}
        sidePanel={
          <Button type="button" className="w-full" onClick={() => setDrawerOpen(true)}>
            ✦ {(locale === "vi" ? generationVi : generationEn).generateWithAi}
          </Button>
        }
      />
      <GenerationDrawer
        open={drawerOpen}
        single
        onClose={() => setDrawerOpen(false)}
        onJobCreated={(jobId) => {
          setDrawerOpen(false);
          // The run is followed on its own page; when it is done that page brings the question back to this form.
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
