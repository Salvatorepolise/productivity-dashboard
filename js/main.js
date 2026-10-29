import {
  habitsData,
  initHabits,
  checkAndResetForNewDay,
  addHabit,
  deleteHabit,
  renameHabit,
  updateHabit,
  resetHabits,
  setSearchText,
  setSortOption,
  setStatusFilter,
  undoDelete,
  getHabitsForExport,
  replaceHabits,
} from "./state.js";

import {
  renderHabits,
  updateProgress,
  renderGoals,
  startEditingHabit,
  stopEditingHabit,
  showMessage,
  showUndoToast,
  hideUndoToast,
  runUndo,
  renderCodingWeek,
  renderWeekSummary,
} from "./ui.js";
import {
  goals,
  initGoals,
  addGoal,
  renameGoal,
  toggleGoal,
  deleteGoal,
  clearCompletedGoals,
  undoDeleteGoal,
  resetGoalsForNewDay,
  replaceGoals,
} from "./goals.js";
import { createBackup, parseBackup } from "./backup-logic.js";
import {
  codingLog,
  initCoding,
  getTodayMinutes,
  setTodayMinutes,
  replaceCodingLog,
} from "./coding.js";
import { parseMinutesInput } from "./coding-logic.js";
import {
  loadDailyQuote,
  loadWeather,
  refreshWeatherDisplay,
  searchCity,
} from "./api.js";
import {
  loadPreferences,
  savePreferences,
  getPreferences,
  replacePreferences,
  applyPreferencesToUI,
} from "./preferences.js";

function refreshWeekSummary() {
  renderWeekSummary(habitsData, codingLog, getPreferences().codingGoalMinutes);
}

// ===== GOALS =====
const newGoalInput = document.getElementById("new-goal-input");
const addGoalBtn = document.getElementById("add-goal-btn");
const goalSearchInput = document.getElementById("search-goal-input");

document.getElementById("goal-sort").addEventListener("change", (event) => {
  savePreferences({ goalSortOption: event.target.value });
  renderGoals(goals);
});

document.getElementById("clear-completed-goals-btn").addEventListener("click", () => {
  const count = clearCompletedGoals();
  if (!count) return;
  renderGoals(goals);
  goalSearchInput.focus();
  showUndoToast(`${count} completed goal${count === 1 ? "" : "s"} cleared.`, () => {
    if (undoDeleteGoal()) renderGoals(goals);
  });
});

goalSearchInput.addEventListener("input", () => renderGoals(goals));

function clearGoalSearch() {
  goalSearchInput.value = "";
  renderGoals(goals);
  goalSearchInput.focus();
}

document.getElementById("clear-goal-search-btn").addEventListener("click", clearGoalSearch);
goalSearchInput.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !event.isComposing) {
    event.preventDefault();
    event.stopPropagation();
    clearGoalSearch();
  }
});

document.getElementById("goal-status-filter").addEventListener("change", (event) => {
  savePreferences({ goalStatusFilter: event.target.value });
  renderGoals(goals);
});

function handleAddGoal() {
  if (!addGoal(newGoalInput.value)) return;
  goalSearchInput.value = "";
  // A newly added goal is active: keep it visible after adding it.
  if (getPreferences().goalStatusFilter === "completed") {
    savePreferences({ goalStatusFilter: "remaining" });
  }
  renderGoals(goals);
  newGoalInput.value = "";
}

addGoalBtn.addEventListener("click", handleAddGoal);
newGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleAddGoal();
});

document.getElementById("goals-list").addEventListener("change", (event) => {
  const target = event.target;
  if (target.classList.contains("goal-checkbox")) {
    toggleGoal(target.dataset.id);
    renderGoals(goals);
  }
});

function finishGoalEdit(id) {
  renderGoals(goals);
  const button = [...document.querySelectorAll(".edit-goal-btn")].find(
    (element) => element.dataset.id === id,
  );
  (button ?? goalSearchInput).focus();
}

