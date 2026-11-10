import { describe, expect, it } from "vitest";
import { renderHtml } from "../testing/renderHtml";
import { PteOrbitPanel } from "../../../src/components/PteOrbitPanel";

describe("PteOrbitPanel", () => {
  it("loads the scene without sending the page address, which can carry a reset token", () => {
    const html = renderHtml(<PteOrbitPanel />);

    expect(html).toMatch(/<iframe[^>]*referrerpolicy="no-referrer"/i);
  });

  it("still points the iframe at the orbit scene", () => {
    const html = renderHtml(<PteOrbitPanel />);

    expect(html).toContain("/illustrations/pte-orbit/index.html");
  });
});
