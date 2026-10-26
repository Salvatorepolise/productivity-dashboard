import { test } from "node:test";
import assert from "node:assert/strict";
import {
  goals, initGoals, replaceGoals, renameGoal, deleteGoal, undoDeleteGoal,
  resetGoalsForNewDay,
} from "../js/goals.js";
import { createBackup, parseBackup } from "../js/backup-logic.js";

test("goal edits persist through reload, backup, undo and daily carry-over", (t) => {
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

  replaceGoals([
    { id: "a", text: "Read", completed: true },
    { id: "b", text: "Code", completed: false },
  ]);
  assert.deepEqual(renameGoal("a", "  Read a chapter  "), { ok: true });
  assert.deepEqual(goals[0], { id: "a", text: "Read a chapter", completed: true });
  assert.deepEqual(goals[1], { id: "b", text: "Code", completed: false });
  const saved = storage.get("goalsData");
  for (const invalid of ["", " \n ", null, 42]) {
    assert.equal(renameGoal("a", invalid).ok, false);
    assert.equal(storage.get("goalsData"), saved);
  }
  assert.equal(renameGoal("missing", "New text").ok, false);
  assert.equal(storage.get("goalsData"), saved);

  initGoals();
  assert.equal(goals[0].text, "Read a chapter");
  assert.equal(goals[0].completed, true);
  renameGoal("b", "Build the editor");
  const backup = createBackup(
    { habits: [], goals, notes: "", preferences: {} },
    new Date("2026-10-26T12:00:00Z"),
  );
  const parsed = parseBackup(JSON.parse(JSON.stringify(backup)));
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.backup.goals, goals);
  deleteGoal("b");
  undoDeleteGoal();
  assert.equal(goals[1].text, "Build the editor");
  resetGoalsForNewDay();
  assert.deepEqual(goals, [{ id: "b", text: "Build the editor", completed: false }]);
});
