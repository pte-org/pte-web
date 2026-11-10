import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { ExaminerAnswerDetailResponse } from "@pte/api-client";
import { DecisionPanel } from "../../../../features/examiner/components/DecisionPanel";
import { ExaminerTraitFields } from "../../../../features/examiner/components/ExaminerTraitFields";
const answer: ExaminerAnswerDetailResponse = {
  answerPublicId: "answer", taskType: "DESCRIBE_IMAGE", prompt: { orderIndex: 1, section: "SPEAKING", taskType: "DESCRIBE_IMAGE", title: "Prompt", promptText: "Image", audioPromptUrl: null, imagePromptUrl: null, minWordCount: null, maxWordCount: null, options: [] },
  response: { kind: "AUDIO", text: null, mediaUrl: "audio", options: [], gapValues: [], wordIndices: [] },
  status: "PENDING", myScore: null, submittedAt: null, decision: null, aiReference: null, ai: null, cohortStatus: null, reviewVersion: "rv", canFinalize: true, blockingReason: null,
  rubric: { rubricVersionPublicId: "v1", taskType: "DESCRIBE_IMAGE", mechanicalScores: {}, traits: [
    { key: "CONTENT", displayNameVi: "Nội dung", displayNameEn: "Content", maxScore: 6, source: "AI_LLM", editable: true, useAiWhenNull: false, levels: [{ level: 0, text: "No content" }] },
    { key: "PRONUNCIATION", displayNameVi: "Phát âm", displayNameEn: "Pronunciation", maxScore: 5, source: "AZURE", editable: false, useAiWhenNull: true, levels: [] },
  ] },
};
it("displays the server item score and gate without deriving a total from the traits", () => {
  const html = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={answer} values={{ CONTENT: 4 }} itemScore={17}
    trace={{ itemScore: 17, rawPercent: 17, gateTriggeredBy: "CONTENT", contributions: [] }} disabled={false} /></LocaleProvider>);
  expect(html).toContain("17"); expect(html).toContain("CONTENT");
  expect(html).not.toContain('type="number"');
  expect(html).not.toContain('id="trait-PRONUNCIATION"');
});
it("disables saving when human traits or same-version Azure data are missing", () => {
  const html = renderToStaticMarkup(<LocaleProvider><DecisionPanel answer={answer} draftScore="" onScoreChange={() => undefined}
    traitScores={{}} onSaveDraft={() => undefined} isStale={false} /></LocaleProvider>);
  expect(html).toMatch(/<button[^>]*disabled=""/);
  expect(html).not.toContain('id="examiner-score-input"');
});
it("enables a complete human trait set only with matching machine data", () => {
  const available = { ...answer, aiReference: { availability: "AVAILABLE" as const, score: 70, version: "ai", rubricVersionPublicId: "v1", traitScores: { CONTENT: 4, PRONUNCIATION: 3 } } };
  const html = renderToStaticMarkup(<LocaleProvider><DecisionPanel answer={available} draftScore="" onScoreChange={() => undefined}
    traitScores={{ CONTENT: 4 }} onSaveDraft={() => undefined} isStale={false} /></LocaleProvider>);
  expect(html).not.toMatch(/<button[^>]*disabled=""/);
});
it("explains why saving is blocked when the same-version machine traits are missing", () => {
  const html = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={answer} values={{ CONTENT: 4 }}
    disabled={true} /></LocaleProvider>);
  expect(html).toMatch(/pronunciation and fluency|phát âm và độ trôi chảy/);
});
const withAi = { ...answer, aiReference: { availability: "AVAILABLE" as const, score: 60, version: "ai", rubricVersionPublicId: "v1", traitScores: { CONTENT: 5, PRONUNCIATION: 3 } } };
it("lists every band of an editable trait with its description instead of a dropdown", () => {
  const html = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={answer} values={{}} disabled={false} /></LocaleProvider>);
  expect(html).not.toContain("<select");
  for (let band = 0; band <= 6; band++) expect(html).toContain(`id="trait-CONTENT-${band}"`);
  expect(html).toContain("No content");
});
it("marks the AI band only after the AI is revealed", () => {
  const blind = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={withAi} values={{ CONTENT: 2 }} disabled={false} /></LocaleProvider>);
  expect(blind).not.toContain("border-l-violet-500");
  const open = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={withAi} values={{ CONTENT: 2 }} disabled={false} aiRevealed /></LocaleProvider>);
  expect(open).toContain("border-l-violet-500");
  expect(open).toMatch(/2 or more away|lệch AI từ 2 mức/);
});
it("asks for no reason when the examiner is within one band of the AI", () => {
  const html = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={withAi} values={{ CONTENT: 4 }} disabled={false} aiRevealed /></LocaleProvider>);
  expect(html).not.toMatch(/2 or more away|lệch AI từ 2 mức/);
});
it("shows the AI reason and quote under its trait once revealed, and a reason box for a large gap", () => {
  const scored = { ...withAi, ai: { status: "SCORED" as const, score: 60, criteria: {}, feedback: null, transcript: null, fallback: false, failureReason: null,
    detail: { traitRationales: { CONTENT: { reason: "Matches level 5", evidence: "rising temperatures" } } } } };
  const blind = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={scored} values={{ CONTENT: 2 }} disabled={false} /></LocaleProvider>);
  expect(blind).not.toContain("Matches level 5");
  const open = renderToStaticMarkup(<LocaleProvider><ExaminerTraitFields answer={scored} values={{ CONTENT: 2 }} disabled={false} aiRevealed
    gapReasons={{ CONTENT: "Off topic" }} /></LocaleProvider>);
  expect(open).toContain("Matches level 5"); expect(open).toContain("rising temperatures");
  expect(open).toContain('id="gap-reason-CONTENT"'); expect(open).toContain("Off topic");
});
