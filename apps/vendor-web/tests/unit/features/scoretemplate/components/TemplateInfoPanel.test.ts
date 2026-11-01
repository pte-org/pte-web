import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";

vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { TemplateInfoPanel } from "../../../../../features/scoretemplate/components/TemplateInfoPanel";

const noop = (): void => undefined;

const render = (props: {
  name?: string;
  nameError?: string;
}): string =>
  renderToStaticMarkup(
    createElement(
      LocaleProvider,
      null,
      createElement(TemplateInfoPanel, {
        name: props.name ?? "PTE 22 task type",
        nameError: props.nameError,
        onNameChange: noop,
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

  it("has no template policy choice: admin templates are always standard PTE", () => {
    const html = render({});
    expect(html).not.toContain("score-template-policy");
    expect(html).not.toContain("Template policy");
    expect(html).not.toContain("Custom task set");
  });

  it("surfaces a name validation error", () => {
    expect(render({ nameError: "Enter a template name." })).toContain("Enter a template name.");
  });
});
