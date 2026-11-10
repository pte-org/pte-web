import type { Question, QuestionStatus } from "./types";

/** Work that still needs attention comes first, finished work next, archived questions last. */
const STATUS_RANK: Record<QuestionStatus, number> = {
  draft: 0,
  pending_approval: 1,
  published: 2,
  archived: 3,
};

/** The bank's default order: drafts on top, archived at the bottom; the API's order is kept within a status. */
export const sortByStatusRank = (questions: Question[]): Question[] =>
  questions.slice().sort((left, right) => STATUS_RANK[left.status] - STATUS_RANK[right.status]);
