import { describe, expect, it } from "vitest";
import { sortByStatusRank } from "../../../../features/questionbank/questionOrder";
import type { Question, QuestionStatus } from "../../../../features/questionbank/types";

const question = (id: string, status: QuestionStatus): Question => ({
  id,
  skill: "speaking",
  taskType: "READ_ALOUD",
  content: id,
  status,
  pool: "exam",
});

describe("sortByStatusRank", () => {
  it("puts drafts first and archived questions last", () => {
    const sorted = sortByStatusRank([
      question("archived", "archived"),
      question("published", "published"),
      question("pending", "pending_approval"),
      question("draft", "draft"),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["draft", "pending", "published", "archived"]);
  });

  it("keeps the incoming order within the same status", () => {
    const sorted = sortByStatusRank([
      question("b", "published"),
      question("a", "published"),
      question("c", "draft"),
      question("d", "draft"),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["c", "d", "b", "a"]);
  });

  it("does not change the list it was given", () => {
    const input = [question("a", "archived"), question("b", "draft")];
    sortByStatusRank(input);
    expect(input.map((item) => item.id)).toEqual(["a", "b"]);
  });
});
