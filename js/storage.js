export function loadHabitsFromStorage() {
  const saved = localStorage.getItem("habitsData");
  if (!saved) return null;
  return JSON.parse(saved);
}

export function saveHabitsToStorage(data) {
  localStorage.setItem("habitsData", JSON.stringify(data));
}
