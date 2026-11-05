import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { ActivationAcknowledgement } from "../../../../features/scoringrubric/components/_ActivationAcknowledgement";
import { TraitWeightEditor } from "../../../../features/scoringrubric/components/_TraitWeightEditor";
import { VersionDiffPanel } from "../../../../features/scoringrubric/components/_VersionDiffPanel";
import { RUBRIC_EDIT_TEXT } from "../../../../features/scoringrubric/versionConstants";
import { rubric, trait } from "./fixtures";

const diff = { expectedActiveVersionPublicId: "active", diffDigest: "digest", changes: [
  { path: "taskTypes.DESCRIBE_IMAGE.traitWeights.CONTENT", beforeValue: "6", afterValue: "4" },
] };
it("requires acknowledgement before enabling activation", () => {
  const html = renderToStaticMarkup(<LocaleProvider><ActivationAcknowledgement diff={diff} pending={false} text={RUBRIC_EDIT_TEXT.vi} onConfirm={() => undefined} /></LocaleProvider>);
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.confirm);
  expect(html).toMatch(/<button[^>]*disabled=""/);
  expect(html).toContain(diff.changes[0].path);
});
it("shows server diff values", () => {
  const html = renderToStaticMarkup(<VersionDiffPanel diff={diff} text={RUBRIC_EDIT_TEXT.vi} />);
  expect(html).toContain(">6<"); expect(html).toContain(">4<");
});
it("shows the API default weight and the RA dynamic-scale notice", () => {
  const ra = rubric("READ_ALOUD", ["SPEAKING"], { traits: [trait("CONTENT", null, true, { defaultWeight: 1, weight: 2 })] });
  const html = renderToStaticMarkup(<LocaleProvider><TraitWeightEditor rubric={ra} value={{ traitWeights: { CONTENT: 2 },
    traitScales: { CONTENT: "PER_WORD" }, formBands: null, gateEnabled: {} }} disabled text={RUBRIC_EDIT_TEXT.vi} onChange={() => undefined} /></LocaleProvider>);
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.perWord);
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.defaultWeight);
  expect(html).toMatch(/disabled=""/);
});
