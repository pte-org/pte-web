import { describe, expect, it } from "vitest";
import { getDragPoint } from "../../../src/components/reorderDnd";

describe("getDragPoint", () => {
  it("adds how far the row travelled to where the drag began", () => {
    const event = {
      activatorEvent: { clientX: 100, clientY: 200 } as unknown as Event,
      delta: { x: -40, y: 15 },
    };
    expect(getDragPoint(event)).toEqual({ x: 60, y: 215 });
  });

  it("has no point for a keyboard drag", () => {
    const event = { activatorEvent: new Event("keydown"), delta: { x: 0, y: 0 } };
    expect(getDragPoint(event)).toBeNull();
  });
});
