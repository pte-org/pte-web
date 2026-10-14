import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { countMatches, renderHtml, textOf } from "../testing/renderHtml";
import { ActivityList, type ActivityListItem, type ActivityListLinkProps } from "./ActivityList";

const CHEVRON = "<svg";

const timelineItems: ActivityListItem[] = [
  { id: "a", title: "Session created", timeLabel: "10:30", meta: "by Lan", description: "Mock exam 3", tone: "success" },
  { id: "b", title: "Seat limit near", tone: "warning", icon: <i data-icon="x" /> },
  { id: "c", title: "Plain" },
];

describe("ActivityList timeline", () => {
  const html = renderHtml(
    <ActivityList items={timelineItems} ariaLabel="Recent activity" emptyLabel="Nothing yet" />,
  );

  it("is the default variant: an ordered list named by ariaLabel with one li per item", () => {
    expect(html.startsWith('<ol aria-label="Recent activity"')).toBe(true);
    expect(countMatches(html, /<li /)).toBe(3);
    expect(html).not.toContain("<ul");
    expect(html).not.toContain("Nothing yet");
  });

  it("renders time, title, description and meta in the text", () => {
    expect(textOf(html)).toContain("10:30 Session created Mock exam 3 by Lan");
  });

  it("marks each item with a decorative tone marker, neutral by default", () => {
    const markers = [...html.matchAll(/<span aria-hidden="true" class="absolute[^"]*"><\/span>/g)].map(
      (match) => match[0],
    );
    expect(markers).toHaveLength(3);
    expect(markers[0]).toContain("bg-[var(--mint-action)]");
    expect(markers[1]).toContain("bg-[var(--cream-action)]");
    expect(markers[2]).toContain("bg-[var(--ink-muted)]");
  });

  it("omits optional lines when absent and renders the leading icon when given", () => {
    const plain = renderHtml(
      <ActivityList items={[{ id: "c", title: "Plain" }]} ariaLabel="x" emptyLabel="e" />,
    );
    expect(countMatches(plain, /<p /g)).toBe(1);
    expect(html).toContain('<i data-icon="x"></i>');
  });

  it("does not render links or buttons even if href/onClick are supplied", () => {
    const withHref = renderHtml(
      <ActivityList
        items={[{ id: "l", title: "T", href: "/x", onClick: () => undefined }]}
        ariaLabel="x"
        emptyLabel="e"
      />,
    );
    expect(withHref).not.toContain("<a");
    expect(withHref).not.toContain("<button");
  });

  it("applies className to the list element", () => {
    expect(
      renderHtml(<ActivityList items={timelineItems} ariaLabel="x" emptyLabel="e" className="mt-4" />),
    ).toMatch(/<ol [^>]*class="[^"]*mt-4"/);
  });
});

