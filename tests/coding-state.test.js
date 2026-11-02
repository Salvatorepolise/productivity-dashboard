import { test } from "node:test";
import assert from "node:assert/strict";
import { addTodayMinutes, codingLog, initCoding } from "../js/coding.js";
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
