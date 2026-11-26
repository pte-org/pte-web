import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "@pte/ui";

vi.mock("../../../../features/exams/components/create-exam/AudienceStudentPicker", () => ({
  AudienceStudentPicker: () => null,
}));
vi.mock("../../../../features/exams/components/create-exam/ProctorPicker", () => ({
  ProctorPicker: () => null,
}));

import { AudienceStep } from "../../../../features/exams/components/create-exam/AudienceStep";
import { CREATE_EXAM_WIZARD_ERRORS, CREATE_EXAM_WIZARD_TEXT } from "../../../../features/exams/constants";

const OVER_STYLE = "font-semibold text-[var(--blush-action)]";

const render = (selected: number, capacity: number, error?: string): string => {
  // The pickers are mocked, so only the props the step itself reads matter here.
  const props = {
    selectedIds: new Set(Array.from({ length: selected }, (_, index) => String(index))),
    errors: { sources: error },
    capacity,
    wizardText: CREATE_EXAM_WIZARD_TEXT,
    clearSelection: () => undefined,
    localizeError: (message?: string) => message,
    proctorPickerProps: { selection: [] },
  } as unknown as Parameters<typeof AudienceStep>[0];
  return renderToStaticMarkup(
    <LocaleProvider>
      <AudienceStep {...props} />
    </LocaleProvider>,
  );
};

describe("AudienceStep capacity error", () => {
  it("explains how far over capacity the selection is and how to fix it", () => {
    const html = render(5, 3, CREATE_EXAM_WIZARD_ERRORS.AUDIENCE_EXCEEDS_CAPACITY);
    expect(html).toContain('role="alert"');
    expect(html).toContain("The selected students exceed this exam");
    expect(html).toContain("You selected 5 students but this exam takes at most 3. Deselect 2");
  });

  it("marks the selected count when it is over the limit and stays quiet otherwise", () => {
    expect(render(5, 3)).toContain(OVER_STYLE);
    expect(render(2, 3)).not.toContain(OVER_STYLE);
    expect(render(2, 3)).not.toContain('role="alert"');
  });
});
