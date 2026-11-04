import test from "node:test";
import assert from "node:assert/strict";
import {
  getWeekMonday,
  getWeekDateKeys,
  getElapsedWeekDateKeys,
  getHabitsWeekStats,
  getCodingWeekStats,
  getDashboardWeekSummary,
} from "../js/week-summary-logic.js";
import { toDateKey } from "../js/habits-logic.js";

// Thursday 22 Oct 2026 local (fixed reference date).
const WED = new Date(2026, 9, 22, 15, 0, 0);

test("getWeekMonday is Monday of that week", () => {
  const monday = getWeekMonday(WED);
  assert.equal(toDateKey(monday), "2026-10-19");
});

test("getWeekDateKeys returns Mon–Sun", () => {
  assert.deepEqual(getWeekDateKeys(WED), [
    "2026-10-19",
    "2026-10-20",
    "2026-10-21",
    "2026-10-22",
    "2026-10-23",
    "2026-10-24",
    "2026-10-25",
  ]);
});

test("getElapsedWeekDateKeys stops at today", () => {
  assert.deepEqual(getElapsedWeekDateKeys(WED), [
    "2026-10-19",
    "2026-10-20",
    "2026-10-21",
    "2026-10-22",
  ]);
});

test("getHabitsWeekStats counts history slots", () => {
  const habits = [
    {
      id: "a",
      history: ["2026-10-19", "2026-10-20", "2026-10-22"],
    },
    {
      id: "b",
      history: ["2026-10-22"],
    },
  ];
  // 2 habits × 4 elapsed days = 8 slots; 3+1 = 4 done
  const stats = getHabitsWeekStats(habits, WED);
  assert.equal(stats.possibleSlots, 8);
  assert.equal(stats.completedSlots, 4);
  assert.equal(stats.percentage, 50);
});

test("getCodingWeekStats sums minutes in week", () => {
  const log = {
    "2026-10-19": 60,
    "2026-10-21": 30,
    "2026-10-22": 90,
  };
  const stats = getCodingWeekStats(log, 60, WED);
  assert.equal(stats.totalMinutes, 180);
  assert.equal(stats.daysLogged, 3);
  assert.equal(stats.goalDays, 2); // 60 and 90
});

test("getDashboardWeekSummary shape", () => {
  const summary = getDashboardWeekSummary([], {}, 60, WED);
  assert.equal(summary.weekStart, "2026-10-19");
  assert.equal(summary.weekEnd, "2026-10-25");
  assert.equal(summary.habits.possibleSlots, 0);
  assert.equal(summary.coding.totalMinutes, 0);
});

test("Wednesday comparison excludes later weekdays in both weeks across a month boundary", () => {
  const now = new Date(2026, 10, 4);
  const log = {
    "2026-10-26": 30, "2026-10-28": 45, "2026-10-29": 200,
    "2026-11-02": 60, "2026-11-04": 30, "2026-11-05": 100,
  };
  assert.equal(getDashboardWeekSummary([], log, 60, now).codingComparison,
    "Last week through Wednesday: 1h 15m · 15m more this week.");
});

test("Monday comparison distinguishes missing history, a tie and a decrease", () => {
  const now = new Date(2026, 0, 5);
  const compare = (log) => getDashboardWeekSummary([], log, 60, now).codingComparison;
  assert.match(compare({ "2025-12-30": 50 }), /No coding time logged through Monday/);
  assert.match(compare({ "2025-12-29": 30, "2026-01-05": 30 }), /same total this week/);
  assert.match(compare({ "2025-12-29": 30 }), /30m less this week/);
});

import { getWeekAwareInsight } from "../js/week-summary-logic.js";

test("getWeekAwareInsight: empty week after 2+ days", () => {
  const wed = new Date(2026, 9, 22, 15, 0, 0);
  const habits = [
    { id: "a", completed: false, history: [] },
    { id: "b", completed: false, history: [] },
  ];
  const msg = getWeekAwareInsight(habits, {}, 60, wed);
  assert.match(msg, /no completed habit slots/i);
});
