import {
  initHabits,
  checkAndResetForNewDay,
  addHabit,
  deleteHabit,
  editHabit,
  updateHabit,
  resetHabits,
  setSearchText,
  setSortOption,
  setStatusFilter,
  undoDelete,
  getHabitsForExport,
  importHabitsFromData,
} from "./state.js";

import { renderHabits, updateProgress, renderGoals } from "./ui.js";
import { loadDailyQuote, loadWeather, refreshWeatherDisplay } from "./api.js";
import {
  loadPreferences,
  savePreferences,
  getPreferences,
  applyPreferencesToUI,
} from "./preferences.js";

// ===== GOALS =====
const goals = [
  "Practice English for 1 hour",
  "Study JavaScript fundamentals",
  "Build the productivity dashboard",
];

const goalsList = document.getElementById("goals-list");
const newGoalInput = document.getElementById("new-goal-input");
const addGoalBtn = document.getElementById("add-goal-btn");

function handleAddGoal() {
  const text = newGoalInput.value.trim();
  if (!text) return;
  goals.push(text);
  renderGoals(goals, goalsList);
  newGoalInput.value = "";
}

addGoalBtn.addEventListener("click", handleAddGoal);
newGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleAddGoal();
});

// ===== HABIT EVENTS =====
document.getElementById("habits").addEventListener("click", (event) => {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;

  if (target.classList.contains("edit-habit-btn")) {
    editHabit(id);
    renderHabits();
    updateProgress();
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

document.getElementById("add-habit-btn").addEventListener("click", () => {
  const input = document.getElementById("new-habit-input");
  const ok = addHabit(input.value);
  if (ok) {
    input.value = "";
    renderHabits();
    updateProgress();
  }
});

document.getElementById("new-habit-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const input = document.getElementById("new-habit-input");
    const ok = addHabit(input.value);
    if (ok) {
      input.value = "";
      renderHabits();
      updateProgress();
    }
  }
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

// ===== EXPORT / IMPORT =====
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
        alert(result.error);
        return;
      }

      renderHabits();
      updateProgress();
    } catch (error) {
      console.error(error);
      alert("Could not read this file. Use a valid JSON habits backup.");
    }
  };

  reader.onerror = () => {
    alert("Failed to read the file.");
  };

  reader.readAsText(file);
}

document
  .getElementById("export-habits-btn")
  .addEventListener("click", exportHabits);

document.getElementById("import-habits-btn").addEventListener("click", () => {
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

  if (todayMinutes >= goalMinutes) {
    statusEl.textContent = "Goal completed ✓";
    statusEl.style.color = "#16a34a";
  } else {
    statusEl.textContent = "Not completed yet";
    statusEl.style.color = "#a1a1aa";
  }
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
checkAndResetForNewDay(); // habits + coding minutes if new local day

// Sync coding input AFTER possible new-day reset
const savedMinutes = localStorage.getItem("todayMinutes");
todayInput.value = savedMinutes !== null ? savedMinutes : "0";

renderHabits();
updateProgress();
updateCodingGoal();
renderGoals(goals, goalsList);
loadDailyQuote();
loadWeather();
