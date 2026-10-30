import { describe, expect, it } from "vitest";
import { countMatches, renderHtml, textOf } from "../testing/renderHtml";
import { StatCard } from "../../../src/components/StatCard";
import { hasStatCardDelta } from "../../../src/components/StatCardDelta";

const DELTA_PARAGRAPH = /<p class="mt-2 flex flex-wrap[^>]*>[\s\S]*?<\/p>/;
const UP_PATH = 'd="m3 17 6-6 4 4 8-8"';
const DOWN_PATH = 'd="m3 7 6 6 4-4 8 8"';
const FLAT_PATH = 'd="M4 12h16"';
const EN_DASH = "–";

const deltaOf = (html: string): string => html.match(DELTA_PARAGRAPH)?.[0] ?? "";

describe("StatCard: regression with the pre-Phase-6 props only", () => {
  it("renders the exact legacy markup for label + value", () => {
    const html = renderHtml(<StatCard label="Students" value="1,204" />);
    expect(html).toBe(
      '<div class="rounded-xl border-[0.5px] border-[var(--shell-border)] bg-[var(--surface-card)] p-5 relative overflow-hidden shadow-none motion-safe:animate-pte-scale-in transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-card p-5">' +
        '<div class="flex items-start justify-between gap-3"></div>' +
        '<div class="mt-5 flex items-end justify-between gap-3"><div>' +
        '<p class="text-sm font-normal text-[var(--ink-secondary)]">Students</p>' +
        '<div class="mt-2 flex items-center gap-2">' +
        '<span class="text-2xl font-semibold tabular-nums text-[var(--ink-primary)]">1,204</span>' +
        "</div></div></div></div>",
    );
  });

  it("emits no delta markup, no svg and no screen-reader-only text", () => {
    const html = renderHtml(<StatCard label="Students" value="9" footnote="note" />);
    expect(deltaOf(html)).toBe("");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("sr-only");
    expect(html).not.toContain(EN_DASH);
  });

  it("keeps trend + trendPositive: '+' glyph, mint tone, trend text on the right", () => {
    const html = renderHtml(<StatCard label="Revenue" value="5" trend="67%" trendPositive />);
    expect(html).toContain(
      '<span class="text-2xl font-light leading-none text-[var(--mint-action)]">+</span>',
    );
    expect(html).toContain('<span class="text-sm font-normal text-[var(--ink-muted)]">67%</span>');
    expect(deltaOf(html)).toBe("");
  });

  it("keeps trendPositive=false: '-' glyph, blush tone, rose progress", () => {
    const html = renderHtml(
      <StatCard label="Revenue" value="5" trend="3%" trendPositive={false} progress={40} />,
    );
    expect(html).toContain(
      '<span class="text-2xl font-light leading-none text-[var(--blush-action)]">-</span>',
    );
    // Attribute values are HTML-escaped, so "&" appears as "&amp;".
    expect(html).toContain("[&amp;::-webkit-progress-value]:bg-rose-500");
    expect(deltaOf(html)).toBe("");
  });

  it("defaults trendPositive to true (emerald progress, mint plus)", () => {
    const html = renderHtml(<StatCard label="A" value="1" trend="1%" progress={10} />);
    expect(html).toContain("[&amp;::-webkit-progress-value]:bg-emerald-500");
    expect(html).toContain("text-[var(--mint-action)]\">+</span>");
  });

  it("clamps progress to 0..100 and labels the progress element", () => {
    expect(renderHtml(<StatCard label="A" value="1" progress={250} />)).toContain('value="100" max="100"');
    expect(renderHtml(<StatCard label="A" value="1" progress={-5} />)).toContain('value="0" max="100"');
    expect(renderHtml(<StatCard label="Quota" value="1" progress={50} />)).toContain('aria-label="Quota"');
    expect(renderHtml(<StatCard label="A" value="1" />)).not.toContain("<progress");
  });

  it("highlight wins over trendPositive for the progress tone and the icon accent", () => {
    const html = renderHtml(
      <StatCard label="A" value="1" highlight progress={20} trendPositive={false} icon={<i />} />,
    );
    expect(html).toContain("bg-amber-500");
    expect(html).toContain("bg-[var(--cream-tint)] text-[var(--cream-action)]");
  });

  it("keeps compact sizing, icon tile accent and footnote", () => {
    const html = renderHtml(
      <StatCard label="A" value="1" compact accent="mint" icon={<i />} footnote="25% of total" />,
    );
    expect(html).toContain("p-4");
    expect(html).toContain("h-9 w-9");
    expect(html).toContain("bg-[var(--mint-tint)] text-[var(--mint-action)]");
    expect(html).toContain('class="mt-2 text-xs font-normal text-[var(--ink-muted)]">25% of total</p>');
  });

  it.each([
    ["ProctorOverview / ExaminerOverview", { label: "L", value: "1" }],
    ["StudentOverviewTab compact+footnote", { label: "L", value: "1", compact: true, footnote: "f" }],
    ["_AdminStatGrid trend+progress+icon", { label: "L", value: "1", trend: "2%", progress: 5, icon: <i /> }],
    ["_AdminStatGrid trendPositive", { label: "L", value: "1", trend: "2%", trendPositive: false }],
    ["_LicenseStatGrid highlight", { label: "L", value: "1", icon: <i />, highlight: true }],
    ["_QuestionStatGrid compact+icon+trend", { label: "L", value: "1", compact: true, icon: <i />, trend: "x" }],
  ])("consumer usage '%s' renders without any delta", (_name, props) => {
    const html = renderHtml(<StatCard {...props} />);
    expect(html).toContain('<p class="text-sm font-normal text-[var(--ink-secondary)]">L</p>');
    expect(deltaOf(html)).toBe("");
  });
});

