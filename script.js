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

// Notes (se scrivo note sul sito rimangono salvate in locale)
const notesTextarea = document.getElementById("notes");

const savedNotes = localStorage.getItem("notes");
if (savedNotes) {
  notesTextarea.value = savedNotes;
}

notesTextarea.addEventListener("input", () => {
  localStorage.setItem("notes", notesTextarea.value);
});

renderGoals();
