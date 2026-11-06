import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodayMinutes, codingLog, initCoding, saveCodingDay } from "../js/coding.js";
import { toDateKey, addDays } from "../js/habits-logic.js";

test("quick coding entries persist, cap totals and target the new local day", (t) => {
  const now = new Date();
  const today = toDateKey(now);
  const yesterday = toDateKey(addDays(now, -1));
  const storage = new Map([["codingLog", JSON.stringify({ [yesterday]: 45, [today]: 10 })]]);
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  });
  initCoding();
  assert.equal(addTodayMinutes(15, now), 15);
  assert.equal(addTodayMinutes(30, now), 30);
  assert.equal(codingLog[today], 55);
  assert.equal(codingLog[yesterday], 45);
  initCoding();
  assert.equal(codingLog[today], 55);
  for (const invalid of [-15, 0, NaN, Infinity, "15", 1.5]) {
    assert.equal(addTodayMinutes(invalid, now), 0);
    assert.equal(codingLog[today], 55);
  }
  addTodayMinutes(1375, now);
  assert.equal(addTodayMinutes(30, now), 10);
  assert.equal(codingLog[today], 1440);
  assert.equal(addTodayMinutes(15, now), 0);
  const tomorrow = addDays(now, 1);
  assert.equal(addTodayMinutes(15, tomorrow), 15);
  assert.equal(codingLog[toDateKey(tomorrow)], 15);
  assert.equal(codingLog[today], 1440);
  assert.deepEqual(JSON.parse(storage.get("codingLog")), codingLog);
});

test("history edits persist replacements, clear totals and reject invalid entries without changing data", (t) => {
  const storage = new Map();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  let failSave = false;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => {
        if (failSave) throw new Error("Storage unavailable");
        storage.set(key, value);
      },
      removeItem: (key) => storage.delete(key),
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  });
  initCoding();
  const now = new Date(2026, 0, 5, 12);
  assert.equal(saveCodingDay("2026-01-05", 30, now), true);
  assert.equal(saveCodingDay("2025-12-07", 1440, now), true); // oldest retained day
  assert.equal(saveCodingDay("2026-01-04", 90, now), true);
  assert.equal(saveCodingDay("2026-01-04", 45, now), true);
  assert.equal(codingLog["2026-01-04"], 45);
  const saved = { ...codingLog };
  for (const date of ["2025-12-06", "2026-01-06", "2025-02-30", "", "bad"]) {
    assert.equal(saveCodingDay(date, 20, now), false);
  }
  for (const minutes of [-1, 1441, 1.5, NaN, Infinity, "15"]) {
    assert.equal(saveCodingDay("2026-01-04", minutes, now), false);
  }
  assert.deepEqual(codingLog, saved);
  assert.deepEqual(JSON.parse(storage.get("codingLog")), saved);
  failSave = true;
  assert.throws(() => saveCodingDay("2026-01-04", 100, now));
  assert.deepEqual(codingLog, saved);
  failSave = false;
  assert.equal(saveCodingDay("2026-01-04", 0, now), true);
  assert.equal(codingLog["2026-01-04"], undefined);
  assert.equal(codingLog["2026-01-05"], 30);
  assert.deepEqual(JSON.parse(storage.get("codingLog")), codingLog);
});