describe("StatCard: period-over-period delta", () => {
  it("shows arrow + signed text + sr-only direction label + period label", () => {
    const html = renderHtml(
      <StatCard
        label="Sessions"
        value="40"
        change="+12.5%"
        changeDirection="up"
        changeTone="good"
        changeDirectionLabel="Increase"
        changePeriodLabel="vs previous 30 days"
      />,
    );
    const delta = deltaOf(html);
    expect(delta).toContain(UP_PATH);
    expect(delta).toContain('aria-hidden="true"');
    expect(delta).toContain('<span class="sr-only">Increase</span>');
    expect(delta).toContain('<span class="tabular-nums">+12.5%</span>');
    expect(delta).toContain('<span class="text-[var(--ink-muted)]">vs previous 30 days</span>');
    expect(textOf(delta)).toBe("Increase +12.5% vs previous 30 days");
  });

  it.each([
    ["up", UP_PATH],
    ["down", DOWN_PATH],
    ["flat", FLAT_PATH],
  ] as const)("direction '%s' draws its own arrow only", (direction, path) => {
    const delta = deltaOf(
      renderHtml(<StatCard label="A" value="1" change="1%" changeDirection={direction} />),
    );
    expect(delta).toContain(path);
    expect([UP_PATH, DOWN_PATH, FLAT_PATH].filter((other) => delta.includes(other))).toHaveLength(1);
  });

  it.each([
    ["good", "text-[var(--mint-action)]"],
    ["bad", "text-[var(--blush-action)]"],
    ["neutral", "text-[var(--ink-muted)]"],
  ] as const)("tone '%s' maps to its token class on the change span", (tone, cls) => {
    const delta = deltaOf(
      renderHtml(<StatCard label="A" value="1" change="+1" changeDirection="up" changeTone={tone} />),
    );
    expect(delta).toContain(`<span class="inline-flex items-center gap-1 font-medium ${cls}">`);
  });

  it("allows direction up with tone bad (more failures) and down with tone good", () => {
    const upBad = deltaOf(
      renderHtml(<StatCard label="A" value="1" change="+9%" changeDirection="up" changeTone="bad" />),
    );
    expect(upBad).toContain(UP_PATH);
    expect(upBad).toContain("text-[var(--blush-action)]");
    expect(upBad).not.toContain("text-[var(--mint-action)]");

    const downGood = deltaOf(
      renderHtml(<StatCard label="A" value="1" change="-9%" changeDirection="down" changeTone="good" />),
    );
    expect(downGood).toContain(DOWN_PATH);
    expect(downGood).toContain("text-[var(--mint-action)]");
  });

  it("defaults to flat + neutral when only change is supplied", () => {
    const delta = deltaOf(renderHtml(<StatCard label="A" value="1" change="0%" />));
    expect(delta).toContain(FLAT_PATH);
    expect(delta).toContain("text-[var(--ink-muted)]");
    expect(delta).not.toContain("sr-only");
  });

  it("renders a dash plus the sr-only empty label when change is null", () => {
    const delta = deltaOf(
      renderHtml(
        <StatCard
          label="A"
          value="1"
          change={null}
          changeEmptyLabel="No previous data"
          changePeriodLabel="vs previous 30 days"
          changeDirection="up"
          changeTone="good"
          changeDirectionLabel="Increase"
        />,
      ),
    );
    expect(delta).toContain(`<span aria-hidden="true">${EN_DASH}</span>`);
    expect(delta).toContain('<span class="sr-only">No previous data</span>');
    expect(delta).toContain("vs previous 30 days");
    expect(delta).not.toContain("<svg");
    expect(delta).not.toContain("Increase");
    expect(delta).not.toContain("mint-action");
  });

  it("omits the sr-only span when change is null without an empty label", () => {
    const delta = deltaOf(renderHtml(<StatCard label="A" value="1" change={null} />));
    expect(delta).toContain(EN_DASH);
    expect(delta).not.toContain("sr-only");
  });

  it("shows no delta when no change* prop is supplied, even if labels-only are", () => {
    const html = renderHtml(
      <StatCard label="A" value="1" changeDirectionLabel="Increase" changeEmptyLabel="None" />,
    );
    expect(deltaOf(html)).toBe("");
    expect(html).not.toContain("Increase");
    expect(html).not.toContain("None");
  });

  it("treats direction, tone or period label alone as a delta request (dash without change)", () => {
    for (const props of [
      { changeDirection: "up" as const },
      { changeTone: "bad" as const },
      { changePeriodLabel: "vs last week" },
    ]) {
      const delta = deltaOf(renderHtml(<StatCard label="A" value="1" {...props} />));
      expect(delta).toContain(EN_DASH);
    }
  });

  it("is independent of the legacy trend text and keeps both", () => {
    const html = renderHtml(
      <StatCard label="A" value="1" trend="5%" trendPositive={false} change="+2%" changeDirection="up" />,
    );
    expect(html).toContain('text-[var(--blush-action)]">-</span>');
    expect(html).toContain("5%</span>");
    expect(deltaOf(html)).toContain("+2%");
    expect(countMatches(html, /<p class="mt-2 flex flex-wrap/)).toBe(1);
  });

  it("places the delta inside the value column, between the value and the footnote", () => {
    const html = renderHtml(
      <StatCard label="A" value="77" change="+1%" changeDirection="up" footnote="foot" />,
    );
    expect(html.indexOf("77")).toBeLessThan(html.indexOf("+1%"));
    expect(html.indexOf("+1%")).toBeLessThan(html.indexOf("foot"));
  });
});

describe("hasStatCardDelta", () => {
  it("is false for no props and for label-only props", () => {
    expect(hasStatCardDelta({})).toBe(false);
    expect(hasStatCardDelta({ directionLabel: "Increase", emptyLabel: "None" })).toBe(false);
  });

  it("is true when change (including null), direction, tone or periodLabel is present", () => {
    expect(hasStatCardDelta({ change: "+1%" })).toBe(true);
    expect(hasStatCardDelta({ change: null })).toBe(true);
    expect(hasStatCardDelta({ change: "" })).toBe(true);
    expect(hasStatCardDelta({ direction: "flat" })).toBe(true);
    expect(hasStatCardDelta({ tone: "neutral" })).toBe(true);
    expect(hasStatCardDelta({ periodLabel: "x" })).toBe(true);
  });
});
