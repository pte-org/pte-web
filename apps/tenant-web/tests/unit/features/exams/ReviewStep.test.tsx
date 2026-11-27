import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@pte/ui";
import { ReviewStep, type ReviewStepProps } from "../../../../features/exams/components/create-exam/ReviewStep";
import { CREATE_EXAM_WIZARD_TEXT } from "../../../../features/exams/constants";
import { createEmptyExamWorkflow } from "../../../../features/exams/utils/createExamWizard";

const baseProps = (overrides: Partial<ReviewStepProps> = {}): ReviewStepProps => ({
  form: {
    ...createEmptyExamWorkflow("template-1"),
    name: "Thi thử tháng 11",
    opensAt: "2026-11-26T09:00",
    closesAt: "2026-11-26T15:00",
    capacity: "2",
  },
  wizardText: CREATE_EXAM_WIZARD_TEXT,
  localizedSkillOptions: [
    { value: "SPEAKING", label: "Speaking" },
    { value: "WRITING", label: "Writing" },
  ],
  templateSkills: ["SPEAKING", "WRITING"],
  audienceCount: 2,
  proctorCount: 0,
  onEditStep: () => undefined,
  ...overrides,
});

// The copy comes in through `wizardText`, so these checks read the English defaults.
const render = (props: ReviewStepProps): string =>
  renderToStaticMarkup(
    <LocaleProvider>
      <ReviewStep {...props} />
    </LocaleProvider>,
  );

describe("ReviewStep", () => {
  it("shows the exam name, the open window with its length, and the students against the limit", () => {
    const html = render(baseProps());
    expect(html).toContain("Thi thử tháng 11");
    expect(html).toContain("26/11/2026 · 09:00 → 15:00 (6 h)");
    expect(html).toContain("2 of 2 max");
  });

  it("has one Edit link per step block and warns when no proctor is assigned", () => {
    const html = render(baseProps());
    expect(html.match(/>Edit</g)).toHaveLength(3);
    expect(html).toContain("No proctor assigned");
    expect(render(baseProps({ proctorCount: 2 }))).not.toContain("No proctor assigned");
  });

  it("colours each skill like the other screens, Listening in the red tone", () => {
    const html = render(
      baseProps({
        localizedSkillOptions: [
          { value: "SPEAKING", label: "Speaking" },
          { value: "LISTENING", label: "Listening" },
        ],
        templateSkills: ["SPEAKING", "LISTENING"],
      }),
    );
    expect(html).toMatch(/--sky-tint[^>]*>Speaking</);
    expect(html).toMatch(/--blush-tint[^>]*>Listening</);
  });
});
