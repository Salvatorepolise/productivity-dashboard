/**
 * Pure habit logic — no DOM, no localStorage.
 * Habit shape: { id: string, name: string, completed: boolean }
 * Contract aligned with day-19-typescript/types.ts
 */

export function getHabitStats(habits) {
  const total = habits.length;
  const completed = habits.filter((h) => h.completed).length;

  return {
    total,
    completed,
    remaining: total - completed,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getHabitInsightMessage(habits) {
  const { total, percentage } = getHabitStats(habits);

  if (total === 0) {
    return "Add your first habit to get started.";
  }

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

export function getCompletedHabits(habits) {
  return habits.filter((h) => h.completed);
}

export function getRemainingHabits(habits) {
  return habits.filter((h) => !h.completed);
}
