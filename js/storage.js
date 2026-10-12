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

export function loadGoalsFromStorage() {
  const saved = loadJSON("goalsData");
  if (!Array.isArray(saved)) return null;
  return saved.filter((goal) => typeof goal === "string");
}

export function saveGoalsToStorage(goals) {
  localStorage.setItem("goalsData", JSON.stringify(goals));
}
