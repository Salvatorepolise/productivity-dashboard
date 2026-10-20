/** Day 36: corrupted JSON in localStorage must not crash the app */
function loadJSON(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.error(`Failed to load "${key}" from storage:`, error);
    return null;
  }
}

export function loadHabitsFromStorage() {
  return loadJSON("habitsData");
}

export function saveHabitsToStorage(data) {
  localStorage.setItem("habitsData", JSON.stringify(data));
}

/** Raw saved goals (validated by normalizeGoals in goals-logic.js) */
export function loadGoalsFromStorage() {
  const saved = loadJSON("goalsData");
  return Array.isArray(saved) ? saved : null;
}

export function saveGoalsToStorage(goals) {
  localStorage.setItem("goalsData", JSON.stringify(goals));
}

/** Day 43: { "YYYY-MM-DD": minutes } (validated by normalizeCodingLog) */
export function loadCodingLogFromStorage() {
  return loadJSON("codingLog");
}

export function saveCodingLogToStorage(log) {
  localStorage.setItem("codingLog", JSON.stringify(log));
}
