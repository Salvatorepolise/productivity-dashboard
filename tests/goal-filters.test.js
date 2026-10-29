import { test } from "node:test";
import assert from "node:assert/strict";
import { filterGoals, sortGoals, getGoalStats, toggleGoalById } from "../js/goals-logic.js";
import { sanitizePreferences, savePreferences, loadPreferences } from "../js/preferences.js";
import { createBackup, parseBackup } from "../js/backup-logic.js";

const goals = [
  { id: "a", text: "Read", completed: false },
  { id: "b", text: "Code", completed: true },
  { id: "c", text: "Walk", completed: false },
];

test("goal sorting preserves stored order and combines with search and status", () => {
  const original = structuredClone(goals);
  assert.deepEqual(sortGoals(goals, "az").map((g) => g.id), ["b", "a", "c"]);
  assert.deepEqual(sortGoals(goals, "remaining").map((g) => g.id), ["a", "c", "b"]);
  assert.deepEqual(sortGoals(goals), original);
  assert.deepEqual(sortGoals(goals, "invalid"), original);
  assert.deepEqual(sortGoals([], "az"), []);
  assert.deepEqual(sortGoals(filterGoals(goals, "remaining", "a"), "az"), [goals[0], goals[2]]);
  assert.deepEqual(goals, original);
  const toggled = toggleGoalById(goals, "a");
  assert.deepEqual(sortGoals(toggled, "remaining").map((g) => g.id), ["c", "a", "b"]);
});

test("alphabetical goal sorting ignores case and keeps ties in original order", () => {
  const items = [
    { id: "1", text: "zebra", completed: false },
    { id: "2", text: "Apple", completed: true },
    { id: "3", text: "apple", completed: false },
  ];
  assert.deepEqual(sortGoals(items, "az").map((g) => g.id), ["2", "3", "1"]);
});

test("goal sort preferences survive backups and invalid or old values use original order", () => {
  for (const goalSortOption of ["default", "az", "remaining"]) {
    const preferences = sanitizePreferences({ goalSortOption });
    const backup = createBackup({ habits: [], goals, notes: "", preferences }, new Date());
    assert.equal(parseBackup(JSON.parse(JSON.stringify(backup))).backup.preferences.goalSortOption, goalSortOption);
  }
  for (const goalSortOption of [undefined, null, "completed", "invalid", 1]) {
    assert.equal(sanitizePreferences({ goalSortOption }).goalSortOption, "default");
  }
});

test("goal search combines with status, ignores case and trims the query", () => {
  const original = structuredClone(goals);
  assert.deepEqual(filterGoals(goals, "all", "  READ  "), [goals[0]]);
  assert.deepEqual(filterGoals(goals, "completed", "read"), []);
  assert.deepEqual(filterGoals(goals, "remaining", "a"), [goals[0], goals[2]]);
  assert.deepEqual(filterGoals(goals, "completed", "OD"), [goals[1]]);
  assert.deepEqual(filterGoals(goals, "all", "   "), goals);
  assert.deepEqual(filterGoals(goals, "all", "missing"), []);
  assert.deepEqual(filterGoals([], "all", "read"), []);
  assert.deepEqual(goals, original);
  assert.deepEqual(getGoalStats(goals), { total: 3, completed: 1 });
});

test("search treats special characters as literal text", () => {
  const items = [
    { id: "1", text: "Learn C++ (basics)", completed: false },
    { id: "2", text: "Read [notes]", completed: true },
  ];
  assert.deepEqual(filterGoals(items, "all", "C++ ("), [items[0]]);
  assert.deepEqual(filterGoals(items, "all", "["), [items[1]]);
  assert.deepEqual(filterGoals(items, "all", ".*"), []);
});

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
  savePreferences({ goalStatusFilter: "remaining", goalSortOption: "az" });
  savePreferences({ theme: "dark" });
  assert.equal(loadPreferences().goalStatusFilter, "remaining");
  assert.equal(loadPreferences().goalSortOption, "az");
  assert.equal(loadPreferences().theme, "dark");
});
