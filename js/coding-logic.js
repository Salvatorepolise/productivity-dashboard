/**
 * Pure coding-time logic — no DOM, no localStorage (Day 43).
 * Coding log: { "YYYY-MM-DD": minutes }, last CODING_HISTORY_DAYS days.
 */

import { toDateKey, addDays, isValidDateKey } from "./habits-logic.js";

export const CODING_HISTORY_DAYS = 30;
export const MAX_MINUTES_PER_DAY = 1440;

/** Input value → whole minutes between 0 and 1440 (empty/invalid → 0) */
export function parseMinutesInput(value) {
  const minutes = Math.round(Number(value));
  if (!Number.isFinite(minutes) || minutes < 0) return 0;
  return Math.min(minutes, MAX_MINUTES_PER_DAY);
}

/** Keeps valid days inside the window; days with 0 minutes are dropped */
export function normalizeCodingLog(raw, now = new Date()) {
  const log = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return log;

  const today = toDateKey(now);
  const oldest = toDateKey(addDays(now, -(CODING_HISTORY_DAYS - 1)));

  for (const [dateKey, value] of Object.entries(raw)) {
    if (!isValidDateKey(dateKey) || dateKey < oldest || dateKey > today) {
      continue;
    }
    if (typeof value !== "number") continue;

    const minutes = parseMinutesInput(value);
    if (minutes > 0) log[dateKey] = minutes;
  }

  return log;
}

export function setMinutesForDay(log, dateKey, minutes, now = new Date()) {
  return normalizeCodingLog({ ...log, [dateKey]: minutes }, now);
}

/** Last `days` days, oldest first: [{ dateKey, minutes, isToday }] */
export function getLastDaysMinutes(log, now = new Date(), days = 7) {
  const today = toDateKey(now);
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const dateKey = toDateKey(addDays(now, -i));
    result.push({ dateKey, minutes: log[dateKey] ?? 0, isToday: dateKey === today });
  }
  return result;
}

export function getWeekSummary(log, goalMinutes, now = new Date()) {
  const days = getLastDaysMinutes(log, now);
  return {
    total: days.reduce((sum, day) => sum + day.minutes, 0),
    goalDays: days.filter((day) => day.minutes >= goalMinutes).length,
  };
}

/** "125" → "2h 5m", "45" → "45m" */
export function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}m`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}
