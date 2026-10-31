import { createElement, type TextareaHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pte/ui", () => ({
  Textarea: ({
    label,
    helperText,
    error,
    ...props
  }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    helperText: string;
    error?: string;
  }) => createElement("label", null, label, createElement("textarea", props), helperText, error),
}));
vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { QuestionTypeInstructionField } from "../../../../../features/questiontemplate/components/_QuestionTypeInstructionField";

const render = (value: string): string =>
  renderToStaticMarkup(createElement(QuestionTypeInstructionField, { value, onChange: () => {} }));

describe("task type instruction field", () => {
  it("is an enabled, required textarea limited to 500 characters with a counter", () => {
    const html = render("Listen and answer.");

    expect(html).toContain("Student instruction");
    expect(html).toContain('maxLength="500"');
    expect(html).toContain("required");
    expect(html).not.toContain("disabled");
    expect(html).toContain("18/500");
  });

  it("flags whitespace-only input but not an untouched empty field", () => {
    expect(render("   ")).toContain("Enter the instruction students will see.");
    expect(render("")).not.toContain("Enter the instruction students will see.");
  });
});
