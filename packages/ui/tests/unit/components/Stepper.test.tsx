import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Stepper } from "../../../src/components/Stepper";

const STEPS = [
  { id: "a", label: "First" },
  { id: "b", label: "Second" },
  { id: "c", label: "Third" },
];

describe("Stepper", () => {
  it("keeps numbers and plain cards by default", () => {
    const html = renderToStaticMarkup(<Stepper steps={STEPS} currentStep="c" />);
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
    expect(html).not.toContain("<button");
  });

  it("shows a tick for passed steps when asked and leaves the current and later ones numbered", () => {
    const html = renderToStaticMarkup(<Stepper steps={STEPS} currentStep="c" checkCompleted />);
    expect(html).not.toContain(">1<");
    expect(html).not.toContain(">2<");
    expect(html).toContain(">3<");
  });

  it("makes only passed steps clickable when a handler is given", () => {
    const html = renderToStaticMarkup(
      <Stepper steps={STEPS} currentStep="b" onStepSelect={() => undefined} />,
    );
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('aria-current="step"');
  });
});
