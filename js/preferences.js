/**
 * UserPreferences:
 * {
 *   temperatureUnit: "celsius" | "fahrenheit",
 *   compactMode: boolean,
 *   theme: "light" | "dark",
 *   codingGoalMinutes: number (Day 38)
 * }
 */

export const defaultPreferences = {
  temperatureUnit: "celsius",
  compactMode: false,
  theme: "light",
  codingGoalMinutes: 60,
};

let preferences = { ...defaultPreferences };

export function getPreferences() {
  return preferences;
}

export function loadPreferences() {
  const saved = localStorage.getItem("userPreferences");

  if (!saved) {
    preferences = { ...defaultPreferences };
    return preferences;
  }

  try {
    const parsed = JSON.parse(saved);
    preferences = {
      ...defaultPreferences,
      ...parsed,
    };

    const goal = preferences.codingGoalMinutes;
    if (!Number.isInteger(goal) || goal < 1 || goal > 600) {
      preferences.codingGoalMinutes = defaultPreferences.codingGoalMinutes;
    }
  } catch (error) {
    console.error("Failed to load preferences:", error);
    preferences = { ...defaultPreferences };
  }

  return preferences;
}

export function savePreferences(next) {
  preferences = {
    ...preferences,
    ...next,
  };
  localStorage.setItem("userPreferences", JSON.stringify(preferences));
  return preferences;
}

export function applyCompactMode() {
  document.body.classList.toggle("compact", preferences.compactMode);
}

export function applyTheme() {
  document.body.classList.toggle("dark", preferences.theme === "dark");
}

/** Apply all visual preferences after load */
export function applyPreferencesToUI() {
  applyCompactMode();
  applyTheme();
}