describe("ActivityList actions", () => {
  const actionItems: ActivityListItem[] = [
    { id: "link", title: "Pending applications", description: "Review", count: 4, tone: "danger", href: "/applications" },
    { id: "btn", title: "Open tickets", count: "12", onClick: () => undefined },
    { id: "static", title: "Seats", count: 0, tone: "info" },
    { id: "bare", title: "No count" },
  ];
  const html = renderHtml(
    <ActivityList variant="actions" items={actionItems} ariaLabel="Needs attention" emptyLabel="All clear" />,
  );

  it("is an unordered list named by ariaLabel", () => {
    expect(html.startsWith('<ul aria-label="Needs attention"')).toBe(true);
    expect(html).not.toContain("<ol");
    expect(countMatches(html, /<li/)).toBe(4);
  });

  it("renders an item with href as a native anchor by default", () => {
    const anchor = html.match(/<a href="\/applications"[^>]*>/)?.[0] ?? "";
    expect(anchor).toContain("hover:bg-[var(--surface-subtle)]");
    expect(anchor).toContain("min-h-11");
  });

  it("renders an item with only onClick as a type=button button", () => {
    expect(html).toMatch(/<button type="button" class="[^"]*focus-visible:ring-2[^"]*">/);
    expect(countMatches(html, /<button/)).toBe(1);
  });

  it("renders a static row (no a/button) when neither href nor onClick", () => {
    expect(countMatches(html, /<a /)).toBe(1);
    expect(html).toMatch(/<li class="flex min-h-11[^"]*"><span class="flex min-w-0 items-center gap-2">/);
  });

  it("prefers href over onClick when both are given", () => {
    const both = renderHtml(
      <ActivityList
        variant="actions"
        items={[{ id: "b", title: "Both", href: "/both", onClick: () => undefined }]}
        ariaLabel="x"
        emptyLabel="e"
      />,
    );
    expect(both).toContain('<a href="/both"');
    expect(both).not.toContain("<button");
  });

  it("shows the count as a badge, including a zero count, tone applied", () => {
    expect(html).toContain(">4</span>");
    expect(html).toContain(">12</span>");
    expect(html).toMatch(/bg-\[var\(--blush-tint\)\][^>]*>4<\/span>/);
    expect(html).toMatch(/bg-\[var\(--sky-tint\)\][^>]*>0<\/span>/);
  });

  it("renders no badge when count is undefined", () => {
    const bare = renderHtml(
      <ActivityList variant="actions" items={[{ id: "x", title: "No count" }]} ariaLabel="x" emptyLabel="e" />,
    );
    expect(bare).not.toContain("rounded-full");
  });

  it("shows the chevron only on interactive rows", () => {
    const rowOf = (id: string) =>
      renderHtml(
        <ActivityList
          variant="actions"
          items={actionItems.filter((item) => item.id === id)}
          ariaLabel="x"
          emptyLabel="e"
        />,
      );
    expect(countMatches(rowOf("link"), /<svg/)).toBe(1);
    expect(countMatches(rowOf("btn"), /<svg/)).toBe(1);
    expect(rowOf("static")).not.toContain(CHEVRON);
    expect(rowOf("bare")).not.toContain(CHEVRON);
  });

  it("uses renderLink for href rows, passing href, className and children", () => {
    const seen: ActivityListLinkProps[] = [];
    const renderLink = (props: ActivityListLinkProps): ReactElement => {
      seen.push(props);
      return (
        <a data-adapter="next" href={props.href} className={props.className}>
          {props.children}
        </a>
      );
    };
    const out = renderHtml(
      <ActivityList variant="actions" items={actionItems} ariaLabel="x" emptyLabel="e" renderLink={renderLink} />,
    );
    expect(seen).toHaveLength(1);
    expect(seen[0]?.href).toBe("/applications");
    expect(seen[0]?.className).toContain("min-h-11");
    expect(out).toContain('data-adapter="next"');
    expect(countMatches(out, /<button/)).toBe(1);
  });

  it("never calls renderLink for rows without href", () => {
    let calls = 0;
    renderHtml(
      <ActivityList
        variant="actions"
        items={[{ id: "b", title: "B", onClick: () => undefined }, { id: "s", title: "S" }]}
        ariaLabel="x"
        emptyLabel="e"
        renderLink={(props) => {
          calls += 1;
          return <a href={props.href}>{props.children}</a>;
        }}
      />,
    );
    expect(calls).toBe(0);
  });
});

describe("ActivityList empty state", () => {
  it.each(["timeline", "actions"] as const)("variant '%s' with no items shows only emptyLabel", (variant) => {
    const html = renderHtml(
      <ActivityList variant={variant} items={[]} ariaLabel="Recent activity" emptyLabel="Nothing yet" />,
    );
    expect(textOf(html)).toBe("Nothing yet");
    expect(html).not.toContain("<ol");
    expect(html).not.toContain("<ul");
    expect(html).not.toContain("<li");
  });

  it("applies className to the empty placeholder", () => {
    expect(
      renderHtml(<ActivityList items={[]} ariaLabel="x" emptyLabel="e" className="mt-3" />),
    ).toContain("mt-3");
  });
});
