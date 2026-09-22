import { habitsData, getVisibleHabits } from "./state.js";

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
  const total = habitsData.length;

  const completed = habitsData.reduce((count, habit) => {
    return habit.completed ? count + 1 : count;
  }, 0);

  const remaining = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("total-habits").textContent = total;
  document.getElementById("completed-habits").textContent = completed;
  document.getElementById("remaining-habits").textContent = remaining;
  document.getElementById("progress-percentage").textContent = `${percentage}%`;
}

function getHabitInsight() {
  const total = habitsData.length;

  if (total === 0) {
    return "Add your first habit to get started.";
  }

  const completed = habitsData.reduce((count, habit) => {
    return habit.completed ? count + 1 : count;
  }, 0);

  const percentage = Math.round((completed / total) * 100);

  if (percentage === 0) {
    return "Start your day by completing your first habit.";
  }

  if (percentage < 50) {
    return "Keep going — small steps still count.";
  }

  if (percentage < 100) {
    return "You're more than halfway. Finish strong.";
  }

  return "All habits completed today. Great work!";
}

function updateInsight() {
  const insightEl = document.getElementById("habit-insight");
  if (!insightEl) return;
  insightEl.textContent = getHabitInsight();
}

export function updateProgress() {
  const total = habitsData.length;

  const completed = habitsData.reduce((count, habit) => {
    return habit.completed ? count + 1 : count;
  }, 0);

  const remaining = total - completed;
  const percentage = total === 0 ? 0 : (completed / total) * 100;

  document.getElementById("progress-text").textContent =
    `Progress: ${completed}/${total} completed`;

  const bar = document.getElementById("habits-progress-bar");
  if (bar) bar.style.width = percentage + "%";

  document.getElementById("completed-count").textContent = completed;
  document.getElementById("remaining-count").textContent = remaining;

  const messageEl = document.getElementById("habit-message");

  if (total === 0) {
    messageEl.textContent = "Add your first habit";
  } else if (!habitsData.some((h) => h.completed)) {
    messageEl.textContent = "Start your day! 🚀";
  } else if (habitsData.every((h) => h.completed)) {
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
