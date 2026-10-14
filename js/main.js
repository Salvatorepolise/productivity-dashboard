import {
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
  importHabitsFromData,
} from "./state.js";

import {
  renderHabits,
  updateProgress,
  renderGoals,
  startEditingHabit,
  stopEditingHabit,
  showMessage,
} from "./ui.js";
import { loadGoalsFromStorage, saveGoalsToStorage } from "./storage.js";
import { loadDailyQuote, loadWeather, refreshWeatherDisplay } from "./api.js";
import {
  loadPreferences,
  savePreferences,
  getPreferences,
  applyPreferencesToUI,
} from "./preferences.js";

// ===== GOALS (Day 36: persisted) =====
const defaultGoals = [
  "Practice English for 1 hour",
  "Study JavaScript fundamentals",
  "Build the productivity dashboard",
];
const goals = loadGoalsFromStorage() ?? [...defaultGoals];

const goalsList = document.getElementById("goals-list");
const newGoalInput = document.getElementById("new-goal-input");
const addGoalBtn = document.getElementById("add-goal-btn");

function handleAddGoal() {
  const text = newGoalInput.value.trim();
  if (!text) return;
  goals.push(text);
  saveGoalsToStorage(goals);
  renderGoals(goals, goalsList);
  newGoalInput.value = "";
}

addGoalBtn.addEventListener("click", handleAddGoal);
newGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleAddGoal();
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
    deleteHabit(id);
    renderHabits();
    updateProgress();
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

document
  .getElementById("habit-status-filter")
  .addEventListener("change", (e) => {
    setStatusFilter(e.target.value);
    renderHabits();
  });

document.getElementById("sort-habits").addEventListener("change", (e) => {
  setSortOption(e.target.value);
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
}

document
  .getElementById("add-habit-btn")
  .addEventListener("click", handleAddHabit);

document.getElementById("new-habit-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleAddHabit();
});

document.getElementById("reset-habits-btn").addEventListener("click", () => {
  resetHabits();
  renderHabits();
  updateProgress();
});

// ===== UNDO DELETE =====
document.getElementById("undo-delete-btn").addEventListener("click", () => {
  const restored = undoDelete();
  if (restored) {
    renderHabits();
    updateProgress();
  }
});

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
    // Inline habit edit handles its own Escape (cancel)
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

// ===== EXPORT / IMPORT (Day 35: confirm before replace) =====
function exportHabits() {
  const data = getHabitsForExport();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habits-backup-${date}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function importHabitsFromFile(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const result = importHabitsFromData(parsed);

      if (!result.ok) {
        showMessage(result.error);
        return;
      }

      stopEditingHabit();
      renderHabits();
      updateProgress();
      showMessage("Habits imported.");
    } catch (error) {
      console.error(error);
      showMessage("Could not read this file. Use a valid JSON habits backup.");
    }
  };

  reader.onerror = () => {
    showMessage("Failed to read the file.");
  };

  reader.readAsText(file);
}

document
  .getElementById("export-habits-btn")
  .addEventListener("click", exportHabits);

document.getElementById("import-habits-btn").addEventListener("click", () => {
  const ok = confirm(
    "Import will replace all current habits with the file data. Continue?",
  );
  if (!ok) return;
  document.getElementById("import-habits-input").click();
});

document
  .getElementById("import-habits-input")
  .addEventListener("change", (e) => {
    const file = e.target.files[0];
    importHabitsFromFile(file);
    e.target.value = "";
  });

// ===== CODING =====
const goalMinutes = 60;
const todayInput = document.getElementById("today-input");
const goalEl = document.getElementById("goal-minutes");
const statusEl = document.getElementById("goal-status");
const progressBar = document.getElementById("progress-bar");

function updateCodingGoal() {
  const todayMinutes = Number(todayInput.value) || 0;
  goalEl.textContent = goalMinutes;

  const percentage = Math.min((todayMinutes / goalMinutes) * 100, 100);
  progressBar.style.width = percentage + "%";

  const done = todayMinutes >= goalMinutes;
  statusEl.textContent = done ? "Goal completed ✓" : "Not completed yet";
  statusEl.classList.toggle("goal-done", done);
}

todayInput.addEventListener("input", () => {
  localStorage.setItem("todayMinutes", todayInput.value);
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
  applyPreferencesToUI();
}

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
checkAndResetForNewDay();

const savedMinutes = localStorage.getItem("todayMinutes");
todayInput.value = savedMinutes !== null ? savedMinutes : "0";

renderHabits();
updateProgress();
updateCodingGoal();
renderGoals(goals, goalsList);
loadDailyQuote();
loadWeather();

// ===== NEW DAY WHILE THE TAB IS OPEN (Day 37) =====
function refreshIfNewDay() {
  if (!checkAndResetForNewDay()) return;

  todayInput.value = "0";
  renderHabits();
  updateProgress();
  updateCodingGoal();
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshIfNewDay();
});
window.addEventListener("focus", refreshIfNewDay);
setInterval(refreshIfNewDay, 60 * 1000);
