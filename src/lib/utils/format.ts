/**
 * Formatting helpers for display strings.
 */

/** Formats XP with commas, e.g. 1500 → "1,500 XP" */
export function formatXP(xp: number): string {
  return `${xp.toLocaleString()} XP`;
}

/** Formats a duration in seconds as "m:ss" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Returns ordinal suffix for a number: 1 → "1st", 2 → "2nd" etc. */
export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Capitalises the first letter of a string. */
export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Truncates a string to maxLength and appends "…" if needed. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/** Returns a level label like "Level 12" */
export function levelLabel(level: number): string {
  return `Level ${level}`;
}

/** Returns streak display string with fire emoji thresholds. */
export function streakLabel(streak: number): string {
  if (streak === 0) return '0 days';
  if (streak === 1) return '1 day';
  if (streak >= 30) return `${streak} days 🔥🔥🔥`;
  if (streak >= 7) return `${streak} days 🔥🔥`;
  if (streak >= 3) return `${streak} days 🔥`;
  return `${streak} days`;
}
