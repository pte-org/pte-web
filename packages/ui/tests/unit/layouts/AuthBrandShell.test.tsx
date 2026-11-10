import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { countMatches, renderHtml } from "../testing/renderHtml";
import { LocaleProvider } from "../../../src/i18n";
import { ThemeProvider } from "../../../src/theme";
import { AuthBrandLockup, AuthBrandShell, type AuthBrandShellProps } from "../../../src/layouts/AuthBrandShell";

const renderShell = (props: Partial<AuthBrandShellProps> = {}): string =>
  renderHtml(
    <LocaleProvider>
      <ThemeProvider>
        <AuthBrandShell artwork={<aside>ART</aside>} {...props}>
          <form>FORM</form>
        </AuthBrandShell>
      </ThemeProvider>
    </LocaleProvider>,
  );

const Logo = (): ReactElement => <svg data-testid="logo" />;

describe("AuthBrandShell", () => {
  it("renders the artwork, the form and a decorative backdrop inside one main landmark", () => {
    const html = renderShell();
    expect(countMatches(html, /<main/)).toBe(1);
    expect(html).toContain("<aside>ART</aside>");
    expect(html).toContain("<form>FORM</form>");
    expect(html).toMatch(/<div aria-hidden="true"[^>]*pointer-events-none/);
  });

  it("renders a plain white backdrop with only the dot grid canvas", () => {
    const html = renderShell();
    expect(html).toMatch(/<div aria-hidden="true"[^>]*bg-\[var\(--surface-card\)\]/);
    expect(countMatches(html, /<canvas /)).toBe(1);
    expect(countMatches(html, /pte-aura|radial-gradient|<filter/)).toBe(0);
  });

  it("pins the brand above the form content", () => {
    const html = renderShell({ brand: <header>BRAND</header> });
    expect(html.indexOf("<header>BRAND</header>")).toBeGreaterThan(-1);
    expect(html.indexOf("<header>BRAND</header>")).toBeLessThan(html.indexOf("<form>FORM</form>"));
  });

  it("renders toolbar extras before the theme toggle", () => {
    const html = renderShell({ toolbar: <span>LOCALE</span> });
    expect(html).toContain("<span>LOCALE</span>");
  });

  it("omits the footer when there are no items", () => {
    expect(renderShell()).not.toContain("<footer");
  });

  it("renders footer items as links only when they have an href", () => {
    const html = renderShell({
      footerLabel: "Legal and support",
      footerItems: [
        { label: "© 2026 PTE Prep" },
        { label: "Contact support", href: "mailto:support@example.com" },
      ],
    });
    expect(html).toContain('<nav aria-label="Legal and support">');
    expect(html).toContain("<span>© 2026 PTE Prep</span>");
    expect(html).toMatch(/<a href="mailto:support@example.com"[^>]*>Contact support<\/a>/);
    expect(countMatches(html, /<a /)).toBe(1);
  });
});

describe("AuthBrandLockup", () => {
  it("renders the logo, the product name and the portal label", () => {
    const html = renderHtml(
      <AuthBrandLockup logo={<Logo />} name="PTE Prep" portalLabel="Admin portal" />,
    );
    expect(html).toContain('data-testid="logo"');
    expect(html).toMatch(/>PTE Prep<\/span>/);
    expect(html).toMatch(/>Admin portal<\/span>/);
  });

  it("omits the portal label when not provided", () => {
    const html = renderHtml(<AuthBrandLockup logo={<Logo />} name="PTE Prep" />);
    expect(countMatches(html, /uppercase/)).toBe(0);
  });
});

describe("AuthBrandShell motion", () => {
  it("does not animate itself: it persists across pages, and each page animates its own content", () => {
    const html = renderShell({ brand: <header>BRAND</header> });

    expect(html).not.toContain("animate-pte-fade-up");
    expect(html).not.toContain("animate-pte-fade-in");
  });
});
