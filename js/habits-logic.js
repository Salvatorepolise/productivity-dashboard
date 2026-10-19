/**
 * Pure habit logic — no DOM, no localStorage.
 * Habit shape: { id, name, completed, streak, lastCompletedDate, history }
 * history: completed days as "YYYY-MM-DD", last HISTORY_DAYS days (Day 42)
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
  return toDateKey(addDays(now, -1));
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** "YYYY-MM-DD" → local Date at midnight */
export function fromDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isValidDateKey(key) {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false;
  }
  // Rejects impossible dates like 2026-02-31
  return toDateKey(fromDateKey(key)) === key;
}

// ===== HISTORY (Day 42) =====

/** Completed days are kept for this many days (today included) */
export const HISTORY_DAYS = 30;

/** Unique, sorted, only days inside the history window */
export function trimHistory(history, now) {
  const today = toDateKey(now);
  const oldest = toDateKey(addDays(now, -(HISTORY_DAYS - 1)));
  return [...new Set(history)]
    .filter((key) => key >= oldest && key <= today)
    .sort();
}

/**
 * Data saved before Day 42 has no history, but the streak tells us
 * that the last `streak` days up to lastCompletedDate were completed.
 */
export function deriveHistoryFromStreak(habit) {
  if (!isValidDateKey(habit.lastCompletedDate)) return [];

  const last = fromDateKey(habit.lastCompletedDate);
  const days = Math.min(Math.max(habit.streak || 0, 1), HISTORY_DAYS);

  const history = [];
  for (let i = days - 1; i >= 0; i--) {
    history.push(toDateKey(addDays(last, -i)));
  }
  return history;
}

export function normalizeHistory(habit, now = new Date()) {
  const raw = Array.isArray(habit.history)
    ? habit.history.filter(isValidDateKey)
    : deriveHistoryFromStreak(habit);
  return trimHistory(raw, now);
}

/** Last `days` days, oldest first: [{ dateKey, done, isToday }] */
export function getLastDays(habit, now = new Date(), days = 7) {
  const done = new Set(habit.history || []);
  const today = toDateKey(now);

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const dateKey = toDateKey(addDays(now, -i));
    result.push({ dateKey, done: done.has(dateKey), isToday: dateKey === today });
  }
  return result;
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
  const history = habit.history || [];

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
      history: history.filter((key) => key !== today),
    };
  }

  // Day 42: today goes into the history (at most once)
  const nextHistory = trimHistory([...history, today], now);

  // Already counted for today → only ensure completed
  if (habit.lastCompletedDate === today) {
    return { ...habit, completed: true, history: nextHistory };
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
    history: nextHistory,
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
