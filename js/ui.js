import { habitsData, getVisibleHabits } from "./state.js";
import {
  getHabitStats,
  getHabitInsightMessage,
  getCurrentStreak,
} from "./habits-logic.js";

// Day 37: id of the habit being renamed inline (null = none)
let editingHabitId = null;

export function startEditingHabit(id) {
  editingHabitId = id;
  renderHabits();
  const input = document.querySelector(".habit-edit-input");
  if (input) {
    input.focus();
    input.select();
  }
}

export function stopEditingHabit() {
  editingHabitId = null;
}

// Day 37: non-blocking message instead of alert()
let messageTimeoutId = null;

export function showMessage(text) {
  const toast = document.getElementById("message-toast");
  if (!toast) return;

  toast.textContent = text;
  toast.hidden = false;

  clearTimeout(messageTimeoutId);
  messageTimeoutId = setTimeout(() => {
    toast.hidden = true;
  }, 3500);
}

function renderEditRow(habit) {
  const wrapper = document.createElement("div");
  wrapper.className = "habit-row habit-row-editing";

  const input = document.createElement("input");
  input.type = "text";
  input.value = habit.name;
  input.className = "habit-edit-input";
  input.dataset.id = habit.id;
  input.setAttribute("aria-label", "Habit name");

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.className = "save-habit-btn";
  saveBtn.dataset.id = habit.id;

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.className = "cancel-edit-btn";
  cancelBtn.dataset.id = habit.id;

  wrapper.appendChild(input);
  wrapper.appendChild(saveBtn);
  wrapper.appendChild(cancelBtn);
  return wrapper;
}

export function renderHabits() {
  const container = document.getElementById("habits");
  container.innerHTML = "";

  const visibleHabits = getVisibleHabits();

  if (visibleHabits.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No habits found";
    emptyMessage.className = "empty-message";
    container.appendChild(emptyMessage);
    return;
  }

  visibleHabits.forEach((habit) => {
    if (habit.id === editingHabitId) {
      container.appendChild(renderEditRow(habit));
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "habit-row";

    const label = document.createElement("label");
    label.className = "habit-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;
    checkbox.dataset.id = habit.id;
    checkbox.className = "habit-checkbox";

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + habit.name));

    // Day 33 — streak (Day 36: hide broken streaks)
    const streak = getCurrentStreak(habit);
    if (streak > 0) {
      const streakSpan = document.createElement("span");
      streakSpan.className = "habit-streak";
      streakSpan.textContent = ` 🔥 ${streak}`;
      label.appendChild(streakSpan);
    }

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-habit-btn";
    editBtn.dataset.id = habit.id;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-habit-btn";
    deleteBtn.dataset.id = habit.id;

    wrapper.appendChild(label);
    wrapper.appendChild(editBtn);
    wrapper.appendChild(deleteBtn);
    container.appendChild(wrapper);
  });
}

function updateStatistics() {
  const stats = getHabitStats(habitsData);

  document.getElementById("total-habits").textContent = stats.total;
  document.getElementById("completed-habits").textContent = stats.completed;
  document.getElementById("remaining-habits").textContent = stats.remaining;
  document.getElementById("progress-percentage").textContent =
    `${stats.percentage}%`;
}

function updateInsight() {
  const insightEl = document.getElementById("habit-insight");
  if (!insightEl) return;

  insightEl.textContent = getHabitInsightMessage(habitsData);
}

export function updateProgress() {
  const stats = getHabitStats(habitsData);

  document.getElementById("progress-text").textContent =
    `Progress: ${stats.completed}/${stats.total} completed`;

  const bar = document.getElementById("habits-progress-bar");
  if (bar) bar.style.width = stats.percentage + "%";

  document.getElementById("completed-count").textContent = stats.completed;
  document.getElementById("remaining-count").textContent = stats.remaining;

  const messageEl = document.getElementById("habit-message");

  if (stats.total === 0) {
    messageEl.textContent = "Add your first habit";
  } else if (stats.completed === 0) {
    messageEl.textContent = "Start your day! 🚀";
  } else if (stats.completed === stats.total) {
    messageEl.textContent = "Everything done! 🔥";
  } else {
    messageEl.textContent = "Good progress! 💪";
  }

  updateStatistics();
  updateInsight();
}

export function renderGoals(goals, goalsList) {
  goalsList.innerHTML = "";
  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${goal}`;
    goalsList.appendChild(li);
  });
}
