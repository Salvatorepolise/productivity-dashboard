import { test } from "node:test";
import assert from "node:assert/strict";
import { filterGoals, getGoalStats, toggleGoalById } from "../js/goals-logic.js";
import { sanitizePreferences, savePreferences, loadPreferences } from "../js/preferences.js";
import { createBackup, parseBackup } from "../js/backup-logic.js";

const goals = [
  { id: "a", text: "Read", completed: false },
  { id: "b", text: "Code", completed: true },
  { id: "c", text: "Walk", completed: false },
];

test("goal filters preserve source order and full-list progress", () => {
  const original = structuredClone(goals);
  assert.deepEqual(filterGoals(goals, "remaining").map((g) => g.id), ["a", "c"]);
  assert.deepEqual(filterGoals(goals, "completed").map((g) => g.id), ["b"]);
  assert.deepEqual(filterGoals(goals, "all"), original);
  assert.deepEqual(filterGoals(goals, "invalid"), original);
  assert.deepEqual(filterGoals([], "remaining"), []);
  assert.deepEqual(goals, original);
  assert.deepEqual(getGoalStats(goals), { total: 3, completed: 1 });
  const toggled = toggleGoalById(goals, "a");
  assert.deepEqual(filterGoals(toggled, "remaining").map((g) => g.id), ["c"]);
  assert.deepEqual(filterGoals(toggled, "completed").map((g) => g.id), ["a", "b"]);
});

test("goal filters survive backup round-trips, with defaults for old or invalid preferences", () => {
  for (const status of ["all", "remaining", "completed"]) {
    const preferences = sanitizePreferences({ goalStatusFilter: status });
    const backup = createBackup({ habits: [], goals, notes: "", preferences }, new Date());
    const result = parseBackup(JSON.parse(JSON.stringify(backup)));
    assert.equal(result.ok, true);
    assert.equal(result.backup.preferences.goalStatusFilter, status);
    assert.deepEqual(result.backup.goals, goals);
  }
  for (const value of [undefined, null, "active", 1, {}]) {
    assert.equal(sanitizePreferences({ goalStatusFilter: value }).goalStatusFilter, "all");
  }
  const legacy = createBackup({ habits: [], goals, notes: "", preferences: { theme: "dark" } }, new Date());
  assert.equal(parseBackup(legacy).backup.preferences.goalStatusFilter, "all");
});

test("goal filter reloads from storage and survives unrelated preference changes", (t) => {
  const storage = new Map();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  });
  savePreferences({ goalStatusFilter: "remaining" });
  savePreferences({ theme: "dark" });
  assert.equal(loadPreferences().goalStatusFilter, "remaining");
  assert.equal(loadPreferences().theme, "dark");
});
