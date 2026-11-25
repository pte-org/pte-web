export interface ProgramDateRangeText {
  ongoing: string;
  untilDate: (date: string) => string;
}

export function formatProgramDate(value: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) {
    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatProgramDateRange(
  startDate: string | null,
  endDate: string | null,
  text: ProgramDateRangeText,
): string {
  const formattedStart = formatProgramDate(startDate);
  const formattedEnd = formatProgramDate(endDate);

  if (formattedStart && formattedEnd) return `${formattedStart} – ${formattedEnd}`;
  if (formattedStart) return `${formattedStart} – ${text.ongoing}`;
  if (formattedEnd) return text.untilDate(formattedEnd);
  return text.ongoing;
}
