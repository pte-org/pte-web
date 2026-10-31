import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type {
  ScoreTemplateItemDraft,
  ScoreTemplateItemResponse,
} from "../../../../../features/scoretemplate/types";

vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { ScoreTemplateItemTable } from "../../../../../features/scoretemplate/components/_ScoreTemplateItemTable";

const draft = (
  taskTypeKey: string,
  section: string,
  overrides: Partial<ScoreTemplateItemDraft> = {},
): ScoreTemplateItemDraft => ({
  taskType: taskTypeKey,
  taskTypeKey,
  section,
  sequence: 1,
  minCount: "5",
  maxCount: "6",
  prepSeconds: "35",
  responseSeconds: "40",
  overallWeight: "2.23",
  speakingWeight: "0",
  writingWeight: "0",
  readingWeight: "0",
  listeningWeight: "0",
  ...overrides,
});

const DRAFTS: ScoreTemplateItemDraft[] = [
  draft("READ_ALOUD", "SPEAKING", { speakingWeight: "8.91" }),
  draft("REPEAT_SENTENCE", "SPEAKING", { speakingWeight: "15.84", listeningWeight: "16.83" }),
  draft("WRITE_ESSAY", "WRITING", { writingWeight: "31" }),
];
const EDITABLE_NUMERIC_FIELDS_PER_ROW = 8;

const noop = (): void => undefined;

const render = (element: ReactElement): string =>
  renderToStaticMarkup(createElement(LocaleProvider, null, element));

const renderEditable = (): string =>
  render(
    createElement(ScoreTemplateItemTable, {
      editable: true,
      items: DRAFTS,
      onChange: noop,
      onRemove: noop,
      onReorder: noop,
    }),
  );

const renderReadOnly = (): string =>
  render(
    createElement(ScoreTemplateItemTable, {
      editable: false,
      items: DRAFTS as unknown as ScoreTemplateItemResponse[],
    }),
  );

describe("ScoreTemplateItemTable", () => {
  it("renders a vertical tab rail with an All tab and one tab per skill, each with its count", () => {
    const html = renderEditable();
    expect(html).toContain('aria-orientation="vertical"');
    expect(html.match(/role="tab"/g)).toHaveLength(5);
    expect(html).toMatch(/All sections[\s\S]*?>3</);
    expect(html).toMatch(/Speaking[\s\S]*?>2</);
    expect(html).toMatch(/Writing[\s\S]*?>1</);
  });

  it("starts on All and lists every task type in one table", () => {
    const html = renderEditable();
    expect(html.match(/<table/g)).toHaveLength(1);
    for (const key of ["READ_ALOUD", "REPEAT_SENTENCE", "WRITE_ESSAY"]) expect(html).toContain(key);
  });

  it("shows the compact header: min/max and prep/response are merged, no # column", () => {
    const html = renderEditable();
    for (const header of [
      "Section",
      "Task type",
      "Questions",
      "Time (s)",
      "Overall %",
      "Speaking %",
      "Writing %",
      "Reading %",
      "Listening %",
    ]) {
      expect(html).toContain(`>${header}<`);
    }
    for (const merged of ["Min", "Max", "Prep (s)", "Response (s)", "#"]) {
      expect(html).not.toContain(`>${merged}<`);
    }
  });

  it("turns off the per-column sort controls", () => {
    expect(renderEditable()).not.toContain("aria-sort");
  });

  it("still labels each merged input for assistive tech", () => {
    const html = renderEditable();
    for (const label of ["Min", "Max", "Prep (s)", "Response (s)"]) {
      expect(html).toContain(`aria-label="${label}"`);
    }
  });

  it("gives the editor one remove button per row and a number input for every editable field", () => {
    const html = renderEditable();
    expect(html.match(/>Remove</g)).toHaveLength(DRAFTS.length);
    expect(html.match(/type="number"/g)).toHaveLength(DRAFTS.length * EDITABLE_NUMERIC_FIELDS_PER_ROW);
  });

  it("offers the empty-state action only when the editor has no rows to show", () => {
    const renderEmptyAction = (activeTab: string): ReactElement =>
      createElement("button", { id: "empty-probe" }, `Add first (${activeTab})`);
    const renderWith = (items: ScoreTemplateItemDraft[]): string =>
      render(
        createElement(ScoreTemplateItemTable, {
          editable: true,
          items,
          onChange: noop,
          onRemove: noop,
          onReorder: noop,
          renderEmptyAction,
        }),
      );
    expect(renderWith([])).toContain("Add first (ALL)");
    expect(renderWith(DRAFTS)).not.toContain("empty-probe");
  });

  it("renders the toolbar action in the table toolbar of the editor only, with the active tab", () => {
    const renderToolbarAction = (activeTab: string): ReactElement =>
      createElement("button", { id: "toolbar-probe" }, `Add (${activeTab})`);
    const editable = render(
      createElement(ScoreTemplateItemTable, {
        editable: true,
        items: DRAFTS,
        onChange: noop,
        onRemove: noop,
        onReorder: noop,
        renderToolbarAction,
      }),
    );
    expect(editable).toContain("Add (ALL)");
    expect(editable.indexOf("toolbar-probe")).toBeLessThan(editable.indexOf("<table"));
    expect(renderReadOnly()).not.toContain("toolbar-probe");
  });

  it("renders the side panel under the tab rail, in the same side column", () => {
    const html = render(
      createElement(ScoreTemplateItemTable, {
        editable: true,
        items: DRAFTS,
        onChange: noop,
        onRemove: noop,
        onReorder: noop,
        sidePanel: createElement("div", { id: "side-panel-probe" }, "Template details"),
      }),
    );
    expect(html).toContain("Template details");
    expect(html.indexOf("side-panel-probe")).toBeGreaterThan(html.lastIndexOf('role="tab"'));
    expect(html.indexOf("side-panel-probe")).toBeLessThan(html.indexOf("<table"));
  });

  it("gives the editor one drag handle per row and shows every row without pagination", () => {
    const html = renderEditable();
    expect(html.match(/<button[^>]*aria-label="Drag to reorder"/g)).toHaveLength(DRAFTS.length);
    expect(html).not.toContain("Total");
  });

  it("is read-only on the detail view: no drag handles, no remove buttons and no number inputs", () => {
    const html = renderReadOnly();
    expect(html).not.toContain("Drag to reorder");
    expect(html).not.toContain(">Remove<");
    expect(html).not.toContain('type="number"');
    expect(html).toContain("15.84");
  });
});
