/** READ_ALOUD -> "Read Aloud": the template stores task types as codes; the table shows readable names. */
export const taskTypeLabel = (code: string): string =>
  code.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
