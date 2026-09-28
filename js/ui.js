import { habitsData, getVisibleHabits } from "./state.js";
import { getHabitStats, getHabitInsightMessage } from "./habits-logic.js";

export function renderHabits() {
  const container = document.getElementById("habits");
  container.innerHTML = "";

  const visibleHabits = getVisibleHabits();

  if (visibleHabits.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No habits found";
    emptyMessage.style.color = "#71717a";
    emptyMessage.style.fontSize = "0.95rem";
    container.appendChild(emptyMessage);
    return;
  }

  visibleHabits.forEach((habit) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.marginBottom = "6px";
    wrapper.style.gap = "8px";

    const label = document.createElement("label");
    label.style.flex = "1";
    label.style.cursor = "pointer";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.completed;
    checkbox.dataset.id = habit.id;
    checkbox.className = "habit-checkbox";

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + habit.name));

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
