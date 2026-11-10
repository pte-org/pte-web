import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { ActivationAcknowledgement } from "../../../../features/scoringrubric/components/_ActivationAcknowledgement";
import { TraitWeightEditor } from "../../../../features/scoringrubric/components/_TraitWeightEditor";
import { VersionDiffPanel } from "../../../../features/scoringrubric/components/_VersionDiffPanel";
import { RUBRIC_EDIT_TEXT } from "../../../../features/scoringrubric/versionConstants";
import { rubric, trait } from "./fixtures";

const hoisted = vi.hoisted(() => ({ samples: [] as { before: number | null; after: number | null; failed: boolean; pending: boolean }[] }));
vi.mock("../../../../features/scoringrubric/versionApi", () => ({ useImpactSamples: () => hoisted.samples }));

const diff = { expectedActiveVersionPublicId: "active", diffDigest: "digest", changes: [
  { path: "taskTypes.DESCRIBE_IMAGE.traitWeights.CONTENT", beforeValue: "6", afterValue: "4" },
] };
const image = rubric("DESCRIBE_IMAGE", ["SPEAKING"], { traits: [trait("CONTENT", 6, false, { displayNameVi: "Nội dung", displayNameEn: "Content" })] });
const names = new Map([["DESCRIBE_IMAGE.CONTENT", "Nội dung"]]);
const acknowledgement = (): string => renderToStaticMarkup(<LocaleProvider><ActivationAcknowledgement versionId="draft" diff={diff}
  activeRubrics={[image]} pending={false} text={RUBRIC_EDIT_TEXT.vi} onConfirm={() => undefined} /></LocaleProvider>);

it("requires acknowledgement before enabling activation and says who the version applies to", () => {
  hoisted.samples = [{ before: 60, after: 62, failed: false, pending: false }, { before: 40, after: 41, failed: false, pending: false }];
  const html = acknowledgement();
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.confirm);
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.scopeWarning);
  expect(html).toMatch(/<button[^>]*disabled=""/);
  expect(html).not.toContain(RUBRIC_EDIT_TEXT.vi.reasonLabel);
});
it("shows the change in words, not as a parameter path", () => {
  hoisted.samples = [];
  const html = acknowledgement();
  expect(html).toContain("Nội dung · trọng số");
  expect(html).not.toContain(diff.changes[0].path);
});
it("asks for a reason when a sample score moves by ten points or more", () => {
  hoisted.samples = [{ before: 50, after: 64, failed: false, pending: false }];
  const html = acknowledgement();
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.reasonLabel);
  expect(html).toContain("14 điểm");
});
it("asks for a reason too when the sample scores could not be calculated", () => {
  hoisted.samples = [{ before: null, after: null, failed: true, pending: false }];
  const html = acknowledgement();
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.reasonLabel);
  expect(html).toContain(RUBRIC_EDIT_TEXT.vi.impactError);
});
it("shows server diff values", () => {
  const html = renderToStaticMarkup(<VersionDiffPanel diff={diff} traitNames={names} text={RUBRIC_EDIT_TEXT.vi} />);
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