function saveGoalEdit(id) {
  const input = document.querySelector(".goal-edit-input");
  if (!input || input.dataset.id !== id) return;
  const result = renameGoal(id, input.value);
  if (!result.ok) {
    showMessage(result.error);
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  finishGoalEdit(id);
}

document.getElementById("goals-list").addEventListener("keydown", (event) => {
  if (!event.target.classList.contains("goal-edit-input") || event.isComposing) return;
  if (event.key === "Enter" || event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Enter") saveGoalEdit(event.target.dataset.id);
    else finishGoalEdit(event.target.dataset.id);
  }
});

document.getElementById("goals-list").addEventListener("click", (event) => {
  const target = event.target;
  const id = target.dataset.id;
  if (target.classList.contains("edit-goal-btn")) {
    renderGoals(goals, id);
    const input = document.querySelector(".goal-edit-input");
    input?.focus();
    input?.select();
    return;
  }
  if (target.classList.contains("save-goal-btn")) return saveGoalEdit(id);
  if (target.classList.contains("cancel-goal-btn")) return finishGoalEdit(id);
  if (!target.classList.contains("delete-goal-btn")) return;

  if (deleteGoal(target.dataset.id)) {
    renderGoals(goals);
    showUndoToast("Goal deleted.", () => {
      if (undoDeleteGoal()) renderGoals(goals);
    });
  }
});

// ===== HABIT EVENTS =====
function saveHabitEdit(id) {
  const input = document.querySelector(".habit-edit-input");
  if (!input) return;

  const result = renameHabit(id, input.value);
  if (!result.ok) {
    if (result.error) showMessage(result.error);
    input.focus();
    return;
  }

  stopEditingHabit();
  renderHabits();
  updateProgress();
  refreshWeekSummary();
}

function cancelHabitEdit() {
  stopEditingHabit();
  renderHabits();
}

document.getElementById("habits").addEventListener("click", (event) => {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains("edit-habit-btn")) {
    startEditingHabit(id);
  }

  if (target.classList.contains("save-habit-btn")) {
    saveHabitEdit(id);
  }

  if (target.classList.contains("cancel-edit-btn")) {
    cancelHabitEdit();
  }

  if (target.classList.contains("delete-habit-btn")) {
    if (!deleteHabit(id)) return;
    renderHabits();
    updateProgress();
    refreshWeekSummary();
    showUndoToast("Habit deleted.", () => {
      if (undoDelete()) {
        renderHabits();
        updateProgress();
        refreshWeekSummary();
      }
    });
  }
});

document.getElementById("habits").addEventListener("change", (event) => {
  const target = event.target;
  if (target.classList.contains("habit-checkbox")) {
    const id = target.dataset.id;
    if (id) {
      updateHabit(id);
      updateProgress();
      renderHabits();
      refreshWeekSummary();
    }
  }
});

document.getElementById("habits").addEventListener("keydown", (event) => {
  const target = event.target;
  if (!target.classList.contains("habit-edit-input")) return;

  if (event.key === "Enter") {
    saveHabitEdit(target.dataset.id);
  }
  if (event.key === "Escape") {
    cancelHabitEdit();
  }
});

document.getElementById("search-habit-input").addEventListener("input", (e) => {
  setSearchText(e.target.value);
  renderHabits();
});

// Day 46: persist status filter + sort
document
  .getElementById("habit-status-filter")
  .addEventListener("change", (e) => {
    setStatusFilter(e.target.value);
    savePreferences({ habitStatusFilter: e.target.value });
    renderHabits();
  });

document.getElementById("sort-habits").addEventListener("change", (e) => {
  setSortOption(e.target.value);
  savePreferences({ habitSortOption: e.target.value });
  renderHabits();
});

function handleAddHabit() {
  const input = document.getElementById("new-habit-input");
  const result = addHabit(input.value);
  if (!result.ok) {
    if (result.error) showMessage(result.error);
    return;
  }
  input.value = "";
  renderHabits();
  updateProgress();
  refreshWeekSummary();
}

document
  .getElementById("add-habit-btn")
  .addEventListener("click", handleAddHabit);

document.getElementById("new-habit-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleAddHabit();
});

