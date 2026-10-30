import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { CheckIcon } from "./icons";

export interface AuthTextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> {
  id: string;
  label: string;
  /** Leading icon; it takes the brand colour and grows slightly while the field has focus. */
  icon: ReactNode;
  /** Helper text under the field. */
  hint?: ReactNode;
  /** Control rendered after the filled tick, e.g. a show-password button. */
  trailing?: ReactNode;
  /** Validation message; turns the field red, replaces the hint and hides the tick. */
  error?: string;
}

/**
 * Sign-in text field: label above a 50px control with a focus glow, an icon that lights up on
 * focus and a tick that pops in once the field has valid content. With `error` the field turns
 * red and the message is announced via `aria-describedby`.
 */
export const AuthTextField = ({
  id,
  label,
  icon,
  hint,
  trailing,
  error,
  value,
  ...inputProps
}: AuthTextFieldProps): ReactElement => {
  const filled =
    typeof value === "string" ? value.length > 0 : value !== undefined && value !== null;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[var(--ink-secondary)]">
        {label}
      </label>
      <div
        className={cn(
          "group flex h-[50px] items-center gap-2.5 rounded-[10px] border-[1.5px] bg-[var(--surface-card)] px-3.5 transition-[border-color,box-shadow] duration-200 focus-within:ring-4",
          error
            ? "border-[var(--blush-action)] focus-within:border-[var(--blush-action)] focus-within:ring-[var(--blush-action)]/15"
            : "border-[var(--control-border)] focus-within:border-[var(--brand)] focus-within:ring-[var(--brand)]/15",
        )}
      >
        <span
          className={cn(
            "flex shrink-0 transition-[color,transform] duration-200 group-focus-within:scale-110 [&>svg]:h-[18px] [&>svg]:w-[18px]",
            error
              ? "text-[var(--blush-action)]"
              : "text-[var(--ink-muted)] group-focus-within:text-[var(--brand)]",
          )}
        >
          {icon}
        </span>
        <input
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
          className="h-full w-full min-w-0 bg-transparent text-[15px] text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-muted)]"
        />
        <span
          aria-hidden="true"
          className={cn(
            "flex shrink-0 text-[var(--mint-action)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.3,1.6,0.5,1)]",
            filled && !error ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <CheckIcon className="h-[18px] w-[18px]" />
        </span>
        {trailing}
      </div>
      {error ? (
        <p
          id={errorId}
          className="animate-pte-fade-up text-[12.5px] font-medium text-[var(--blush-action)]"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-[12.5px] text-[var(--ink-muted)]">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

export type AuthSubmitButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "type"
>;

/** Full-width sign-in button whose gradient slides on hover and which presses in on click. */
export const AuthSubmitButton = ({
  children,
  ...buttonProps
}: AuthSubmitButtonProps): ReactElement => (
  <button
    type="submit"
    {...buttonProps}
    className="h-[50px] w-full rounded-[10px] bg-[linear-gradient(90deg,var(--action-gradient-start),var(--action-gradient-mid),var(--action-gradient-end),var(--action-gradient-start))] bg-[length:200%_100%] bg-left text-[15px] font-semibold text-white shadow-lg shadow-action/30 transition-[background-position,transform,opacity] duration-500 hover:bg-right active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
  >
    {children}
  </button>
);
