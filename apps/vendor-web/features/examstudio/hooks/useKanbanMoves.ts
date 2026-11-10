"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  useApproveQuestion,
  useArchiveQuestion,
  useSubmitQuestionApproval,
} from "@/features/questionbank/api";
import type { Question } from "@/features/questionbank/types";
import { SCORE_TEMPLATE_QUERY_KEY } from "@/features/scoretemplate/constants";
import { EXAM_STUDIO_TEXT } from "../constants";
import { actionFor, needsReviewerRole, type KanbanColumn } from "../kanbanTransitions";

interface KanbanMoves {
  move: (question: Question, target: KanbanColumn) => void;
  isMoving: boolean;
}

/** Moving a card is one API call; the board refreshes from the question list, the coverage from here. */
export function useKanbanMoves(templatePublicId: string): KanbanMoves {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const submit = useSubmitQuestionApproval();
  const approve = useApproveQuestion();
  const archive = useArchiveQuestion();
  const isMoving = submit.isPending || approve.isPending || archive.isPending;

  const move: KanbanMoves["move"] = (question, target) => {
    const action = actionFor(question, target);
    if (action === null) {
      if (target !== "draft") showToast(text.MOVE_NOT_ALLOWED, { tone: "error" });
      return;
    }
    if (needsReviewerRole(action) && !canReviewAcademic(currentUser?.roles)) {
      showToast(text.MOVE_NEEDS_REVIEWER, { tone: "error" });
      return;
    }
    const mutation = { submit, approve, archive }[action];
    mutation.mutate(question.id, {
      onSuccess: () => {
        showToast(text.MOVE_DONE, { tone: "success" });
        // Approving or archiving changes how many questions a template can draw.
        void queryClient.invalidateQueries({
          queryKey: [...SCORE_TEMPLATE_QUERY_KEY, templatePublicId, "feasibility"],
        });
      },
      onError: () => showToast(text.ACTION_ERROR, { tone: "error" }),
    });
  };

  return { move, isMoving };
}
