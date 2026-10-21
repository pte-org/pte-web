/** Replaces each `{key}` placeholder in a localized template with its value. */
export function fillTemplate(template: string, values: Record<string, number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template,
  );
}
