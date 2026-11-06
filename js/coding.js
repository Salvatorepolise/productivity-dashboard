import { loadCodingLogFromStorage, saveCodingLogToStorage } from "./storage.js";
import { toDateKey, addDays, isValidDateKey } from "./habits-logic.js";
import { normalizeCodingLog, setMinutesForDay, parseMinutesInput, CODING_HISTORY_DAYS, MAX_MINUTES_PER_DAY } from "./coding-logic.js";

export let codingLog = {};

/**
 * Day 43: minutes are stored per day.
 * Before Day 43 only "todayMinutes" existed; it is moved into the log
 * if it belongs to today (lastActiveDate is checked before the daily reset).
 */
export function initCoding() {
  const saved = loadCodingLogFromStorage();

  if (saved) {
    codingLog = normalizeCodingLog(saved);
  } else {
    const today = toDateKey(new Date());
    const oldMinutes = Number(localStorage.getItem("todayMinutes"));
    const isToday = localStorage.getItem("lastActiveDate") === today;
    codingLog = normalizeCodingLog(isToday ? { [today]: oldMinutes } : {});
  }

  localStorage.removeItem("todayMinutes");
  saveCodingLogToStorage(codingLog);
}

export function getTodayMinutes() {
  return codingLog[toDateKey(new Date())] ?? 0;
}

export function setTodayMinutes(minutes) {
  codingLog = setMinutesForDay(codingLog, toDateKey(new Date()), minutes);
  saveCodingLogToStorage(codingLog);
}

/** Replace a daily total only when both date and minutes are valid. */
export function saveCodingDay(dateKey, minutes, now = new Date()) {
  const oldest = toDateKey(addDays(now, -(CODING_HISTORY_DAYS - 1)));
  if (!isValidDateKey(dateKey) || dateKey < oldest || dateKey > toDateKey(now)
    || !Number.isInteger(minutes) || minutes < 0 || minutes > MAX_MINUTES_PER_DAY) {
    return false;
  }
  const nextLog = setMinutesForDay(codingLog, dateKey, minutes, now);
  saveCodingLogToStorage(nextLog);
  codingLog = nextLog;
  return true;
}

/** Add to the current local day, even when the tab was left open overnight. */
export function addTodayMinutes(minutes, now = new Date()) {
  if (!Number.isInteger(minutes) || minutes <= 0) return 0;
  const today = toDateKey(now);
  const previous = codingLog[today] ?? 0;
  const total = parseMinutesInput(previous + minutes);
  codingLog = setMinutesForDay(codingLog, today, total, now);
  saveCodingLogToStorage(codingLog);
  return total - previous;
}

/** Backup import (raw data is validated by normalizeCodingLog) */
export function replaceCodingLog(raw) {
  codingLog = normalizeCodingLog(raw);
  saveCodingLogToStorage(codingLog);
}
