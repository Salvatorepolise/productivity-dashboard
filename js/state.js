import { loadHabitsFromStorage, saveHabitsToStorage } from "./storage.js";

export let habitsData = [
  { id: "english", name: "English", completed: false },
  { id: "coding", name: "Coding", completed: false },
  { id: "reading", name: "Reading", completed: false },
  { id: "exercise", name: "Exercise", completed: false },
];

export let searchText = "";
export let sortOption = "default";
export let statusFilter = "all"; // "all" | "completed" | "remaining"

export function setStatusFilter(value) {
  statusFilter = value;
}
/** Temporary state — last deleted habit only (not in localStorage) */
let recentlyDeletedHabit = null;
let undoTimeoutId = null;

export function initHabits() {
  const saved = loadHabitsFromStorage();
  if (saved) {
    habitsData = saved;
  }
}

export function setSearchText(value) {
  searchText = value;
}

export function setSortOption(value) {
  sortOption = value;
}

export function getVisibleHabits() {
  let list;

  // 1. Search (non muta habitsData)
  if (!searchText.trim()) {
    list = [...habitsData];
  } else {
    list = habitsData.filter((habit) =>
      habit.name.toLowerCase().includes(searchText.toLowerCase()),
    );
  }

  // 2. Status filter (Day 27)
  if (statusFilter === "completed") {
    list = list.filter((h) => h.completed);
  } else if (statusFilter === "remaining") {
    list = list.filter((h) => !h.completed);
  }

  // 3. Sort
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

export function addHabit(name) {
  const trimmed = name.trim();
  if (!trimmed) return false;

  const id = trimmed.toLowerCase().replace(/\s+/g, "-");

  const exists = habitsData.some(
    (h) => h.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) {
    alert("This habit already exists");
    return false;
  }

  habitsData = [...habitsData, { id, name: trimmed, completed: false }];
  saveHabitsToStorage(habitsData);
  return true;
}

/**
 * Soft delete: keep last deleted habit for undo (5s).
 * Returns true if something was deleted.
 */
export function deleteHabit(id) {
  const habit = habitsData.find((h) => h.id === id);
  if (!habit) return false;

  // Reset previous undo window
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

  const restored = recentlyDeletedHabit;
  recentlyDeletedHabit = null;

  // Avoid duplicate if somehow already back
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

export function editHabit(id) {
  const habit = habitsData.find((h) => h.id === id);
  if (!habit) return;

  const newName = prompt("Enter the new name:", habit.name);
  if (newName === null) return;

  const trimmedName = newName.trim();
  if (!trimmedName) return;

  const nameExists = habitsData.some(
    (h) => h.id !== id && h.name.toLowerCase() === trimmedName.toLowerCase(),
  );
  if (nameExists) {
    alert("This habit name already exists");
    return;
  }

  habitsData = habitsData.map((h) => {
    if (h.id === id) return { ...h, name: trimmedName };
    return h;
  });

  saveHabitsToStorage(habitsData);
}

export function updateHabit(id) {
  habitsData = habitsData.map((h) => {
    if (h.id === id) return { ...h, completed: !h.completed };
    return h;
  });

  saveHabitsToStorage(habitsData);
}

export function resetHabits() {
  habitsData = habitsData.map((h) => ({ ...h, completed: false }));
  saveHabitsToStorage(habitsData);
}
