/**
 * Pure backup logic — no DOM, no localStorage (Day 39).
 *
 * Backup v2:
 * { app, version: 2, exportedAt, habits, goals, notes, preferences }
 *
 * Legacy (Day 29–38): a plain array of habits.
 */

import { sanitizePreferences } from "./preferences.js";

export const BACKUP_APP = "productivity-dashboard";
export const BACKUP_VERSION = 2;

export function createBackup({ habits, goals, notes, preferences }, now) {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    habits,
    goals,
    notes,
    preferences,
  };
}

/** Returns an error message, or null if the habits are valid */
export function validateHabits(habits) {
  if (!Array.isArray(habits)) {
    return "Habits must be a list.";
  }

  for (const item of habits) {
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.completed !== "boolean"
    ) {
      return "Each habit needs id (string), name (string), completed (boolean).";
    }
  }

  return null;
}

/**
 * Validates a parsed backup file without changing anything.
 * Returns { ok: true, backup } where missing sections are null
 * (= keep current data), or { ok: false, error }.
 */
export function parseBackup(data) {
  // Legacy format: plain array of habits
  if (Array.isArray(data)) {
    const error = validateHabits(data);
    if (error) return { ok: false, error };
    return {
      ok: true,
      backup: { habits: data, goals: null, notes: null, preferences: null },
    };
  }

  if (!data || typeof data !== "object" || data.app !== BACKUP_APP) {
    return { ok: false, error: "This is not a Productivity Dashboard backup." };
  }

  if (typeof data.version !== "number" || data.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: "This backup was made by a newer version of the app.",
    };
  }

  const habitsError = validateHabits(data.habits);
  if (habitsError) return { ok: false, error: habitsError };

  if (data.goals !== undefined && !Array.isArray(data.goals)) {
    return { ok: false, error: "Goals must be a list." };
  }
  if (data.notes !== undefined && typeof data.notes !== "string") {
    return { ok: false, error: "Notes must be text." };
  }

  return {
    ok: true,
    backup: {
      habits: data.habits,
      goals: data.goals ?? null,
      notes: data.notes ?? null,
      preferences:
        data.preferences === undefined
          ? null
          : sanitizePreferences(data.preferences),
    },
  };
}
