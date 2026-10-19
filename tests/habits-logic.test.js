import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getHabitStats,
  toDateKey,
  getPreviousDateKey,
  getCurrentStreak,
  applyCompletionTransition,
  ensureUniqueIds,
  addDays,
  isValidDateKey,
  trimHistory,
  deriveHistoryFromStreak,
  normalizeHistory,
  getLastDays,
  HISTORY_DAYS,
} from "../js/habits-logic.js";

// Fixed "now" so tests do not depend on the real date
const now = new Date(2026, 9, 14, 10, 0); // 14 Oct 2026, local time
const TODAY = "2026-10-14";
const YESTERDAY = "2026-10-13";

function habit(overrides = {}) {
  return {
    id: "h1",
    name: "Reading",
    completed: false,
    streak: 0,
    lastCompletedDate: null,
    ...overrides,
  };
}

// ===== Dates =====

test("toDateKey uses the local calendar day", () => {
  assert.equal(toDateKey(now), TODAY);
  assert.equal(toDateKey(new Date(2026, 0, 5, 23, 59)), "2026-01-05");
});

test("getPreviousDateKey crosses month and year boundaries", () => {
  assert.equal(getPreviousDateKey(now), YESTERDAY);
  assert.equal(getPreviousDateKey(new Date(2026, 2, 1)), "2026-02-28");
  assert.equal(getPreviousDateKey(new Date(2027, 0, 1)), "2026-12-31");
});

// ===== Completing a habit =====

test("first completion starts a streak of 1", () => {
  const result = applyCompletionTransition(habit(), true, now);
  assert.equal(result.completed, true);
  assert.equal(result.streak, 1);
  assert.equal(result.lastCompletedDate, TODAY);
});

test("completing after yesterday extends the streak", () => {
  const h = habit({ streak: 3, lastCompletedDate: YESTERDAY });
  const result = applyCompletionTransition(h, true, now);
  assert.equal(result.streak, 4);
  assert.equal(result.lastCompletedDate, TODAY);
});

test("completing after a missed day restarts the streak", () => {
  const h = habit({ streak: 5, lastCompletedDate: "2026-10-01" });
  const result = applyCompletionTransition(h, true, now);
  assert.equal(result.streak, 1);
});

test("streak grows at most once per day", () => {
  const h = habit({ streak: 4, lastCompletedDate: TODAY });
  const result = applyCompletionTransition(h, true, now);
  assert.equal(result.streak, 4);
  assert.equal(result.completed, true);
});

// ===== Unchecking a habit =====

test("check then uncheck today restores the previous streak", () => {
  const start = habit({ streak: 3, lastCompletedDate: YESTERDAY });
  const checked = applyCompletionTransition(start, true, now);
  const unchecked = applyCompletionTransition(checked, false, now);

  assert.equal(unchecked.completed, false);
  assert.equal(unchecked.streak, 3);
  assert.equal(unchecked.lastCompletedDate, YESTERDAY);
});

test("check then uncheck a new streak leaves no streak", () => {
  const checked = applyCompletionTransition(habit(), true, now);
  const unchecked = applyCompletionTransition(checked, false, now);

  assert.equal(unchecked.streak, 0);
  assert.equal(unchecked.lastCompletedDate, null);
});

test("check, uncheck, check again gives the same streak", () => {
  const start = habit({ streak: 2, lastCompletedDate: YESTERDAY });
  let h = applyCompletionTransition(start, true, now);
  h = applyCompletionTransition(h, false, now);
  h = applyCompletionTransition(h, true, now);
  assert.equal(h.streak, 3);
});

test("does not mutate the original habit", () => {
  const start = habit({ streak: 2, lastCompletedDate: YESTERDAY });
  applyCompletionTransition(start, true, now);
  assert.equal(start.streak, 2);
  assert.equal(start.completed, false);
});

// ===== Displayed streak =====

test("current streak is kept if completed today or yesterday", () => {
  assert.equal(
    getCurrentStreak(habit({ streak: 4, lastCompletedDate: TODAY }), now),
    4,
  );
  assert.equal(
    getCurrentStreak(habit({ streak: 3, lastCompletedDate: YESTERDAY }), now),
    3,
  );
});

test("current streak is 0 after a missed day", () => {
  const h = habit({ streak: 5, lastCompletedDate: "2026-10-01" });
  assert.equal(getCurrentStreak(h, now), 0);
  assert.equal(getCurrentStreak(habit(), now), 0);
});

// ===== Ids =====

