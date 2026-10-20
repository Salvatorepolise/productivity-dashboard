import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseMinutesInput,
  normalizeCodingLog,
  setMinutesForDay,
  getLastDaysMinutes,
  getWeekSummary,
  formatMinutes,
  CODING_HISTORY_DAYS,
} from "../js/coding-logic.js";
import { toDateKey, addDays } from "../js/habits-logic.js";

const now = new Date(2026, 9, 20, 10, 0); // 20 Oct 2026, local time
const TODAY = "2026-10-20";

// ===== Input =====

test("parseMinutesInput rounds and clamps to 0–1440", () => {
  assert.equal(parseMinutesInput("45"), 45);
  assert.equal(parseMinutesInput("45.6"), 46);
  assert.equal(parseMinutesInput("2000"), 1440);
  assert.equal(parseMinutesInput("-30"), 0);
  assert.equal(parseMinutesInput(""), 0);
  assert.equal(parseMinutesInput("abc"), 0);
});

// ===== Log =====

test("normalizeCodingLog keeps valid days inside the 30-day window", () => {
  const tooOld = toDateKey(addDays(now, -CODING_HISTORY_DAYS));
  const oldestKept = toDateKey(addDays(now, -(CODING_HISTORY_DAYS - 1)));

  const log = normalizeCodingLog(
    {
      [TODAY]: 60,
      [oldestKept]: 30,
      [tooOld]: 30,
      "2026-10-21": 10, // future
      "2026-02-31": 10, // impossible date
      "not-a-date": 10,
      "2026-10-19": "60", // not a number
      "2026-10-18": 0, // empty day
      "2026-10-17": 5000, // clamped
    },
    now,
  );

  assert.deepEqual(log, {
    [TODAY]: 60,
    [oldestKept]: 30,
    "2026-10-17": 1440,
  });
});

test("normalizeCodingLog returns {} for non-objects", () => {
  assert.deepEqual(normalizeCodingLog(null, now), {});
  assert.deepEqual(normalizeCodingLog([1, 2], now), {});
  assert.deepEqual(normalizeCodingLog("60", now), {});
});

test("setMinutesForDay updates one day and removes it at 0", () => {
  let log = setMinutesForDay({}, TODAY, 30, now);
  assert.deepEqual(log, { [TODAY]: 30 });

  log = setMinutesForDay(log, TODAY, 75, now);
  assert.deepEqual(log, { [TODAY]: 75 });

  log = setMinutesForDay(log, TODAY, 0, now);
  assert.deepEqual(log, {});
});

test("setMinutesForDay does not mutate the input", () => {
  const log = { [TODAY]: 30 };
  setMinutesForDay(log, TODAY, 90, now);
  assert.deepEqual(log, { [TODAY]: 30 });
});

// ===== Week =====

test("getLastDaysMinutes returns 7 days, oldest first, with 0 for empty days", () => {
  const days = getLastDaysMinutes({ "2026-10-14": 20, [TODAY]: 90 }, now);

  assert.equal(days.length, 7);
  assert.equal(days[0].dateKey, "2026-10-14");
  assert.equal(days[6].dateKey, TODAY);
  assert.deepEqual(
    days.map((d) => d.minutes),
    [20, 0, 0, 0, 0, 0, 90],
  );
  assert.equal(days[6].isToday, true);
  assert.equal(days[0].isToday, false);
});

test("getWeekSummary sums the week and counts days at goal", () => {
  const log = {
    "2026-10-13": 500, // 8 days ago: outside the week
    "2026-10-14": 60,
    "2026-10-16": 30,
    "2026-10-19": 90,
  };
  assert.deepEqual(getWeekSummary(log, 60, now), { total: 180, goalDays: 2 });
});

test("formatMinutes shows hours and minutes", () => {
  assert.equal(formatMinutes(0), "0m");
  assert.equal(formatMinutes(45), "45m");
  assert.equal(formatMinutes(60), "1h");
  assert.equal(formatMinutes(125), "2h 5m");
});
