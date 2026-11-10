import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { ScoreTemplateResponse } from "@pte/api-client";

vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { TemplateInfoPanel } from "../../../../../features/scoretemplate/components/TemplateInfoPanel";

const noop = (): void => undefined;

const template: ScoreTemplateResponse = {
  publicId: "t1",
  code: "PTE-22",
  version: 3,
  name: "PTE 22 task type",
  status: "DRAFT",
  rejectionReason: null,
  items: [],
  templatePolicy: "STANDARD_PTE",
  createdAt: "2026-11-01T03:00:00Z",
  updatedAt: "2026-11-03T07:05:00Z",
  authorName: "Nguyen Van A",
};

const render = (props: {
  template?: ScoreTemplateResponse;
  defaultOpen?: boolean;
  editable?: boolean;
  nameError?: string;
}): string =>
  renderToStaticMarkup(
    createElement(
      LocaleProvider,
      null,
      createElement(TemplateInfoPanel, {
        template: props.template ?? template,
        defaultOpen: props.defaultOpen ?? false,
        name: props.editable ? "PTE 22 task type" : undefined,
        nameError: props.nameError,
        onNameChange: props.editable ? noop : undefined,
      }) as ReactElement,
    ),
  );

describe("TemplateInfoPanel", () => {
  it("is a disclosure that starts open on a locked template and closed on a draft", () => {
    expect(render({ defaultOpen: true })).toMatch(/<details[^>]* open/);
    expect(render({ defaultOpen: false })).not.toMatch(/<details[^>]* open/);
  });

  it("opens a draft whose name is invalid, so the error is seen", () => {
    const html = render({ editable: true, nameError: "Enter a template name." });
    expect(html).toMatch(/<details[^>]* open/);
    expect(html).toContain("Enter a template name.");
  });

  it("shows an editable name on a draft and plain text on a locked template", () => {
    expect(render({ editable: true })).toContain('id="score-template-name"');
    const locked = render({ defaultOpen: true });
    expect(locked).not.toContain('id="score-template-name"');
    expect(locked).toContain("PTE 22 task type");
  });

  it("lists who made the template, when, its version and its status", () => {
    const html = render({ defaultOpen: true });
    expect(html).toContain("Created by");
    expect(html).toContain("Nguyen Van A");
    expect(html).toContain("v3");
    expect(html).toContain("Draft");
    expect(html).toContain("2026");
  });

  it("says Unknown when the author cannot be resolved", () => {
    expect(render({ template: { ...template, authorName: null } })).toContain("Unknown");
  });
});