test("ensureUniqueIds replaces duplicate and missing ids", () => {
  let n = 0;
  const createId = () => `new-${++n}`;
  const result = ensureUniqueIds(
    [{ id: "reading" }, { id: "reading" }, { id: "" }, { id: "coding" }],
    createId,
  );
  assert.deepEqual(
    result.map((h) => h.id),
    ["reading", "new-1", "new-2", "coding"],
  );
});

// ===== Stats =====

test("getHabitStats counts and rounds the percentage", () => {
  const stats = getHabitStats([
    habit({ completed: true }),
    habit({ completed: false }),
    habit({ completed: false }),
  ]);
  assert.deepEqual(stats, {
    total: 3,
    completed: 1,
    remaining: 2,
    percentage: 33,
  });
});

test("getHabitStats handles an empty list", () => {
  assert.equal(getHabitStats([]).percentage, 0);
});

// ===== History (Day 42) =====

test("isValidDateKey rejects bad formats and impossible dates", () => {
  assert.equal(isValidDateKey("2026-10-14"), true);
  assert.equal(isValidDateKey("2026-02-31"), false);
  assert.equal(isValidDateKey("2026-1-5"), false);
  assert.equal(isValidDateKey(20261014), false);
  assert.equal(isValidDateKey(null), false);
});

test("completing a habit adds today to its history once", () => {
  let h = applyCompletionTransition(habit({ history: ["2026-10-10"] }), true, now);
  assert.deepEqual(h.history, ["2026-10-10", TODAY]);

  // check → uncheck → check: still one entry for today
  h = applyCompletionTransition(h, false, now);
  h = applyCompletionTransition(h, true, now);
  assert.deepEqual(h.history, ["2026-10-10", TODAY]);
});

test("unchecking today removes today from the history", () => {
  const checked = applyCompletionTransition(
    habit({ streak: 1, lastCompletedDate: YESTERDAY, history: [YESTERDAY] }),
    true,
    now,
  );
  const unchecked = applyCompletionTransition(checked, false, now);
  assert.deepEqual(unchecked.history, [YESTERDAY]);
});

test("history keeps only the last 30 days", () => {
  const old = toDateKey(addDays(now, -HISTORY_DAYS)); // 31 days ago
  const edge = toDateKey(addDays(now, -(HISTORY_DAYS - 1))); // 30 days ago, kept
  const result = applyCompletionTransition(habit({ history: [old, edge] }), true, now);
  assert.deepEqual(result.history, [edge, TODAY]);
});

test("trimHistory dedupes, sorts and drops future days", () => {
  assert.deepEqual(
    trimHistory([TODAY, YESTERDAY, TODAY, "2026-10-20"], now),
    [YESTERDAY, TODAY],
  );
});

test("old data gets a history rebuilt from its streak", () => {
  assert.deepEqual(
    deriveHistoryFromStreak(habit({ streak: 3, lastCompletedDate: YESTERDAY })),
    ["2026-10-11", "2026-10-12", YESTERDAY],
  );
  assert.deepEqual(deriveHistoryFromStreak(habit()), []);
});

test("rebuilt history crosses month boundaries", () => {
  assert.deepEqual(
    deriveHistoryFromStreak(habit({ streak: 3, lastCompletedDate: "2026-10-01" })),
    ["2026-09-29", "2026-09-30", "2026-10-01"],
  );
});

test("normalizeHistory keeps saved history and filters invalid entries", () => {
  const h = habit({
    streak: 9,
    lastCompletedDate: TODAY,
    history: [TODAY, "nope", "2026-02-31", 42, YESTERDAY],
  });
  // saved history wins over the streak
  assert.deepEqual(normalizeHistory(h, now), [YESTERDAY, TODAY]);
});

test("normalizeHistory derives history when there is none", () => {
  const h = habit({ streak: 2, lastCompletedDate: TODAY });
  assert.deepEqual(normalizeHistory(h, now), [YESTERDAY, TODAY]);
});

test("getLastDays returns 7 days, oldest first, marking today", () => {
  const days = getLastDays(habit({ history: ["2026-10-08", YESTERDAY] }), now);

  assert.equal(days.length, 7);
  assert.equal(days[0].dateKey, "2026-10-08");
  assert.equal(days[6].dateKey, TODAY);
  assert.deepEqual(
    days.map((d) => d.done),
    [true, false, false, false, false, true, false],
  );
  assert.deepEqual(
    days.map((d) => d.isToday),
    [false, false, false, false, false, false, true],
  );
});
