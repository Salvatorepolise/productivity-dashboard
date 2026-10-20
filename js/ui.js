import { habitsData, getVisibleHabits } from "./state.js";
import {
  getHabitStats,
  getHabitInsightMessage,
  getCurrentStreak,
  getLastDays,
} from "./habits-logic.js";
import { getGoalStats } from "./goals-logic.js";
import {
  getLastDaysMinutes,
  getWeekSummary,
  formatMinutes,
} from "./coding-logic.js";

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

// Day 38: one undo toast for habits and goals
let undoAction = null;
let undoTimeoutId = null;

export function showUndoToast(message, onUndo) {
  const toast = document.getElementById("undo-toast");
  if (!toast) return;

  document.getElementById("undo-message").textContent = message;
  undoAction = onUndo;
  toast.hidden = false;

  clearTimeout(undoTimeoutId);
  undoTimeoutId = setTimeout(hideUndoToast, 5000);
}

export function hideUndoToast() {
  const toast = document.getElementById("undo-toast");
  if (toast) toast.hidden = true;
  undoAction = null;
  clearTimeout(undoTimeoutId);
}

export function runUndo() {
  const action = undoAction;
  hideUndoToast();
  if (action) action();
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

/** Day 42: last 7 days as dots, oldest on the left */
function renderWeek(habit) {
  const days = getLastDays(habit);
  const doneCount = days.filter((day) => day.done).length;

  const week = document.createElement("span");
  week.className = "habit-week";
  week.setAttribute("role", "img");
  week.setAttribute(
    "aria-label",
    `${habit.name}: done ${doneCount} of the last 7 days`,
  );

  days.forEach((day) => {
    const dot = document.createElement("span");
    dot.className = "day-dot";
    if (day.done) dot.classList.add("done");
    if (day.isToday) dot.classList.add("today");
    dot.title = `${day.dateKey}: ${day.done ? "done" : "not done"}`;
    week.appendChild(dot);
  });

  return week;
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
    editBtn.setAttribute("aria-label", `Edit habit: ${habit.name}`);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-habit-btn";
    deleteBtn.dataset.id = habit.id;
    deleteBtn.setAttribute("aria-label", `Delete habit: ${habit.name}`);

    wrapper.appendChild(label);
    wrapper.appendChild(renderWeek(habit));
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

/** Day 38: goals can be checked off and deleted */
export function renderGoals(goals) {
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";

  if (goals.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = "No goals for today yet";
    goalsList.appendChild(empty);
  }

  goals.forEach((goal) => {
    const li = document.createElement("li");
    li.className = goal.completed ? "goal-row goal-completed" : "goal-row";

    const label = document.createElement("label");
    label.className = "goal-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = goal.completed;
    checkbox.className = "goal-checkbox";
    checkbox.dataset.id = goal.id;

    const text = document.createElement("span");
    text.className = "goal-text";
    text.textContent = goal.text;

    label.appendChild(checkbox);
    label.appendChild(text);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-goal-btn";
    deleteBtn.dataset.id = goal.id;
    deleteBtn.setAttribute("aria-label", `Delete goal: ${goal.text}`);

    li.appendChild(label);
    li.appendChild(deleteBtn);
    goalsList.appendChild(li);
  });

  const { total, completed } = getGoalStats(goals);
  document.getElementById("goals-progress").textContent =
    total === 0 ? "" : `${completed}/${total} done`;
}

/** Day 43: last 7 days of coding as bars, oldest on the left */
export function renderCodingWeek(log, goalMinutes) {
  const chart = document.getElementById("coding-week");
  const summaryEl = document.getElementById("coding-week-summary");
  if (!chart || !summaryEl) return;

  const days = getLastDaysMinutes(log);
  // Scale to the goal, or to the best day if it went above the goal
  const scale = Math.max(goalMinutes, ...days.map((day) => day.minutes));

  chart.innerHTML = "";
  days.forEach((day) => {
    const column = document.createElement("div");
    column.className = "coding-day";
    if (day.isToday) column.classList.add("today");

    const track = document.createElement("div");
    track.className = "coding-bar-track";

    const bar = document.createElement("div");
    bar.className = "coding-bar";
    if (day.minutes >= goalMinutes) bar.classList.add("goal-met");
    bar.style.height = `${Math.round((day.minutes / scale) * 100)}%`;

    const weekday = new Date(`${day.dateKey}T12:00:00`).toLocaleDateString("en", {
      weekday: "narrow",
    });
    const label = document.createElement("span");
    label.className = "coding-day-label";
    label.textContent = weekday;

    column.title = `${day.dateKey}: ${formatMinutes(day.minutes)}`;
    track.appendChild(bar);
    column.appendChild(track);
    column.appendChild(label);
    chart.appendChild(column);
  });

  const { total, goalDays } = getWeekSummary(log, goalMinutes);
  chart.setAttribute(
    "aria-label",
    `Coding last 7 days: ${formatMinutes(total)}, goal reached on ${goalDays} of 7 days`,
  );
  summaryEl.textContent = `Last 7 days: ${formatMinutes(total)} · goal reached ${goalDays}/7`;
}
