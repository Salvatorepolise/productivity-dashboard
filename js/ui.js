import { habitsData, getVisibleHabits } from "./state.js";
import {
  getHabitStats,
  getHabitInsightMessage,
  getCurrentStreak,
  getLastDays,
} from "./habits-logic.js";
import { getGoalStats, filterGoals } from "./goals-logic.js";
import {
  getLastDaysMinutes,
  getWeekSummary,
  formatMinutes,
} from "./coding-logic.js";
import {
  getDashboardWeekSummary,
  formatWeekRange,
  getWeekAwareInsight,
} from "./week-summary-logic.js";
import { codingLog } from "./coding.js";
import { getPreferences } from "./preferences.js";

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

  // Day 45: week-aware when useful, else daily message
  insightEl.textContent = getWeekAwareInsight(
    habitsData,
    codingLog,
    getPreferences().codingGoalMinutes,
  );
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

/** Day 44: calendar week Mon–Sun */
export function renderWeekSummary(
  habits,
  codingLogArg,
  goalMinutes,
  now = new Date(),
) {
  const rangeEl = document.getElementById("week-summary-range");
  const habitsEl = document.getElementById("week-summary-habits");
  const codingEl = document.getElementById("week-summary-coding");
  if (!rangeEl || !habitsEl || !codingEl) return;

  const summary = getDashboardWeekSummary(
    habits,
    codingLogArg,
    goalMinutes,
    now,
  );

  rangeEl.textContent = formatWeekRange(summary.weekStart, summary.weekEnd);

  const h = summary.habits;
  habitsEl.textContent =
    h.possibleSlots === 0
      ? "Habits: no habits yet"
      : `Habits: ${h.completedSlots}/${h.possibleSlots} slots (${h.percentage}%)`;

  const c = summary.coding;
  codingEl.textContent = `Coding: ${c.formattedTotal} · goal met ${c.goalDays}/${c.daysElapsed} days`;
}

export function renderGoals(goals, editingId = null) {
  const goalsList = document.getElementById("goals-list");
  goalsList.innerHTML = "";
  const status = getPreferences().goalStatusFilter;
  document.getElementById("goal-status-filter").value = status;
  const searchText = document.getElementById("search-goal-input").value;
  document.getElementById("clear-goal-search-btn").disabled = searchText.length === 0;
  const visibleGoals = filterGoals(goals, status, searchText);

  if (visibleGoals.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = goals.length === 0
      ? "No goals for today yet"
      : searchText.trim() ? "No goals match your search and filter"
      : status === "completed" ? "No completed goals yet" : "No active goals left";
    goalsList.appendChild(empty);
  }

  visibleGoals.forEach((goal) => {
    const li = document.createElement("li");
    li.className = goal.completed ? "goal-row goal-completed" : "goal-row";

    if (goal.id === editingId) {
      li.className = "goal-row goal-row-editing";
      const input = document.createElement("input");
      input.type = "text";
      input.value = goal.text;
      input.className = "goal-edit-input";
      input.dataset.id = goal.id;
      input.setAttribute("aria-label", "Goal text");
      li.appendChild(input);
      for (const action of ["Save", "Cancel"]) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = action;
        button.className = `${action.toLowerCase()}-goal-btn btn btn-secondary btn-sm`;
        button.dataset.id = goal.id;
        li.appendChild(button);
      }
      goalsList.appendChild(li);
      return;
    }

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

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.className = "edit-goal-btn btn btn-secondary btn-sm";
    editBtn.dataset.id = goal.id;
    editBtn.setAttribute("aria-label", `Edit goal: ${goal.text}`);

    li.appendChild(label);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    goalsList.appendChild(li);
  });

  const { total, completed } = getGoalStats(goals);
  document.getElementById("goals-progress").textContent =
    total === 0 ? "" : `${completed}/${total} done` +
      (searchText.trim() || status !== "all" ? ` · ${visibleGoals.length} shown` : "");
}

export function renderCodingWeek(log, goalMinutes) {
  const chart = document.getElementById("coding-week");
  const summaryEl = document.getElementById("coding-week-summary");
  if (!chart || !summaryEl) return;

  const days = getLastDaysMinutes(log);
  const scale = Math.max(goalMinutes, ...days.map((day) => day.minutes), 1);

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

    const weekday = new Date(`${day.dateKey}T12:00:00`).toLocaleDateString(
      "en",
      { weekday: "narrow" },
    );
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
