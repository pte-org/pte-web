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
];
const COLUMNS: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", sortable: false, cell: (row) => row.name },
];

const renderTable = (density?: "default" | "compact", withActions = false): string =>
  renderHtml(
    <LocaleProvider>
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        getRowKey={(row) => row.id}
        showSearch={false}
        clientSidePagination={false}
        density={density}
        rowActions={withActions ? () => <button type="button">Menu</button> : undefined}
      />
    </LocaleProvider>,
  );

describe("DataTable density", () => {
  it("keeps the wide cell padding by default", () => {
    const html = renderTable();
    expect(countMatches(html, /px-4 py-2\.5 sm:px-6/)).toBe(1);
    expect(countMatches(html, /px-4 py-3 sm:px-6 sm:py-3\.5/)).toBe(ROWS.length);
    expect(html).not.toContain("sm:px-3");
  });

  it("halves the cell padding of the header and every body cell when compact", () => {
    const html = renderTable("compact");
    const headerCells = 1;
    expect(countMatches(html, /px-2 py-2 sm:px-3/)).toBe(headerCells + ROWS.length);
    expect(countMatches(html, /sm:py-2\.5/)).toBe(ROWS.length);
    expect(html).not.toContain("sm:px-6");
  });

  it("narrows the actions column when compact", () => {
    expect(renderTable("default", true)).toContain("w-20 min-w-[4.5rem]");
    const compact = renderTable("compact", true);
    expect(compact).toContain("w-12 whitespace-nowrap");
    expect(compact).not.toContain("w-20 min-w-[4.5rem]");
  });
});
