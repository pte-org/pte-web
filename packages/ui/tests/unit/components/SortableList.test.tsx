import { describe, expect, it } from "vitest";
import { SortableList } from "../../../src/components/SortableList";
import { countMatches, renderHtml, textOf } from "../testing/renderHtml";

interface Row {
  id: string;
  name: string;
}

const ROWS: Row[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Bravo" },
  { id: "c", name: "Charlie" },
];

const GRID = "sm:grid-cols-[1fr_80px]";
const HANDLE_LABEL = "Drag to reorder";

const renderList = (props: { reorderable: boolean; items?: Row[] }): string =>
  renderHtml(
    <SortableList
      items={props.items ?? ROWS}
      getId={(row) => row.id}
      renderCells={(row, index) => (
        <>
          <span>{row.name}</span>
          <span>#{index + 1}</span>
        </>
      )}
      onReorder={props.reorderable ? () => undefined : undefined}
      dragHandleLabel={HANDLE_LABEL}
      columnsClassName={GRID}
      ariaLabel="Rows"
      emptyContent={<p>Nothing here</p>}
    />,
  );

describe("SortableList", () => {
  it("renders one row per item with its cells", () => {
    const html = renderList({ reorderable: true });
    expect(countMatches(html, /<li\b/)).toBe(3);
    expect(textOf(html)).toContain("Alpha #1 Bravo #2 Charlie #3");
  });

  it("gives every row a labelled drag handle when reorderable", () => {
    const html = renderList({ reorderable: true });
    expect(countMatches(html, new RegExp(`aria-label="${HANDLE_LABEL}"`))).toBe(3);
  });

  it("renders no drag handles when read-only", () => {
    const html = renderList({ reorderable: false });
    expect(countMatches(html, /<li\b/)).toBe(3);
    expect(html).not.toContain(HANDLE_LABEL);
    expect(html).not.toContain("<button");
  });

  it("applies the caller's grid columns to every row card", () => {
    expect(countMatches(renderList({ reorderable: false }), new RegExp(GRID.replace(/[[\]]/g, "\\$&")))).toBe(3);
  });

  it("renders the empty content instead of a list when there are no items", () => {
    const html = renderList({ reorderable: true, items: [] });
    expect(html).toBe("<p>Nothing here</p>");
  });
});
