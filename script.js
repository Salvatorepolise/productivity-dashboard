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
const newGoalInput = document.getElementById("new-goal-input");
const addGoalBtn = document.getElementById("add-goal-btn");

function renderGoals() {
  goalsList.innerHTML = "";

  goals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${goal}`;
    goalsList.appendChild(li);
  });
}

function addGoal() {
  const goalText = newGoalInput.value.trim();
  if (goalText === "") return;

  goals.push(goalText);
  renderGoals();
  newGoalInput.value = "";
}

addGoalBtn.addEventListener("click", addGoal);

newGoalInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addGoal();
});

// ===== HABITS (STATE + LOCAL STORAGE) =====
let habitsData = [
  { id: "english", name: "English", completed: false },
  { id: "coding", name: "Coding", completed: false },
  { id: "reading", name: "Reading", completed: false },
  { id: "exercise", name: "Exercise", completed: false },
];

// Carica lo state salvato
const savedHabits = localStorage.getItem("habitsData");
if (savedHabits) {
  habitsData = JSON.parse(savedHabits);
}

function renderHabits() {
  const habitsContainer = document.getElementById("habits");
  habitsContainer.innerHTML = "";

  habitsData.forEach((habit) => {
    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `habit-${habit.id}`;
    checkbox.checked = habit.completed; // usa lo state

    checkbox.addEventListener("change", () => {
      habit.completed = checkbox.checked; // aggiorna lo state
      localStorage.setItem("habitsData", JSON.stringify(habitsData)); // salva tutto l'array
      updateProgress();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + habit.name));

    habitsContainer.appendChild(label);
    habitsContainer.appendChild(document.createElement("br"));
  });
}

function updateProgress() {
  const total = habitsData.length;
  const completed = habitsData.filter((habit) => habit.completed).length;

  const progressText = document.getElementById("progress-text");
  progressText.textContent = `Progress: ${completed}/${total} completed`;

  const habitsProgressBar = document.getElementById("habits-progress-bar");
  if (habitsProgressBar) {
    const percentage = total === 0 ? 0 : (completed / total) * 100;
    habitsProgressBar.style.width = percentage + "%";
  }
}

// ===== NOTES =====
const notesTextarea = document.getElementById("notes");
const savedNotes = localStorage.getItem("notes");
if (savedNotes) {
  notesTextarea.value = savedNotes;
}
notesTextarea.addEventListener("input", () => {
  localStorage.setItem("notes", notesTextarea.value);
});

// ===== DAILY CODING GOAL =====
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

// ===== DAILY CODING TRACKER =====
const codingMinutesInput = document.getElementById("coding-minutes");
const dailyGoalInput = document.getElementById("daily-goal");
const checkGoalBtn = document.getElementById("check-goal-btn");
const goalResult = document.getElementById("goal-result");
const goalSummary = document.getElementById("goal-summary");

function checkGoal() {
  const codingMinutes = Number(codingMinutesInput.value) || 0;
  const dailyGoal = Number(dailyGoalInput.value) || 60;

  goalSummary.textContent = `${codingMinutes} / ${dailyGoal} minutes`;

  if (codingMinutes >= dailyGoal) {
    goalResult.textContent = "Goal reached ✅";
    goalResult.style.color = "#16a34a";
  } else {
    goalResult.textContent = "Goal not reached ❌";
    goalResult.style.color = "#dc2626";
  }
}

checkGoalBtn.addEventListener("click", checkGoal);

const savedCodingMinutes = localStorage.getItem("codingMinutes");
const savedDailyGoal = localStorage.getItem("dailyGoal");

if (savedCodingMinutes !== null) codingMinutesInput.value = savedCodingMinutes;
if (savedDailyGoal !== null) dailyGoalInput.value = savedDailyGoal;

codingMinutesInput.addEventListener("input", () => {
  localStorage.setItem("codingMinutes", codingMinutesInput.value);
});
dailyGoalInput.addEventListener("input", () => {
  localStorage.setItem("dailyGoal", dailyGoalInput.value);
});

// ===== INIT =====
renderHabits();
updateProgress();
checkGoal();
updateCodingGoal();
renderGoals();
