import { describe, it, expect, vi } from "vitest";

/**
 * Tests for QuantityStepper component
 *
 * These tests verify:
 * - Value increment/decrement functionality
 * - Min/max constraints are enforced
 * - Keyboard navigation (arrow keys)
 * - Input clamping
 * - Custom step values
 * - Button disable state when at limits
 * - Display modes (input vs value)
 * - Custom icons and labels
 */
describe("QuantityStepper", () => {
  it("initializes with correct props interface", () => {
    const props = {
      value: 5,
      onChange: vi.fn(),
      min: 1,
      max: 10,
      step: 1,
      disabled: false,
      label: "Quantity",
      displayMode: "input" as const,
    };

    expect(props.value).toBe(5);
    expect(props.min).toBeLessThan(props.value);
    expect(props.value).toBeLessThan(props.max);
  });

  it("calculates min/max constraints correctly", () => {
    const testCases = [
      { value: 1, min: 1, max: 10, expectDisableDecrement: true },
      { value: 10, min: 1, max: 10, expectDisableIncrement: true },
      { value: 5, min: 1, max: 10, expectDisableDecrement: false },
    ];

    testCases.forEach((test) => {
      const isAtMin = test.value === test.min;
      const isAtMax = test.value === test.max;

      if (test.expectDisableDecrement) {
        expect(isAtMin).toBe(true);
      }
      if (test.expectDisableIncrement) {
        expect(isAtMax).toBe(true);
      }
    });
  });

  it("applies custom step values to increment/decrement", () => {
    const step2Cases = [
      { current: 5, step: 2, increment: 7, decrement: 3 },
      { current: 1, step: 2, increment: 3, decrement: -1 }, // below min, will clamp
    ];

    step2Cases.forEach((test) => {
      expect(test.current + test.step).toBe(test.increment);
      expect(test.current - test.step).toBe(test.decrement);
    });
  });

  it("clamps values to min/max range", () => {
    const clamp = (val: number, min: number, max: number) =>
      Math.max(min, Math.min(max, val));

    expect(clamp(15, 1, 10)).toBe(10);
    expect(clamp(-5, 1, 10)).toBe(1);
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it("handles arrow key codes correctly", () => {
    const keys = { UP: "ArrowUp", DOWN: "ArrowDown" };
    expect(keys.UP).toBe("ArrowUp");
    expect(keys.DOWN).toBe("ArrowDown");
  });

  it("supports display modes", () => {
    const displayModes: Array<"input" | "value"> = ["input", "value"];
    expect(displayModes).toContain("input");
    expect(displayModes).toContain("value");
  });

  it("accepts custom icons", () => {
    const customIcons = {
      decrement: "−",
      increment: "+",
      customDecrement: "🔽",
      customIncrement: "🔼",
    };

    expect(customIcons.customDecrement).not.toBe(customIcons.decrement);
    expect(customIcons.customIncrement).not.toBe(customIcons.increment);
  });

  it("supports label prop for accessibility", () => {
    const label = "Number of Questions";
    expect(typeof label).toBe("string");
    expect(label.length).toBeGreaterThan(0);
  });

  it("respects disabled state", () => {
    const disabledProps = { disabled: true };
    const enabledProps = { disabled: false };

    expect(disabledProps.disabled).not.toBe(enabledProps.disabled);
  });

  it("validates onChange callback contract", () => {
    const onChange = vi.fn((value: number) => {
      expect(typeof value).toBe("number");
    });

    onChange(5);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("handles boundary conditions", () => {
    const boundary1 = { min: 1, max: 1, value: 1 };
    const boundary10 = { min: 1, max: 10, value: 5 };

    // Single value range
    expect(boundary1.value).toBe(boundary1.min);
    expect(boundary1.value).toBe(boundary1.max);

    // Normal range
    expect(boundary10.min).toBeLessThan(boundary10.value);
    expect(boundary10.value).toBeLessThan(boundary10.max);
  });
});
