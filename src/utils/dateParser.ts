export function parseDDMMYYYY(dateStr: string): Date | null {
  const [dd, mm, yyyy] = dateStr.split("-").map(Number);

  if (!dd || !mm || !yyyy) return null;

  const date = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (isNaN(date.getTime())) return null;

  return date;
}
