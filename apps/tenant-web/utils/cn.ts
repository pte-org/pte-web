export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, unknown>
  | ((...args: never[]) => string | undefined);

const stringify = (value: ClassValue, args: never[]): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "function") return value(...args) ?? "";
  if (Array.isArray(value)) return value.map((item) => stringify(item, args)).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => name)
      .join(" ");
  }
  return "";
};

export function cn(...classes: ClassValue[]): string;
export function cn(...classes: ClassValue[]): (...args: never[]) => string;
export function cn(...classes: ClassValue[]): string | ((...args: never[]) => string) {
  const hasFunction = classes.some((value) => typeof value === "function");
  if (hasFunction) {
    return (...args: never[]) => classes.map((value) => stringify(value, args)).filter(Boolean).join(" ");
  }
  return classes.map((value) => stringify(value, [])).filter(Boolean).join(" ");
}
