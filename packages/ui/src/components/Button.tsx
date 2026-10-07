import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-white shadow-sm shadow-action/25 hover:bg-action-hover active:bg-action-active",
  secondary: "bg-action-tint text-action hover:bg-action-tint-hover",
  danger: "bg-[var(--blush-action)] text-white hover:brightness-110",
  ghost: "bg-transparent text-[var(--action)] hover:bg-[var(--action-tint)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps): ReactElement => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex transform-gpu select-none items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,box-shadow,filter,opacity,transform] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none disabled:bg-[var(--surface-subtle)] disabled:text-[var(--ink-muted)] disabled:shadow-none",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin motion-reduce:opacity-70"
          aria-hidden="true"
        />
      )}
      {!isLoading && leftIcon}
      <span>{isLoading && loadingText ? loadingText : children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
