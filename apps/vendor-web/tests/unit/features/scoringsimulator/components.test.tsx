import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { TraitScorePicker } from "../../../../features/scoringsimulator/components/_TraitScorePicker";
import { SimulationTrace } from "../../../../features/scoringsimulator/components/_SimulationTrace";
import { SIMULATOR_TEXT } from "../../../../features/scoringsimulator/constants";
import { rubric, trait } from "../scoringrubric/fixtures";

const content = trait("CONTENT", 6, false, { displayNameVi: "Nội dung", displayNameEn: "Content",
  levels: [{ level: 3, text: "A complete description that must remain readable without being truncated." }] });
const task = rubric("DESCRIBE_IMAGE", ["SPEAKING"], { traits: [content] });

it("shows discrete bands and the full selected description outside the control", () => {
  const html = renderToStaticMarkup(<LocaleProvider><TraitScorePicker trait={content} maximum={6} value={3}
    text={SIMULATOR_TEXT.vi} onChange={() => undefined} /></LocaleProvider>);
  expect(html.match(/aria-pressed=/g)).toHaveLength(7);
  expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
  expect(html).toContain(content.levels[0].text);
  expect(html).not.toContain('role="combobox"');
});
it("uses an exact number input for per-word content rather than dozens of options", () => {
  const html = renderToStaticMarkup(<LocaleProvider><TraitScorePicker trait={{ ...content, perWord: true }} maximum={60}
    text={SIMULATOR_TEXT.vi} onChange={() => undefined} /></LocaleProvider>);
  expect(html).toContain('type="number"'); expect(html).toContain('max="60"');
  expect(html).not.toContain('aria-pressed="true"');
});
it("shows the API item score, translates the gate and keeps calculation details in a popup that starts closed", () => {
  const html = renderToStaticMarkup(<LocaleProvider><SimulationTrace rubric={task} text={SIMULATOR_TEXT.vi} result={{
    rubricVersionPublicId: "v1", rawScore: 0, formBand: null,
    scoreTrace: { itemScore: 0, rawPercent: 32.123456, gateTriggeredBy: "CONTENT", contributions: [
      { key: "CONTENT", achieved: 0, max: 6, effectiveWeight: 6, weightedContribution: 0 },
    ] },
  }} /></LocaleProvider>);
  expect(html).toContain("0 / 100"); expect(html).toContain(SIMULATOR_TEXT.vi.gateReason);
  expect(html).toContain(SIMULATOR_TEXT.vi.details); expect(html).not.toContain('role="dialog"');
  expect(html).not.toContain("32.123456");
});

it("renders an arbitrary server result without deriving it from displayed inputs", () => {
  const html = renderToStaticMarkup(<LocaleProvider><SimulationTrace rubric={task} text={SIMULATOR_TEXT.vi} result={{
    rubricVersionPublicId: "v1", rawScore: 47, formBand: null,
    scoreTrace: { itemScore: 47, rawPercent: 46.666666, gateTriggeredBy: null, contributions: [] },
  }} /></LocaleProvider>);
  expect(html).toContain("47 / 100"); expect(html).toContain(SIMULATOR_TEXT.vi.score);
});