document.getElementById("reset-habits-btn").addEventListener("click", () => {
  const ok = confirm(
    "Reset all habit completions for today? Streaks and history stay.",
  );
  if (!ok) return;

  resetHabits();
  renderHabits();
  updateProgress();
  refreshWeekSummary();
  showMessage("Today's habit completions were reset.");
});

document.getElementById("undo-delete-btn").addEventListener("click", runUndo);

// ===== KEYBOARD SHORTCUTS =====
function isTypingInField(target) {
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

function handleKeyboardShortcuts(event) {
  const target = event.target;

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    document.getElementById("search-habit-input").focus();
    return;
  }

  if (event.key === "Escape") {
    if (target.classList.contains("habit-edit-input")) return;

    const searchInput = document.getElementById("search-habit-input");
    if (searchInput.value !== "") {
      searchInput.value = "";
      setSearchText("");
      renderHabits();
    }
    searchInput.blur();
    return;
  }

  if (event.key.toLowerCase() === "n" && !isTypingInField(target)) {
    event.preventDefault();
    document.getElementById("new-habit-input").focus();
  }
}

document.addEventListener("keydown", handleKeyboardShortcuts);

// ===== BACKUP =====
function exportBackup() {
  const data = createBackup(
    {
      habits: getHabitsForExport(),
      goals,
      notes: notesTextarea.value,
      coding: codingLog,
      preferences: getPreferences(),
    },
    new Date(),
  );
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard-backup-${date}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function applyBackup(backup) {
  replaceHabits(backup.habits);
  stopEditingHabit();
  hideUndoToast();

  if (backup.goals) replaceGoals(backup.goals);

  if (backup.coding) {
    replaceCodingLog(backup.coding);
    todayInput.value = getTodayMinutes();
  }

  if (backup.notes !== null) {
    notesTextarea.value = backup.notes;
    localStorage.setItem("notes", backup.notes);
  }

  if (backup.preferences) {
    replacePreferences(backup.preferences);
    syncSettingsUI();
    loadWeather();
  }

  const prefs = getPreferences();
  setStatusFilter(prefs.habitStatusFilter);
  setSortOption(prefs.habitSortOption);

  renderHabits();
  updateProgress();
  renderGoals(goals);
  updateCodingGoal();
  refreshWeekSummary();
}

function importBackupFromFile(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (error) {
      console.error(error);
      showMessage("Could not read this file. Use a valid JSON backup.");
      return;
    }

    const result = parseBackup(parsed);
    if (!result.ok) {
      showMessage(result.error);
      return;
    }

    applyBackup(result.backup);
    showMessage(
      result.backup.goals === null
        ? "Habits imported (old backup format)."
        : "Backup imported.",
    );
  };

  reader.onerror = () => {
    showMessage("Failed to read the file.");
  };

  reader.readAsText(file);
}

document
  .getElementById("export-backup-btn")
  .addEventListener("click", exportBackup);

document.getElementById("import-backup-btn").addEventListener("click", () => {
  const ok = confirm(
    "Import will replace your current data with the data in the file. Continue?",
  );
  if (!ok) return;
  document.getElementById("import-backup-input").click();
});

document
  .getElementById("import-backup-input")
  .addEventListener("change", (e) => {
    const file = e.target.files[0];
    importBackupFromFile(file);
    e.target.value = "";
  });

// ===== CODING =====
const todayInput = document.getElementById("today-input");
const goalInput = document.getElementById("goal-minutes-input");
const statusEl = document.getElementById("goal-status");
const progressBar = document.getElementById("progress-bar");

function updateCodingGoal() {
  const todayMinutes = getTodayMinutes();
  const goalMinutes = getPreferences().codingGoalMinutes;

  const percentage = Math.min((todayMinutes / goalMinutes) * 100, 100);
  progressBar.style.width = percentage + "%";

  const done = todayMinutes >= goalMinutes;
  statusEl.textContent = done ? "Goal completed ✓" : "Not completed yet";
  statusEl.classList.toggle("goal-done", done);

  renderCodingWeek(codingLog, goalMinutes);
  refreshWeekSummary();
}

