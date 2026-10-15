import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeGoals,
  carryOverGoals,
  toggleGoalById,
  restoreGoalAt,
  getGoalStats,
} from "../js/goals-logic.js";

function idFactory() {
  let n = 0;
  return () => `g${++n}`;
}

function goal(id, text, completed = false) {
  return { id, text, completed };
}

// ===== Loading saved data =====

test("normalizeGoals migrates the old string format (Day 36–37)", () => {
  const result = normalizeGoals(["Read", "  Code  "], idFactory());
  assert.deepEqual(result, [goal("g1", "Read"), goal("g2", "Code")]);
});

test("normalizeGoals keeps the new object format", () => {
  const result = normalizeGoals(
    [{ id: "a", text: "Read", completed: true }],
    idFactory(),
  );
  assert.deepEqual(result, [goal("a", "Read", true)]);
});

test("normalizeGoals drops invalid entries", () => {
  const result = normalizeGoals(
    ["", "   ", null, 42, { text: "" }, { id: "x" }, "Ok"],
    idFactory(),
  );
  assert.deepEqual(
    result.map((g) => g.text),
    ["Ok"],
  );
});

test("normalizeGoals repairs missing and duplicate ids", () => {
  const result = normalizeGoals(
    [
      { id: "a", text: "One" },
      { id: "a", text: "Two" },
      { text: "Three" },
    ],
    idFactory(),
  );
  const ids = result.map((g) => g.id);
  assert.equal(new Set(ids).size, 3);
  assert.equal(ids[0], "a");
});

test("normalizeGoals returns [] for non-array data", () => {
  assert.deepEqual(normalizeGoals(null, idFactory()), []);
  assert.deepEqual(normalizeGoals({ text: "x" }, idFactory()), []);
});

// ===== New day =====

test("carryOverGoals removes completed goals and keeps unfinished ones", () => {
  const goals = [
    goal("a", "Done", true),
    goal("b", "Not done"),
    goal("c", "Also done", true),
  ];
  assert.deepEqual(carryOverGoals(goals), [goal("b", "Not done")]);
});

test("carryOverGoals does not mutate the input", () => {
  const goals = [goal("a", "Done", true), goal("b", "Not done")];
  carryOverGoals(goals);
  assert.equal(goals.length, 2);
});

// ===== Toggle / delete / undo =====

test("toggleGoalById flips only the matching goal", () => {
  const goals = [goal("a", "A"), goal("b", "B")];
  const result = toggleGoalById(goals, "b");
  assert.equal(result[0].completed, false);
  assert.equal(result[1].completed, true);
  assert.equal(goals[1].completed, false);
});

test("restoreGoalAt puts a goal back at its original position", () => {
  const goals = [goal("a", "A"), goal("c", "C")];
  const result = restoreGoalAt(goals, goal("b", "B"), 1);
  assert.deepEqual(
    result.map((g) => g.id),
    ["a", "b", "c"],
  );
});

test("restoreGoalAt clamps the index and ignores duplicates", () => {
  const goals = [goal("a", "A")];
  assert.deepEqual(
    restoreGoalAt(goals, goal("b", "B"), 99).map((g) => g.id),
    ["a", "b"],
  );
  assert.equal(restoreGoalAt(goals, goal("a", "A"), 0), goals);
});

test("getGoalStats counts completed goals", () => {
  const goals = [goal("a", "A", true), goal("b", "B")];
  assert.deepEqual(getGoalStats(goals), { total: 2, completed: 1 });
});
