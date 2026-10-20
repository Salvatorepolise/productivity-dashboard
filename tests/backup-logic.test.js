import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createBackup,
  parseBackup,
  validateHabits,
  BACKUP_APP,
  BACKUP_VERSION,
} from "../js/backup-logic.js";
import {
  sanitizePreferences,
  defaultPreferences,
} from "../js/preferences.js";

const habits = [
  { id: "h1", name: "Reading", completed: true, streak: 2, lastCompletedDate: "2026-10-15" },
];
const goals = [{ id: "g1", text: "Ship Day 39", completed: false }];
const prefs = { ...defaultPreferences, theme: "dark", codingGoalMinutes: 45 };

// ===== Export =====

test("createBackup includes every section and a version", () => {
  const now = new Date("2026-10-15T10:00:00Z");
  const backup = createBackup({ habits, goals, notes: "hi", preferences: prefs }, now);

  assert.equal(backup.app, BACKUP_APP);
  assert.equal(backup.version, BACKUP_VERSION);
  assert.equal(backup.exportedAt, "2026-10-15T10:00:00.000Z");
  assert.deepEqual(backup.habits, habits);
  assert.deepEqual(backup.goals, goals);
  assert.equal(backup.notes, "hi");
  assert.deepEqual(backup.preferences, prefs);
});

test("export → JSON → import round-trips all data", () => {
  const coding = { "2026-10-14": 45, "2026-10-15": 90 };
  const backup = createBackup(
    { habits, goals, notes: "line 1\nline 2", preferences: prefs, coding },
    new Date(),
  );
  const result = parseBackup(JSON.parse(JSON.stringify(backup)));

  assert.equal(result.ok, true);
  assert.deepEqual(result.backup, {
    habits,
    goals,
    notes: "line 1\nline 2",
    preferences: prefs,
    coding,
  });
});

test("backups without a coding log (Day 39–42) still import", () => {
  const result = parseBackup({ app: BACKUP_APP, version: 2, habits: [] });
  assert.equal(result.ok, true);
  assert.equal(result.backup.coding, null);
});

test("parseBackup rejects a coding log that is not an object", () => {
  const base = { app: BACKUP_APP, version: 2, habits: [] };
  for (const coding of [null, [], "60", 60]) {
    assert.equal(parseBackup({ ...base, coding }).ok, false);
  }
});

// ===== Import: legacy format =====

test("parseBackup accepts the old habits-only array (Day 29–38)", () => {
  const result = parseBackup(habits);
  assert.equal(result.ok, true);
  assert.deepEqual(result.backup, {
    habits,
    goals: null,
    notes: null,
    preferences: null,
    coding: null,
  });
});

test("parseBackup rejects an old array with invalid habits", () => {
  const result = parseBackup([{ id: 1, name: "x", completed: "yes" }]);
  assert.equal(result.ok, false);
  assert.match(result.error, /Each habit needs/);
});

// ===== Import: invalid files =====

test("parseBackup rejects files from other apps", () => {
  for (const data of [null, "text", 42, {}, { app: "other", version: 2, habits: [] }]) {
    const result = parseBackup(data);
    assert.equal(result.ok, false);
    assert.match(result.error, /not a Productivity Dashboard backup/);
  }
});

test("parseBackup rejects backups from a newer version", () => {
  const result = parseBackup({ app: BACKUP_APP, version: 99, habits: [] });
  assert.equal(result.ok, false);
  assert.match(result.error, /newer version/);
});

test("parseBackup rejects wrong section types", () => {
  const base = { app: BACKUP_APP, version: 2, habits: [] };
  assert.equal(parseBackup({ ...base, habits: "x" }).ok, false);
  assert.equal(parseBackup({ ...base, goals: "x" }).ok, false);
  assert.equal(parseBackup({ ...base, notes: 5 }).ok, false);
});

test("missing optional sections mean 'keep current data'", () => {
  const result = parseBackup({ app: BACKUP_APP, version: 2, habits: [] });
  assert.equal(result.ok, true);
  assert.equal(result.backup.goals, null);
  assert.equal(result.backup.notes, null);
  assert.equal(result.backup.preferences, null);
});

test("empty notes are imported, not ignored", () => {
  const result = parseBackup({ app: BACKUP_APP, version: 2, habits: [], notes: "" });
  assert.equal(result.backup.notes, "");
});

// ===== Validation helpers =====

test("validateHabits returns null for valid habits", () => {
  assert.equal(validateHabits(habits), null);
  assert.equal(validateHabits([]), null);
});

test("sanitizePreferences keeps valid values and drops the rest", () => {
  const result = sanitizePreferences({
    temperatureUnit: "kelvin",
    compactMode: "yes",
    theme: "dark",
    codingGoalMinutes: 9999,
    somethingElse: true,
  });
  assert.deepEqual(result, { ...defaultPreferences, theme: "dark" });
});

test("sanitizePreferences returns defaults for non-objects", () => {
  assert.deepEqual(sanitizePreferences(null), defaultPreferences);
  assert.deepEqual(sanitizePreferences("dark"), defaultPreferences);
});

// ===== Weather city (Day 41) =====

test("sanitizePreferences keeps a valid weather city", () => {
  const city = { name: "Milan, Italy", latitude: 45.46, longitude: 9.19 };
  assert.deepEqual(sanitizePreferences({ weatherLocation: city }).weatherLocation, city);
});

test("sanitizePreferences falls back to Rome for an invalid city", () => {
  const bad = [
    "Milan",
    { name: "", latitude: 45, longitude: 9 },
    { name: "X", latitude: 91, longitude: 9 },
    { name: "X", latitude: 45, longitude: -181 },
    { name: "X", latitude: "45", longitude: 9 },
    { name: "X".repeat(101), latitude: 45, longitude: 9 },
  ];
  for (const weatherLocation of bad) {
    assert.deepEqual(
      sanitizePreferences({ weatherLocation }).weatherLocation,
      defaultPreferences.weatherLocation,
    );
  }
});

test("a backup with a weather city round-trips", () => {
  const preferences = {
    ...defaultPreferences,
    weatherLocation: { name: "Oslo, Norway", latitude: 59.91, longitude: 10.75 },
  };
  const backup = createBackup({ habits, goals, notes: "", preferences }, new Date());
  const result = parseBackup(JSON.parse(JSON.stringify(backup)));
  assert.deepEqual(result.backup.preferences, preferences);
});
