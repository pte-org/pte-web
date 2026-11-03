import { createElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { ScoreTemplateResponse } from "@pte/api-client";

vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));
// The real modal renders through a portal; render its content inline so the test can read it.
vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  Modal: ({
    title,
    children,
    footer,
  }: {
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
  }) => createElement("div", null, createElement("h2", null, title), children, footer),
}));

import { TemplateInfoDialog } from "../../../../../features/scoretemplate/components/TemplateInfoDialog";

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

const render = (props: { template?: ScoreTemplateResponse; nameError?: string }): string =>
  renderToStaticMarkup(
    createElement(
      LocaleProvider,
      null,
      createElement(TemplateInfoDialog, {
        open: true,
        onClose: noop,
        template: props.template ?? template,
        name: "PTE 22 task type",
        nameError: props.nameError,
        onNameChange: noop,
      }) as ReactElement,
    ),
  );

describe("TemplateInfoDialog", () => {
  it("titles the dialog and shows the editable name", () => {
    const html = render({});
    expect(html).toContain("Template information");
    expect(html).toContain('id="score-template-name"');
    expect(html).toContain('value="PTE 22 task type"');
  });

  it("lists who made the template, when, and its version (not its code or policy)", () => {
    const html = render({});
    expect(html).toContain("Nguyen Van A");
    expect(html).toContain("Created by");
    expect(html).not.toContain("PTE-22");
    expect(html).toContain("v3");
    expect(html).not.toContain("Standard PTE");
    expect(html).toContain("2026");
  });

  it("says Unknown when the author cannot be resolved", () => {
    expect(render({ template: { ...template, authorName: null } })).toContain("Unknown");
  });

  it("surfaces a name validation error", () => {
    expect(render({ nameError: "Enter a template name." })).toContain("Enter a template name.");
  });
});
