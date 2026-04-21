const TZ = "Africa/Nairobi";

export function nairobiToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export function nairobiHour(): number {
  const raw = new Date().toLocaleString("en-US", {
    timeZone: TZ,
    hour: "numeric",
    hour12: false,
  });
  const n = parseInt(raw, 10);
  return isNaN(n) ? new Date().getHours() : n;
}

export function nairobiDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function nairobiDateLabel(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    ...options,
    timeZone: TZ,
  });
}

export function nairobiDisplayDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    ...options,
    timeZone: TZ,
  });
}

export function nairobiTimestamp(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
