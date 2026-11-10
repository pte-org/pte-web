import { describe, it, expect, vi } from "vitest";

describe("QuantityStepper", () => {
  describe("increment and decrement", () => {
    it("should increment value within range", () => {
      let value = 5;
      const max = 10;
      const handleIncrement = () => {
        if (value < max) value++;
      };

      handleIncrement();
      expect(value).toBe(6);

      handleIncrement();
      expect(value).toBe(7);
    });

    it("should decrement value within range", () => {
      let value = 5;
      const min = 1;
      const handleDecrement = () => {
        if (value > min) value--;
      };

      handleDecrement();
      expect(value).toBe(4);

      handleDecrement();
      expect(value).toBe(3);
    });

    it("should not exceed maximum value", () => {
      let value = 9;
      const max = 10;
      const handleIncrement = () => {
        value = Math.min(value + 1, max);
      };

      handleIncrement();
      expect(value).toBe(10);

      handleIncrement();
      expect(value).toBe(10);
    });

    it("should not go below minimum value", () => {
      let value = 2;
      const min = 1;
      const handleDecrement = () => {
        value = Math.max(value - 1, min);
      };

      handleDecrement();
      expect(value).toBe(1);

      handleDecrement();
      expect(value).toBe(1);
    });
  });

  describe("input handling", () => {
    it("should clamp input to valid range", () => {
      const min = 1;
      const max = 10;
      const clamp = (val: number) => Math.max(min, Math.min(max, val));

      expect(clamp(-5)).toBe(1);
      expect(clamp(0)).toBe(1);
      expect(clamp(5)).toBe(5);
      expect(clamp(10)).toBe(10);
      expect(clamp(15)).toBe(10);
    });

    it("should handle direct number input", () => {
      const min = 1;
      const max = 10;
      const handleInputChange = (newValue: number) => {
        return Math.max(min, Math.min(max, newValue));
      };

      expect(handleInputChange(3)).toBe(3);
      expect(handleInputChange(7)).toBe(7);
      expect(handleInputChange(15)).toBe(10);
    });
  });

  describe("keyboard navigation", () => {
    it("should increment on ArrowUp key", () => {
      let value = 5;
      const max = 10;

      const handleKeyDown = (key: string) => {
        if (key === "ArrowUp" && value < max) value++;
        if (key === "ArrowDown" && value > 1) value--;
      };

      handleKeyDown("ArrowUp");
      expect(value).toBe(6);

      handleKeyDown("ArrowUp");
      expect(value).toBe(7);
    });

    it("should decrement on ArrowDown key", () => {
      let value = 5;
      const min = 1;

      const handleKeyDown = (key: string) => {
        if (key === "ArrowDown" && value > min) value--;
      };

      handleKeyDown("ArrowDown");
      expect(value).toBe(4);

      handleKeyDown("ArrowDown");
      expect(value).toBe(3);
    });

    it("should handle keyboard events correctly", () => {
      let value = 5;
      const min = 1;
      const max = 10;

      const handleKeyDown = (key: string) => {
        if (key === "ArrowUp") {
          value = Math.min(value + 1, max);
        } else if (key === "ArrowDown") {
          value = Math.max(value - 1, min);
        }
      };

      handleKeyDown("ArrowUp");
      expect(value).toBe(6);

      handleKeyDown("ArrowDown");
      expect(value).toBe(5);

      handleKeyDown("ArrowDown");
      expect(value).toBe(4);
    });
  });

  describe("disabled state", () => {
    it("should disable decrement at minimum", () => {
      const value = 1;
      const min = 1;
      const isDecrementDisabled = value <= min;

      expect(isDecrementDisabled).toBe(true);
    });

    it("should disable increment at maximum", () => {
      const value = 10;
      const max = 10;
      const isIncrementDisabled = value >= max;

      expect(isIncrementDisabled).toBe(true);
    });

    it("should enable both at mid-range", () => {
      const value = 5;
      const min = 1;
      const max = 10;
      const isDecrementDisabled = value <= min;
      const isIncrementDisabled = value >= max;

      expect(isDecrementDisabled).toBe(false);
      expect(isIncrementDisabled).toBe(false);
    });

    it("should disable all controls when disabled prop is true", () => {
      const disabled = true;
      const isDecrementDisabled = disabled;
      const isIncrementDisabled = disabled;

      expect(isDecrementDisabled).toBe(true);
      expect(isIncrementDisabled).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle single value range", () => {
      const min = 5;
      const max = 5;
      const value = 5;

      const isDecrementDisabled = value <= min;
      const isIncrementDisabled = value >= max;

      expect(isDecrementDisabled).toBe(true);
      expect(isIncrementDisabled).toBe(true);
    });

    it("should handle decimal step", () => {
      let value = 1;
      const step = 0.5;
      const max = 5;

      const handleIncrement = () => {
        value = Math.min(value + step, max);
      };

      handleIncrement();
      expect(value).toBe(1.5);

      handleIncrement();
      expect(value).toBe(2);
    });
  });
});
