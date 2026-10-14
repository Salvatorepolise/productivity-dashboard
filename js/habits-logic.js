/**
 * Pure habit logic — no DOM, no localStorage.
 * Habit shape: { id, name, completed, streak, lastCompletedDate }
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

// ===== DATES & STREAKS (Day 37: moved here so they can be tested) =====

/** Local calendar day (not UTC) as "YYYY-MM-DD" */
export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPreviousDateKey(now) {
  const date = new Date(now);
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
}

/**
 * Streak to display: a streak is broken if the habit was not
 * completed today or yesterday (stored value may be stale).
 */
export function getCurrentStreak(habit, now = new Date()) {
  const last = habit.lastCompletedDate;
  if (last === toDateKey(now) || last === getPreviousDateKey(now)) {
    return habit.streak || 0;
  }
  return 0;
}

/**
 * Complete transition: streak increases at most once per local day.
 * Unchecking today undoes today's +1, so a check/uncheck
 * does not count as a completed day.
 */
export function applyCompletionTransition(
  habit,
  markingComplete,
  now = new Date(),
) {
  const today = toDateKey(now);
  const yesterday = getPreviousDateKey(now);

  if (!markingComplete) {
    if (habit.lastCompletedDate !== today) {
      return { ...habit, completed: false };
    }
    // streak > 1 means the previous completion was yesterday
    const streak = Math.max((habit.streak || 0) - 1, 0);
    return {
      ...habit,
      completed: false,
      streak,
      lastCompletedDate: streak > 0 ? yesterday : null,
    };
  }

  // Already counted for today → only ensure completed
  if (habit.lastCompletedDate === today) {
    return { ...habit, completed: true };
  }

  let streak = 1;
  if (habit.lastCompletedDate === yesterday) {
    streak = (habit.streak || 0) + 1;
  }

  return {
    ...habit,
    completed: true,
    streak,
    lastCompletedDate: today,
  };
}

/** Repairs duplicate or missing ids (data saved before Day 36) */
export function ensureUniqueIds(habits, createId) {
  const seen = new Set();
  return habits.map((habit) => {
    if (!habit.id || seen.has(habit.id)) {
      const fixed = { ...habit, id: createId() };
      seen.add(fixed.id);
      return fixed;
    }
    seen.add(habit.id);
    return habit;
  });
}
