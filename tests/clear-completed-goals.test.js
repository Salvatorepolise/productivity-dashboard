import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  goals, replaceGoals, clearCompletedGoals, undoDeleteGoal, deleteGoal,
  renameGoal, addGoal, resetGoalsForNewDay, initGoals,
} from "../js/goals.js";

let previousStorage;
let storage;
const initial = [
  { id: "a", text: "Read", completed: true },
  { id: "b", text: "Code", completed: false },
  { id: "c", text: "Walk", completed: true },
  { id: "d", text: "Study", completed: true },
  { id: "e", text: "Cook", completed: false },
];

beforeEach(() => {
  storage = new Map();
  previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
  });
  replaceGoals(initial);
});

afterEach(() => {
  if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage);
  else delete globalThis.localStorage;
});

test("clear completed persists only active goals; Undo restores every original position", () => {
  assert.equal(clearCompletedGoals(), 3);
  assert.deepEqual(goals, [initial[1], initial[4]]);
  assert.deepEqual(JSON.parse(storage.get("goalsData")), goals);
  assert.equal(undoDeleteGoal(), true);
  assert.deepEqual(goals, initial);
  assert.deepEqual(JSON.parse(storage.get("goalsData")), initial);
  assert.equal(undoDeleteGoal(), false);
});

test("batch Undo preserves edits and goals added after clearing", () => {
  clearCompletedGoals();
  renameGoal("b", "Build the dashboard");
  addGoal("New goal");
  assert.equal(clearCompletedGoals(), 0);
  assert.equal(undoDeleteGoal(), true);
  assert.deepEqual(goals.slice(0, 5).map((g) => g.id), initial.map((g) => g.id));
  assert.equal(goals[1].text, "Build the dashboard");
  assert.equal(goals[5].text, "New goal");
});

test("only the latest deletion is undone, and import or daily reset invalidates Undo", () => {
  clearCompletedGoals();
  deleteGoal("b");
  assert.equal(undoDeleteGoal(), true);
  assert.deepEqual(goals.map((g) => g.id), ["b", "e"]);
  replaceGoals(initial);
  clearCompletedGoals();
  resetGoalsForNewDay();
  assert.equal(undoDeleteGoal(), false);
  replaceGoals(initial);
  clearCompletedGoals();
  replaceGoals([{ id: "new", text: "Imported", completed: false }]);
  assert.equal(undoDeleteGoal(), false);
  assert.equal(goals[0].id, "new");
});

test("clearing all completed goals supports an empty list and survives reload", () => {
  replaceGoals(initial.filter((g) => g.completed));
  assert.equal(clearCompletedGoals(), 3);
  assert.deepEqual(goals, []);
  initGoals();
  assert.deepEqual(goals, []);
  assert.equal(clearCompletedGoals(), 0);
});