todayInput.addEventListener("input", () => {
  setTodayMinutes(parseMinutesInput(todayInput.value));
  updateCodingGoal();
});

todayInput.addEventListener("change", () => {
  todayInput.value = getTodayMinutes();
});

goalInput.addEventListener("change", () => {
  const value = Number(goalInput.value);
  if (!Number.isInteger(value) || value < 1 || value > 600) {
    showMessage("Coding goal must be between 1 and 600 minutes.");
    goalInput.value = getPreferences().codingGoalMinutes;
    return;
  }
  savePreferences({ codingGoalMinutes: value });
  updateCodingGoal();
});

// ===== NOTES =====
const notesTextarea = document.getElementById("notes");
const savedNotes = localStorage.getItem("notes");
if (savedNotes) notesTextarea.value = savedNotes;

notesTextarea.addEventListener("input", () => {
  localStorage.setItem("notes", notesTextarea.value);
});

// ===== SETTINGS =====
const tempUnitSelect = document.getElementById("temp-unit");
const compactModeCheckbox = document.getElementById("compact-mode");
const darkModeCheckbox = document.getElementById("dark-mode");

function syncSettingsUI() {
  const prefs = getPreferences();
  tempUnitSelect.value = prefs.temperatureUnit;
  compactModeCheckbox.checked = prefs.compactMode;
  darkModeCheckbox.checked = prefs.theme === "dark";
  goalInput.value = prefs.codingGoalMinutes;
  cityInput.value = prefs.weatherLocation.name;

  // Day 46
  document.getElementById("habit-status-filter").value =
    prefs.habitStatusFilter;
  document.getElementById("sort-habits").value = prefs.habitSortOption;

  applyPreferencesToUI();
}

const cityInput = document.getElementById("weather-city-input");
const cityBtn = document.getElementById("weather-city-btn");

async function handleSetCity() {
  const query = cityInput.value.trim();
  if (!query || cityBtn.disabled) return;

  cityBtn.disabled = true;
  try {
    const location = await searchCity(query);
    if (!location) {
      showMessage(`No city found for "${query}".`);
      return;
    }
    savePreferences({ weatherLocation: location });
    cityInput.value = location.name;
    showMessage(`Weather city set to ${location.name}.`);
    loadWeather();
  } catch (error) {
    console.error("City search failed:", error);
    showMessage("Could not search for the city. Try again later.");
  } finally {
    cityBtn.disabled = false;
  }
}

cityBtn.addEventListener("click", handleSetCity);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSetCity();
});

tempUnitSelect.addEventListener("change", () => {
  savePreferences({ temperatureUnit: tempUnitSelect.value });
  refreshWeatherDisplay();
});

compactModeCheckbox.addEventListener("change", () => {
  savePreferences({ compactMode: compactModeCheckbox.checked });
  applyPreferencesToUI();
});

darkModeCheckbox.addEventListener("change", () => {
  savePreferences({
    theme: darkModeCheckbox.checked ? "dark" : "light",
  });
  applyPreferencesToUI();
});

// ===== INIT =====
loadPreferences();
syncSettingsUI();

initHabits();
initGoals();
initCoding();
if (checkAndResetForNewDay()) resetGoalsForNewDay();

{
  const prefs = getPreferences();
  setStatusFilter(prefs.habitStatusFilter);
  setSortOption(prefs.habitSortOption);
}

todayInput.value = getTodayMinutes();

renderHabits();
updateProgress();
updateCodingGoal();
renderGoals(goals);
refreshWeekSummary();
loadDailyQuote();
loadWeather();

function refreshIfNewDay() {
  if (!checkAndResetForNewDay()) return;

  resetGoalsForNewDay();
  todayInput.value = getTodayMinutes();
  renderHabits();
  updateProgress();
  updateCodingGoal();
  renderGoals(goals);
  refreshWeekSummary();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshIfNewDay();
});
window.addEventListener("focus", refreshIfNewDay);
setInterval(refreshIfNewDay, 60 * 1000);
