import { loadHabitsFromStorage, saveHabitsToStorage } from "./storage.js";
import {
  toDateKey,
  applyCompletionTransition,
  ensureUniqueIds,
} from "./habits-logic.js";

export let habitsData = [
  {
    id: "english",
    name: "English",
    completed: false,
    streak: 0,
    lastCompletedDate: null,
  },
  {
    id: "coding",
    name: "Coding",
    completed: false,
    streak: 0,
    lastCompletedDate: null,
  },
  {
    id: "reading",
    name: "Reading",
    completed: false,
    streak: 0,
    lastCompletedDate: null,
  },
  {
    id: "exercise",
    name: "Exercise",
    completed: false,
    streak: 0,
    lastCompletedDate: null,
  },
];

export let searchText = "";
export let sortOption = "default";
export let statusFilter = "all";

export function setStatusFilter(value) {
  statusFilter = value;
}

let recentlyDeletedHabit = null;
let undoTimeoutId = null;

/** Day 36: ids are no longer derived from the name (rename + add could collide) */
function createHabitId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Retrocompatible habits (pre–Day 33 / old JSON) */
function normalizeHabit(h) {
  return {
    id: h.id,
    name: h.name,
    completed: Boolean(h.completed),
    streak: typeof h.streak === "number" && h.streak >= 0 ? h.streak : 0,
    lastCompletedDate:
      typeof h.lastCompletedDate === "string" ? h.lastCompletedDate : null,
  };
}

export function initHabits() {
  const saved = loadHabitsFromStorage();
  if (saved && Array.isArray(saved)) {
    habitsData = ensureUniqueIds(saved.map(normalizeHabit), createHabitId);
  } else {
    habitsData = habitsData.map(normalizeHabit);
  }
}

/**
 * New day: reset daily completed + coding minutes.
 * Does NOT reset streak / lastCompletedDate.
 */
export function checkAndResetForNewDay() {
  const today = toDateKey(new Date());
  const last = localStorage.getItem("lastActiveDate");
  const isNewDay = Boolean(last && last !== today);

  if (isNewDay) {
    habitsData = habitsData.map((habit) => ({
      ...habit,
      completed: false,
    }));
    saveHabitsToStorage(habitsData);
    localStorage.setItem("todayMinutes", "0");
  }

  localStorage.setItem("lastActiveDate", today);
  return isNewDay;
}

export function setSearchText(value) {
  searchText = value;
}

export function setSortOption(value) {
  sortOption = value;
}

export function getVisibleHabits() {
  let list;

  if (!searchText.trim()) {
    list = [...habitsData];
  } else {
    list = habitsData.filter((habit) =>
      habit.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }

  if (statusFilter === "completed") {
    list = list.filter((h) => h.completed);
  } else if (statusFilter === "remaining") {
    list = list.filter((h) => !h.completed);
  }

  if (sortOption === "az") {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortOption === "completed") {
    return list.sort((a, b) => Number(b.completed) - Number(a.completed));
  }

  if (sortOption === "remaining") {
    return list.sort((a, b) => Number(a.completed) - Number(b.completed));
  }

  return list;
}

/** Day 37: returns { ok, error } instead of calling alert() */
export function addHabit(name) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: null };

  const id = createHabitId();

  const exists = habitsData.some(
    (h) => h.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) {
    return { ok: false, error: "This habit already exists." };
  }

  habitsData = [
    ...habitsData,
    {
      id,
      name: trimmed,
      completed: false,
      streak: 0,
      lastCompletedDate: null,
    },
  ];
  saveHabitsToStorage(habitsData);
  return { ok: true };
}

export function deleteHabit(id) {
  const habit = habitsData.find((h) => h.id === id);
  if (!habit) return false;

  if (undoTimeoutId !== null) {
    clearTimeout(undoTimeoutId);
    undoTimeoutId = null;
  }

  recentlyDeletedHabit = { ...habit };
  habitsData = habitsData.filter((h) => h.id !== id);
  saveHabitsToStorage(habitsData);

  undoTimeoutId = setTimeout(() => {
    recentlyDeletedHabit = null;
    undoTimeoutId = null;
    hideUndoToast();
  }, 5000);

  showUndoToast();
  return true;
}

export function undoDelete() {
  if (!recentlyDeletedHabit) return false;

  if (undoTimeoutId !== null) {
    clearTimeout(undoTimeoutId);
    undoTimeoutId = null;
  }

  const restored = normalizeHabit(recentlyDeletedHabit);
  recentlyDeletedHabit = null;

  const exists = habitsData.some((h) => h.id === restored.id);
  if (!exists) {
    habitsData = [...habitsData, restored];
    saveHabitsToStorage(habitsData);
  }

  hideUndoToast();
  return true;
}

function showUndoToast() {
  const toast = document.getElementById("undo-toast");
  if (toast) toast.hidden = false;
}

function hideUndoToast() {
  const toast = document.getElementById("undo-toast");
  if (toast) toast.hidden = true;
}

/** Day 37: inline rename (no prompt), returns { ok, error } */
export function renameHabit(id, newName) {
  const habit = habitsData.find((h) => h.id === id);
  if (!habit) return { ok: false, error: null };

  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { ok: false, error: "Habit name cannot be empty." };
  }

  const nameExists = habitsData.some(
    (h) => h.id !== id && h.name.toLowerCase() === trimmedName.toLowerCase(),
  );
  if (nameExists) {
    return { ok: false, error: "This habit name already exists." };
  }

  habitsData = habitsData.map((h) => {
    if (h.id === id) return { ...h, name: trimmedName };
    return h;
  });

  saveHabitsToStorage(habitsData);
  return { ok: true };
}

/** Toggle complete + streak rules (Day 33) */
export function updateHabit(id) {
  habitsData = habitsData.map((h) => {
    if (h.id !== id) return h;
    const markingComplete = !h.completed;
    return applyCompletionTransition(h, markingComplete);
  });

  saveHabitsToStorage(habitsData);
}

export function resetHabits() {
  habitsData = habitsData.map((h) => ({ ...h, completed: false }));
  saveHabitsToStorage(habitsData);
}

export function getHabitsForExport() {
  return habitsData.map((h) => ({
    id: h.id,
    name: h.name,
    completed: h.completed,
    streak: h.streak ?? 0,
    lastCompletedDate: h.lastCompletedDate ?? null,
  }));
}

export function importHabitsFromData(data) {
  if (!Array.isArray(data)) {
    return { ok: false, error: "File must contain a JSON array." };
  }

  for (const item of data) {
    if (
      !item ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.completed !== "boolean"
    ) {
      return {
        ok: false,
        error:
          "Each habit needs id (string), name (string), completed (boolean).",
      };
    }
  }

  habitsData = ensureUniqueIds(data.map(normalizeHabit), createHabitId);
  saveHabitsToStorage(habitsData);
  return { ok: true };
}
