const user = {
  name: "Salvatore",
  age: 19,
  goal: "Become a Software Engineer",
  dailyHours: 4,
};

const goals = [
  "Practice English for 1 hour",
  "Study JavaScript fundamentals",
  "Build the productivity dashboard",
];

const goalsList = document.getElementById("goals-list");

function renderGoals() {
  goalsList.innerHTML = "";

  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${goal}`;
    goalsList.appendChild(li);
  });
}

const habits = ["english", "coding", "reading", "exercise"];

habits.forEach((habit) => {
  const checkbox = document.getElementById(`habit-${habit}`);

  const saved = localStorage.getItem(`habit-${habit}`);
  if (saved === "true") {
    checkbox.checked = true;
  }

  checkbox.addEventListener("change", () => {
    localStorage.setItem(`habit-${habit}`, checkbox.checked);
  });
});

const notesTextarea = document.getElementById("notes");

const savedNotes = localStorage.getItem("notes");
if (savedNotes) {
  notesTextarea.value = savedNotes;
}

notesTextarea.addEventListener("input", () => {
  localStorage.setItem("notes", notesTextarea.value);
});

function updateProgress() {
  const checkboxes = document.querySelectorAll(
    `#habits input[type="checkbox"]`,
  );
  let completed = 0;

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      completed++;
    }
  });

  const progressText = document.getElementById("progress-text");
  progressText.textContent = `Progress: ${completed}/4 completed`;
}

// Daily Coding Goal section

const goalMinutes = 60;
const todayInput = document.getElementById("today-input");
const goalEl = document.getElementById("goal-minutes");
const statusEl = document.getElementById("goal-status");
const progressBar = document.getElementById("progress-bar");

const savedMinutes = localStorage.getItem("todayMinutes");
if (savedMinutes !== null) {
  todayInput.value = savedMinutes;
}

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

updateCodingGoal();
updateProgress();
renderGoals();
