import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { CollapsibleSection } from "../../../src/components/CollapsibleSection";
import { Disclosure } from "../../../src/components/Disclosure";
import { InfoPanel } from "../../../src/components/InfoPanel";

it("uses the section title as its accessible toggle and hides collapsed content", () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="History" defaultExpanded={false}>
      Event details
    </CollapsibleSection>,
  );
  expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*aria-controls=/);
  expect(html).toContain("History");
  expect(html).not.toContain("Event details");
  expect(html).not.toMatch(/Collapse|Expand|>\+<|>−</);
});

it("links expanded content and keeps actions outside the disclosure button", () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="History" actions={<button>Edit</button>}>
      Event details
    </CollapsibleSection>,
  );
  const controls = html.match(/aria-controls="([^"]+)"/)?.[1];
  expect(controls).toBeTruthy();
  expect(html).toContain(`id="${controls}"`);
  expect(html).toContain('aria-expanded="true"');
  expect(html).toMatch(/<\/button><\/h2><\/div><div[^>]*><button>Edit/);
  expect(html).toContain("rotate-180");
});

it("keeps non-collapsible sections static", () => {
  const html = renderToStaticMarkup(
    <CollapsibleSection title="Facts" collapsible={false}>
      Always visible
    </CollapsibleSection>,
  );
  expect(html).not.toContain("aria-expanded");
  expect(html).toContain("Always visible");
});

it("uses native disclosure semantics with a chevron scoped to its own open state", () => {
  const html = renderToStaticMarkup(
    <Disclosure title="Outer">
      <Disclosure title="Inner">Nested</Disclosure>
    </Disclosure>,
  );
  expect(html.match(/<summary/g)).toHaveLength(2);
  expect(html).toContain("[&amp;[open]&gt;summary&gt;span:last-child&gt;svg]:rotate-180");
  expect(html).not.toMatch(/<details[^>]* open/);
});

it("preserves InfoPanel default and forced open contracts", () => {
  expect(renderToStaticMarkup(<InfoPanel title="Facts" />)).toMatch(/<details[^>]* open/);
  expect(renderToStaticMarkup(<InfoPanel title="Facts" defaultOpen={false} />)).not.toMatch(
    /<details[^>]* open/,
  );
  expect(renderToStaticMarkup(<InfoPanel title="Facts" defaultOpen={false} forceOpen />)).toMatch(
    /<details[^>]* open/,
  );
});
