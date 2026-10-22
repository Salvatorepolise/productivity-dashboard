/**
 * Pure calendar-week summary (Mon–Sun, local dates).
 * Uses habit.history date keys + coding log { "YYYY-MM-DD": minutes }.
 */

import {
  toDateKey,
  addDays,
  fromDateKey,
  getHabitStats,
  getHabitInsightMessage,
} from "./habits-logic.js";
import { formatMinutes } from "./coding-logic.js";

/** Monday 00:00 local of the week that contains `now` */
export function getWeekMonday(now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = date.getDay(); // 0 Sun … 6 Sat
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(date, offset);
}

/** Seven local date keys Mon → Sun */
export function getWeekDateKeys(now = new Date()) {
  const monday = getWeekMonday(now);
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(monday, i)));
}

/**
 * Days in this week that are not in the future (today included).
 * Future weekdays do not count as missed.
 */
export function getElapsedWeekDateKeys(now = new Date()) {
  const today = toDateKey(now);
  return getWeekDateKeys(now).filter((key) => key <= today);
}

/**
 * Habits: each habit × each elapsed day in the week = one slot.
 * A slot is completed if habit.history includes that dateKey.
 */
export function getHabitsWeekStats(habits, now = new Date()) {
  const days = getElapsedWeekDateKeys(now);
  const list = Array.isArray(habits) ? habits : [];
  const possibleSlots = list.length * days.length;

  let completedSlots = 0;
  for (const habit of list) {
    const done = new Set(habit.history || []);
    for (const key of days) {
      if (done.has(key)) completedSlots += 1;
    }
  }

  return {
    daysElapsed: days.length,
    possibleSlots,
    completedSlots,
    percentage:
      possibleSlots === 0
        ? 0
        : Math.round((completedSlots / possibleSlots) * 100),
  };
}

export function getCodingWeekStats(log, goalMinutes, now = new Date()) {
  const days = getElapsedWeekDateKeys(now);
  const safeLog = log && typeof log === "object" ? log : {};
  const goal = Number(goalMinutes) > 0 ? Number(goalMinutes) : 60;

  let totalMinutes = 0;
  let daysLogged = 0;
  let goalDays = 0;

  for (const key of days) {
    const minutes = safeLog[key] ?? 0;
    if (minutes > 0) {
      totalMinutes += minutes;
      daysLogged += 1;
    }
    if (minutes >= goal) goalDays += 1;
  }

  return {
    totalMinutes,
    daysLogged,
    goalDays,
    daysElapsed: days.length,
    formattedTotal: formatMinutes(totalMinutes),
  };
}

/** Full dashboard week card model */
export function getDashboardWeekSummary(
  habits,
  codingLog,
  goalMinutes,
  now = new Date(),
) {
  const keys = getWeekDateKeys(now);
  return {
    weekStart: keys[0],
    weekEnd: keys[6],
    habits: getHabitsWeekStats(habits, now),
    coding: getCodingWeekStats(codingLog, goalMinutes, now),
  };
}

/** "2026-10-20" → short label for UI */
export function formatWeekRange(weekStart, weekEnd) {
  const start = fromDateKey(weekStart);
  const end = fromDateKey(weekEnd);
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en", opts)} – ${end.toLocaleDateString("en", opts)}`;
}

/**
 * Day 45: insight that can use this week's numbers.
 * Falls back to the normal daily insight when week context doesn't apply.
 */
export function getWeekAwareInsight(
  habits,
  codingLog,
  goalMinutes,
  now = new Date(),
) {
  const list = Array.isArray(habits) ? habits : [];
  if (list.length === 0) {
    return "Add your first habit to get started.";
  }

  const { percentage } = getHabitStats(list);
  if (percentage === 100) {
    return "All habits completed today. Great work!";
  }

  const week = getDashboardWeekSummary(list, codingLog, goalMinutes, now);
  const h = week.habits;

  if (h.possibleSlots > 0 && h.percentage === 0 && h.daysElapsed >= 2) {
    return "This week still has no completed habit slots. One check-in counts.";
  }

  if (h.possibleSlots > 0 && h.percentage >= 70 && percentage < 100) {
    return "Strong week so far — finish today's remaining habits.";
  }

  if (h.possibleSlots > 0 && h.percentage < 30 && h.daysElapsed >= 3) {
    return "This week's habit rate is low. A small win today helps.";
  }

  return getHabitInsightMessage(list);
}