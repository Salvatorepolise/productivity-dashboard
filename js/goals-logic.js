/**
 * Pure goal logic — no DOM, no localStorage.
 * Goal shape: { id, text, completed }
 */

import { ensureUniqueIds } from "./habits-logic.js";

/**
 * Accepts saved data in any past format:
 * - Day 36–37: array of strings
 * - Day 38+: array of { id, text, completed }
 * Invalid entries are dropped.
 */
export function normalizeGoals(raw, createId) {
  if (!Array.isArray(raw)) return [];

  const goals = [];
  for (const item of raw) {
    if (typeof item === "string") {
      if (item.trim()) {
        goals.push({ id: createId(), text: item.trim(), completed: false });
      }
    } else if (item && typeof item.text === "string" && item.text.trim()) {
      goals.push({
        id: typeof item.id === "string" ? item.id : "",
        text: item.text.trim(),
        completed: Boolean(item.completed),
      });
    }
  }

  return ensureUniqueIds(goals, createId);
}

/** New day: completed goals are cleared, unfinished ones carry over */
export function carryOverGoals(goals) {
  return goals
    .filter((goal) => !goal.completed)
    .map((goal) => ({ ...goal }));
}

export function toggleGoalById(goals, id) {
  return goals.map((goal) =>
    goal.id === id ? { ...goal, completed: !goal.completed } : goal,
  );
}

export function getGoalStats(goals) {
  const completed = goals.filter((goal) => goal.completed).length;
  return { total: goals.length, completed };
}
