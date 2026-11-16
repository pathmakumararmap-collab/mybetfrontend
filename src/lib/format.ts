/** Display formatting. All functions are pure (safe for prerendering). */

export const TIME_ZONE = "Asia/Colombo";
export const CURRENCY = "LKR";

const kickoffFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false,
});
const clockFmt = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: true });
const dateFmt = new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, day: "numeric", month: "long", year: "numeric" });

/** "14 Nov, 20:45" in Sri Lanka time. */
export function formatKickoff(iso: string): string {
  const p: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of kickoffFmt.formatToParts(new Date(iso))) p[part.type] = part.value;
  return `${p.day} ${p.month}, ${p.hour}:${p.minute}`;
}

/** "02:30 PM" in Sri Lanka time. */
export function formatClock(date: Date): string {
  return clockFmt.format(date);
}

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

/** Decimal odds: up to 3 decimals, no trailing zeros ("1.936", "30", "1.5"). */
export function formatOdds(odds: number): string {
  return Number(odds.toFixed(3)).toString();
}

/** Line values such as 133.5 or 2.5. */
export function formatLine(line: number): string {
  return Number(line.toFixed(2)).toString();
}

const moneyFmt = new Intl.NumberFormat("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/** "LKR 1,250.50" from an amount in cents. */
export function formatMoney(cents: number): string {
  return `${CURRENCY} ${moneyFmt.format(cents / 100)}`;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
