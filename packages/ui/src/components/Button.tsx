import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonAppearance = "fill" | "outline" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  isLoading?: boolean;
  isPending?: boolean;
  isDisabled?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  iconOnly?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, Record<ButtonAppearance, string>> = {
  primary: {
    fill: "border border-transparent bg-action text-[var(--action-foreground)] hover:bg-action-hover active:bg-action-active",
    outline:
      "border border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)]",
    ghost: "border border-transparent bg-transparent text-[var(--action)] hover:bg-[var(--action-tint)]",
  },
  secondary: {
    fill: "border border-transparent bg-action-tint text-action hover:bg-action-tint-hover",
    outline:
      "border border-[var(--control-border)] bg-[var(--surface-card)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]",
    ghost: "border border-transparent bg-transparent text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]",
  },
  danger: {
    fill: "border border-transparent bg-[var(--blush-tint)] text-[var(--blush-action)] hover:brightness-95",
    outline:
      "border border-[var(--blush-action)]/40 bg-[var(--surface-card)] text-[var(--blush-action)] hover:bg-[var(--blush-tint)]",
    ghost: "border border-transparent bg-transparent text-[var(--blush-action)] hover:bg-[var(--blush-tint)]",
  },
  ghost: {
    fill: "border border-transparent bg-transparent text-[var(--action)] hover:bg-[var(--action-tint)]",
    outline:
      "border border-transparent bg-transparent text-[var(--action)] hover:bg-[var(--action-tint)]",
    ghost: "border border-transparent bg-transparent text-[var(--action)] hover:bg-[var(--action-tint)]",
  },
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = ({
  variant = "primary",
  appearance,
  size = "md",
  isLoading = false,
  isPending = false,
  isDisabled = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  iconOnly = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps): ReactElement => {
  const busy = isLoading || isPending;
  const resolvedAppearance = appearance ?? (variant === "secondary" ? "outline" : "fill");

  return (
    <button
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,border-color,box-shadow,filter,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-[var(--shell-border)] disabled:bg-[var(--surface-subtle)] disabled:text-[var(--ink-muted)]",
        VARIANT_CLASSES[variant][resolvedAppearance],
        SIZE_CLASSES[size],
        iconOnly && "aspect-square px-0",
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isDisabled || busy}
      aria-busy={busy || undefined}
      {...props}
    >
      {busy && (
        <span
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin motion-reduce:opacity-70"
          aria-hidden="true"
        />
      )}
      {!busy && leftIcon}
      <span>{busy && loadingText ? loadingText : children}</span>
      {!busy && rightIcon}
    </button>
  );
};
