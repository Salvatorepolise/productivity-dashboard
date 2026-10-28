import { loadGoalsFromStorage, saveGoalsToStorage } from "./storage.js";
import { createId } from "./ids.js";
import { restoreAt } from "./list-utils.js";
import {
  normalizeGoals,
  carryOverGoals,
  toggleGoalById,
} from "./goals-logic.js";

const defaultGoals = [
  "Practice English for 1 hour",
  "Study JavaScript fundamentals",
  "Build the productivity dashboard",
];

export let goals = [];

let recentlyDeleted = null; // Array of { goal, index }, for the latest deletion

export function initGoals() {
  const saved = loadGoalsFromStorage();
  goals = normalizeGoals(saved ?? defaultGoals, createId);
  saveGoalsToStorage(goals);
}

export function addGoal(text) {
  const trimmed = text.trim();
  if (!trimmed) return false;

  goals = [...goals, { id: createId(), text: trimmed, completed: false }];
  saveGoalsToStorage(goals);
  return true;
}

export function toggleGoal(id) {
  goals = toggleGoalById(goals, id);
  saveGoalsToStorage(goals);
}

export function renameGoal(id, text) {
  if (!goals.some((goal) => goal.id === id)) {
    return { ok: false, error: "This goal no longer exists." };
  }
  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return { ok: false, error: "Goal text cannot be empty." };

  goals = goals.map((goal) =>
    goal.id === id ? { ...goal, text: trimmed } : goal,
  );
  saveGoalsToStorage(goals);
  return { ok: true };
}

export function deleteGoal(id) {
  const index = goals.findIndex((goal) => goal.id === id);
  if (index === -1) return false;

  recentlyDeleted = [{ goal: goals[index], index }];
  goals = goals.filter((goal) => goal.id !== id);
  saveGoalsToStorage(goals);
  return true;
}

export function undoDeleteGoal() {
  if (!recentlyDeleted) return false;

  for (const { goal, index } of recentlyDeleted) {
    goals = restoreAt(goals, goal, index);
  }
  recentlyDeleted = null;
  saveGoalsToStorage(goals);
  return true;
}

/** Clear all completed goals, including those hidden by search or filters. */
export function clearCompletedGoals() {
  const removed = goals.flatMap((goal, index) =>
    goal.completed ? [{ goal, index }] : [],
  );
  if (removed.length === 0) return 0;
  recentlyDeleted = removed;
  goals = goals.filter((goal) => !goal.completed);
  saveGoalsToStorage(goals);
  return removed.length;
}

/** Day 39: backup import (raw data is validated by normalizeGoals) */
export function replaceGoals(raw) {
  goals = normalizeGoals(raw, createId);
  recentlyDeleted = null;
  saveGoalsToStorage(goals);
}

/** Called when a new local day starts */
export function resetGoalsForNewDay() {
  goals = carryOverGoals(goals);
  recentlyDeleted = null;
  saveGoalsToStorage(goals);
}
