"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Button } from "./Button";
import { cn } from "../utils/cn";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Custom label for the field (for accessibility) */
  label?: string;
  /** Display the value in the button or as input */
  displayMode?: "input" | "value";
  /** Custom decrement button content */
  decrementIcon?: ReactNode;
  /** Custom increment button content */
  incrementIcon?: ReactNode;
}

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 10,
  step = 1,
  disabled = false,
  label,
  displayMode = "input",
  decrementIcon = "−",
  incrementIcon = "+",
}: QuantityStepperProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleDecrement = () => {
    const newValue = Math.max(min, localValue - step);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, localValue + step);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleInputChange = (newValue: number) => {
    const clamped = Math.max(min, Math.min(max, newValue));
    setLocalValue(clamped);
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const isDecrementDisabled = disabled || localValue <= min;
  const isIncrementDisabled = disabled || localValue >= max;

  return (
    <div className="flex items-center gap-2">
      {label && <label className="text-sm font-medium text-gray-900">{label}</label>}
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDecrement}
          disabled={isDecrementDisabled}
          className="rounded-none border-r border-gray-300 px-3 py-2 h-10 min-w-[40px]"
          aria-label="Decrease quantity"
          type="button"
        >
          {decrementIcon}
        </Button>

        {displayMode === "input" ? (
          <input
            type="number"
            value={localValue}
            onChange={(e) => handleInputChange(Number(e.target.value))}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              "w-16 text-center text-sm font-medium py-2 border-none outline-none",
              "bg-white text-gray-900",
              "[appearance:textfield]",
              "[&::-webkit-outer-spin-button]:appearance-none",
              "[&::-webkit-inner-spin-button]:appearance-none",
              disabled && "bg-gray-100 cursor-not-allowed",
            )}
            aria-label={label || "Quantity"}
          />
        ) : (
          <div className="w-16 text-center text-sm font-medium py-2 text-gray-900">
            {localValue}
          </div>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={handleIncrement}
          disabled={isIncrementDisabled}
          className="rounded-none border-l border-gray-300 px-3 py-2 h-10 min-w-[40px]"
          aria-label="Increase quantity"
          type="button"
        >
          {incrementIcon}
        </Button>
      </div>
    </div>
  );
};
