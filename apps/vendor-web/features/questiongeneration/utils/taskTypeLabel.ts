/** READ_ALOUD -> "Read Aloud": task types arrive as codes; the popup shows readable names. */
export const taskTypeLabel = (code: string): string =>
  code.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
