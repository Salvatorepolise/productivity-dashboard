import { loadHabitsFromStorage, saveHabitsToStorage } from "./storage.js";

export let habitsData = [
  { id: "english", name: "English", completed: false },
  { id: "coding", name: "Coding", completed: false },
  { id: "reading", name: "Reading", completed: false },
  { id: "exercise", name: "Exercise", completed: false },
];

export let searchText = "";
export let sortOption = "default";

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

  if (!searchText.trim()) {
    list = [...habitsData];
  } else {
    list = habitsData.filter((habit) =>
      habit.name.toLowerCase().includes(searchText.toLowerCase()),
    );
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

export function deleteHabit(id) {
  habitsData = habitsData.filter((habit) => habit.id !== id);
  saveHabitsToStorage(habitsData);
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
