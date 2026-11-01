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

type View = "STRUCTURE" | "WEIGHTS";

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
/** Each view edits four numbers per row: min, max, prep, response or the four skill weights. */
const EDITABLE_INPUTS_PER_ROW_AND_VIEW = 4;
const SKILL_TABS = 5;
const VIEW_TABS = 2;

const noop = (): void => undefined;

const withoutBreakHints = (html: string): string => html.replace(/<wbr\s*\/?>/g, "");

const render =(element: ReactElement): string =>
  renderToStaticMarkup(createElement(LocaleProvider, null, element));

const editableProps = {
  editable: true as const,
  items: DRAFTS,
  onChange: noop,
  onRemove: noop,
  onReorder: noop,
};

const renderEditable = (initialView?: View): string =>
  render(createElement(ScoreTemplateItemTable, { ...editableProps, initialView }));

const renderReadOnly = (initialView?: View): string =>
  render(
    createElement(ScoreTemplateItemTable, {
      editable: false,
      items: DRAFTS as unknown as ScoreTemplateItemResponse[],
      initialView,
    }),
  );

describe("ScoreTemplateItemTable", () => {
  it("renders a vertical tab rail with an All tab and one tab per skill, each with its count", () => {
    const html = renderEditable();
    expect(html.match(/aria-orientation="vertical"/g)).toHaveLength(1);
    expect(html.match(/role="tab"/g)).toHaveLength(SKILL_TABS + VIEW_TABS);
    expect(html).toMatch(/All sections[\s\S]*?>3</);
    expect(html).toMatch(/Speaking[\s\S]*?>2</);
    expect(html).toMatch(/Writing[\s\S]*?>1</);
  });

  it("starts on All and lists every task type in one table", () => {
    const html = renderEditable();
    expect(html.match(/<table/g)).toHaveLength(1);
    // A key carries a <wbr> after each underscore so it can wrap there.
    for (const key of ["READ_ALOUD", "REPEAT_SENTENCE", "WRITE_ESSAY"]) {
      expect(withoutBreakHints(html)).toContain(key);
      expect(html).toContain(key.replace("_", "_<wbr/>"));
    }
  });

  it("shows the section as a second line of the task type under All, not as a column", () => {
    const html = renderEditable();
    const table = html.slice(html.indexOf("<table"));
    expect(table).not.toContain(">Section<");
    expect(table.match(/>Speaking<\/span>/g)).toHaveLength(2);
    expect(table.match(/>Writing<\/span>/g)).toHaveLength(1);
  });

  it("offers the two views and opens on the exam structure by default", () => {
    const html = renderEditable();
    expect(html).toContain('aria-label="Table view"');
    expect(html).toContain("Questions &amp; timing");
    expect(html).toContain(">Weights<");
    expect(html).toMatch(/aria-selected="true"[^>]*>[^<]*Questions &amp; timing/);
  });

  describe("structure view", () => {
    it("shows the task type, questions and time columns, and nothing about weights", () => {
      const html = renderEditable("STRUCTURE");
      for (const header of ["Task type", "Questions", "Time (s)"]) {
        expect(html).toContain(`>${header}<`);
      }
      for (const weightHeader of ["Overall %", "Speaking %", "Writing %", "Reading %", "Listening %"]) {
        expect(html).not.toContain(`>${weightHeader}<`);
      }
    });

    it("has no # column, no split min/max or prep/response headers, and no sort controls", () => {
      const html = renderEditable("STRUCTURE");
      for (const gone of ["#", "Min", "Max", "Prep (s)", "Response (s)"]) {
        expect(html).not.toContain(`>${gone}<`);
      }
      expect(html).not.toContain("aria-sort");
    });

    it("gives every editor row inputs for min, max, prep and response with their own labels", () => {
      const html = renderEditable("STRUCTURE");
      expect(html.match(/type="number"/g)).toHaveLength(
        DRAFTS.length * EDITABLE_INPUTS_PER_ROW_AND_VIEW,
      );
      for (const label of ["Min", "Max", "Prep (s)", "Response (s)"]) {
        expect(html).toContain(`aria-label="${label}"`);
      }
    });

    it("shows plain values on the detail view", () => {
      const html = renderReadOnly("STRUCTURE");
      expect(html).toContain("5 – 6");
      expect(html).toContain("35 / 40");
      expect(html).not.toContain('type="number"');
    });
  });

  describe("weights view", () => {
    it("shows the overall weight and the four skill weights instead of counts and timing", () => {
      const html = renderEditable("WEIGHTS");
      for (const header of [
        "Task type",
        "Overall %",
        "Speaking %",
        "Writing %",
        "Reading %",
        "Listening %",
      ]) {
        // A weight column that is off carries its total after the header text.
        expect(html).toMatch(new RegExp(`>${header}[ <]`));
      }
      for (const structureHeader of ["Questions", "Time (s)"]) {
        expect(html).not.toContain(`>${structureHeader}<`);
      }
    });

    it("gives every editor row one input per skill weight, labelled by its header", () => {
      const html = renderEditable("WEIGHTS");
      expect(html.match(/type="number"/g)).toHaveLength(
        DRAFTS.length * EDITABLE_INPUTS_PER_ROW_AND_VIEW,
      );
      for (const label of ["Speaking %", "Writing %", "Reading %", "Listening %"]) {
        expect(html).toContain(`aria-label="${label}"`);
      }
    });

    it("shows the weights as plain values on the detail view", () => {
      const html = renderReadOnly("WEIGHTS");
      expect(html).toContain("15.84");
      expect(html).toContain("16.83");
      expect(html).not.toContain('type="number"');
    });
  });

  describe("skill weight totals", () => {
    it("shows 'total / 100' beside the header of each weight column that is off, and only those", () => {
      const html = renderEditable("WEIGHTS");
      // Speaking 8.91 + 15.84 = 24.75, Writing 31 and Listening 16.83 are off; Reading is 0 (fine).
      for (const total of ["24.75 / 100", "31 / 100", "16.83 / 100"]) expect(html).toContain(total);
      expect(html.match(/ \/ 100</g)).toHaveLength(3);
    });

    it("shows nothing extra when every column totals 100 or 0", () => {
      const balanced = [
        draft("READ_ALOUD", "SPEAKING", { speakingWeight: "100" }),
        draft("WRITE_ESSAY", "WRITING", { writingWeight: "100" }),
      ];
      const html = render(
        createElement(ScoreTemplateItemTable, { ...editableProps, items: balanced, initialView: "WEIGHTS" }),
      );
      expect(html).not.toContain("/ 100");
    });

    it("does not judge the read-only detail", () => {
      expect(renderReadOnly("WEIGHTS")).not.toContain("/ 100");
    });
  });

  it("puts Remove in each row's actions menu in the editor instead of a visible button", () => {
    const html = renderEditable();
    expect(html.match(/aria-label="Task type actions"/g)).toHaveLength(DRAFTS.length);
    expect(html).not.toContain(">Remove<");
  });

  it("adds an Available / needed column with a badge per task type when pool coverage is given", () => {
    const pool = new Map([
      ["READ_ALOUD", { available: 8, required: 6, ready: true }],
      ["REPEAT_SENTENCE", { available: 3, required: 6, ready: false }],
    ]);
    const html = render(createElement(ScoreTemplateItemTable, { ...editableProps, pool }));
    expect(html).toContain(">Available / needed<");
    expect(html).toContain(">8/6<");
    expect(html).toContain(">3/6<");
    expect(html).toContain("Not enough approved questions for this task type: 3 available, 6 needed.");
    expect(html).toContain("Enough approved questions for this task type.");
  });

  it("leaves the Available / needed column out of the weights view and when no pool is given", () => {
    const pool = new Map([["READ_ALOUD", { available: 8, required: 6, ready: true }]]);
    expect(renderEditable()).not.toContain("Available / needed");
    expect(
      render(createElement(ScoreTemplateItemTable, { ...editableProps, pool, initialView: "WEIGHTS" })),
    ).not.toContain("Available / needed");
  });

  it("offers the empty-state action only when the editor has no rows to show", () => {
    const renderEmptyAction = (activeTab: string): ReactElement =>
      createElement("button", { id: "empty-probe" }, `Add first (${activeTab})`);
    const renderWith = (items: ScoreTemplateItemDraft[]): string =>
      render(createElement(ScoreTemplateItemTable, { ...editableProps, items, renderEmptyAction }));
    expect(renderWith([])).toContain("Add first (ALL)");
    expect(renderWith(DRAFTS)).not.toContain("empty-probe");
  });

  it("renders the toolbar action in the table toolbar of the editor only, with the active tab", () => {
    const renderToolbarAction = (activeTab: string): ReactElement =>
      createElement("button", { id: "toolbar-probe" }, `Add (${activeTab})`);
    const editable = render(
      createElement(ScoreTemplateItemTable, { ...editableProps, renderToolbarAction }),
    );
    expect(editable).toContain("Add (ALL)");
    expect(editable.indexOf("toolbar-probe")).toBeLessThan(editable.indexOf("<table"));
    expect(renderReadOnly()).not.toContain("toolbar-probe");
  });

  it("renders the side panel under the skill tab rail, in the same side column", () => {
    const html = render(
      createElement(ScoreTemplateItemTable, {
        ...editableProps,
        sidePanel: createElement("div", { id: "side-panel-probe" }, "Template details"),
      }),
    );
    expect(html).toContain("Template details");
    // The rail's last tab is "Listening"; the panel must come after it and before the table.
    expect(html.indexOf("side-panel-probe")).toBeGreaterThan(html.indexOf("Listening<span"));
    expect(html.indexOf("side-panel-probe")).toBeLessThan(html.indexOf("<table"));
  });

  it("gives the editor one drag handle per row and shows every row without pagination", () => {
    const html = renderEditable();
    expect(html.match(/<button[^>]*aria-label="Drag to reorder"/g)).toHaveLength(DRAFTS.length);
    expect(html).not.toContain("Total");
  });

  it("is read-only on the detail view: no drag handles, no row menus and no number inputs", () => {
    const html = renderReadOnly();
    expect(html).not.toContain("Drag to reorder");
    expect(html).not.toContain("Task type actions");
    expect(html).not.toContain('type="number"');
  });
});
