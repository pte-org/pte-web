import { describe, expect, it } from "vitest";
import { DataTable, type DataTableColumn } from "../../../src/components/DataTable";
import { LocaleProvider } from "../../../src/i18n";
import { countMatches, renderHtml } from "../testing/renderHtml";

interface Row {
  id: string;
  name: string;
}

const ROWS: Row[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Bravo" },
  { id: "c", name: "Charlie" },
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", sortable: false, cell: (row) => row.name },
];
const HANDLE_LABEL = "Drag to reorder";

const renderTable = (props: { reorderable: boolean; rows?: Row[] }): string =>
  renderHtml(
    <LocaleProvider>
      <DataTable
        columns={COLUMNS}
        rows={props.rows ?? ROWS}
        getRowKey={(row) => row.id}
        showSearch={false}
        clientSidePagination={false}
        onReorderRows={props.reorderable ? () => undefined : undefined}
        reorderHandleLabel={HANDLE_LABEL}
      />
    </LocaleProvider>,
  );

describe("DataTable row reordering", () => {
  it("renders one labelled drag handle per row when onReorderRows is set", () => {
    const html = renderTable({ reorderable: true });
    expect(countMatches(html, new RegExp(`<button[^>]*aria-label="${HANDLE_LABEL}"`))).toBe(3);
  });

  it("adds a leading header cell for the handle column, announced to screen readers", () => {
    const html = renderTable({ reorderable: true });
    expect(html).toContain(`<span class="sr-only">${HANDLE_LABEL}</span>`);
    expect(countMatches(html, /<th\b/)).toBe(2);
  });

  it("renders the original markup, with no handles or extra column, without onReorderRows", () => {
    const html = renderTable({ reorderable: false });
    expect(html).not.toContain(HANDLE_LABEL);
    expect(countMatches(html, /<th\b/)).toBe(1);
    expect(countMatches(html, /<tr\b/)).toBe(4);
  });

  it("keeps the empty state spanning the extra handle column", () => {
    const html = renderTable({ reorderable: true, rows: [] });
    expect(html).toContain('colSpan="2"');
  });
});
