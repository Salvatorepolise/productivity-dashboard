import { loadCodingLogFromStorage, saveCodingLogToStorage } from "./storage.js";
import { toDateKey } from "./habits-logic.js";
import { normalizeCodingLog, setMinutesForDay } from "./coding-logic.js";

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

/** Backup import (raw data is validated by normalizeCodingLog) */
export function replaceCodingLog(raw) {
  codingLog = normalizeCodingLog(raw);
  saveCodingLogToStorage(codingLog);
}
