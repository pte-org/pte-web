import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { ScoreTemplatePolicy } from "../../../../../features/scoretemplate/types";

vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { TemplateInfoPanel } from "../../../../../features/scoretemplate/components/TemplateInfoPanel";

const noop = (): void => undefined;

const render = (props: {
  name?: string;
  nameError?: string;
  policy?: ScoreTemplatePolicy;
}): string =>
  renderToStaticMarkup(
    createElement(
      LocaleProvider,
      null,
      createElement(TemplateInfoPanel, {
        name: props.name ?? "PTE 22 task type",
        nameError: props.nameError,
        onNameChange: noop,
        policy: props.policy ?? "STANDARD_PTE",
        onPolicyChange: noop,
      }) as ReactElement,
    ),
  );

describe("TemplateInfoPanel", () => {
  it("titles the box and shows the name field with its current value", () => {
    const html = render({});
    expect(html).toContain("Template information");
    expect(html).toContain('id="score-template-name"');
    expect(html).toContain('value="PTE 22 task type"');
  });

  it("shows the policy selector", () => {
    const html = render({});
    expect(html).toContain('id="score-template-policy"');
    expect(html).toContain("Template policy");
  });

  it("explains the custom policy only when it is selected", () => {
    expect(render({ policy: "CUSTOM" })).toContain("Custom templates may use selected task types");
    expect(render({ policy: "STANDARD_PTE" })).not.toContain("Custom templates may use");
  });

  it("surfaces a name validation error", () => {
    expect(render({ nameError: "Enter a template name." })).toContain("Enter a template name.");
  });
});
